"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../_components/navbar/Navbar";
import {
  CATALOG_CORE_FIELD_KEYS,
  CATALOG_SYSTEM_FIELD_KEYS,
} from "@/lib/catalogProductConstants";
import {
  fetchCatalogProducts,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
} from "@/lib/api";
import { Container, Form, Alert } from "react-bootstrap";
import Button from "@leafygreen-ui/button";
import { H2, Body } from "@leafygreen-ui/typography";
import { SearchInput } from "@leafygreen-ui/search-input";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import styles from "./catalogEdit.module.css";

function parseExtraValue(raw) {
  const t = raw.trim();
  if (!t) return "";
  try {
    const parsed = JSON.parse(t);
    if (parsed !== null && typeof parsed === "object") return parsed;
    return parsed;
  } catch {
    return raw;
  }
}

function productToExtraRows(product) {
  const rows = [];
  for (const k of Object.keys(product)) {
    if (CATALOG_CORE_FIELD_KEYS.has(k) || CATALOG_SYSTEM_FIELD_KEYS.has(k)) {
      continue;
    }
    const v = product[k];
    const str =
      v !== null && typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
    rows.push({
      id: `${k}-${rows.length}`,
      key: k,
      value: str,
    });
  }
  return rows;
}

const emptyForm = () => ({
  name: "",
  description: "",
  brand: "Unknown",
  masterCategory: "uncategorized",
  subCategory: "general",
  articleType: "",
  priceAmount: "0",
  priceCurrency: "USD",
  imageUrl: "",
});

export default function CatalogEditPage() {
  const selectedUser = useSelector((s) => s.User.selectedUser);
  const actingUserId = selectedUser?._id != null ? String(selectedUser._id) : null;
  const isOwner = selectedUser?.type === "owner";

  const [list, setList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [extraRows, setExtraRows] = useState([]);
  const [initialExtraKeys, setInitialExtraKeys] = useState(() => new Set());

  const [detailLoading, setDetailLoading] = useState(false);
  const [saveState, setSaveState] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const loadList = useCallback(async () => {
    if (!actingUserId || !isOwner) return;
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchCatalogProducts(actingUserId);
      setList(data.products || []);
    } catch (e) {
      setListError(e.message || "Failed to load products");
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, [actingUserId, isOwner]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const applyProductToForm = useCallback((product) => {
    setForm({
      name: product.name ?? "",
      description: product.description ?? "",
      brand: product.brand ?? "Unknown",
      masterCategory: product.masterCategory ?? "uncategorized",
      subCategory: product.subCategory ?? "general",
      articleType: product.articleType ?? "",
      priceAmount: String(product.price?.amount ?? 0),
      priceCurrency: product.price?.currency ?? "USD",
      imageUrl: product.image?.url ?? "",
    });
    const rows = productToExtraRows(product);
    setExtraRows(rows);
    setInitialExtraKeys(new Set(rows.map((r) => r.key)));
  }, []);

  const selectProduct = async (productId) => {
    if (!actingUserId) return;
    setSelectedId(productId);
    setIsNew(false);
    setSaveState(null);
    setDeleteError(null);
    setDetailLoading(true);
    try {
      const data = await fetchCatalogProducts(actingUserId, productId);
      if (data.product) applyProductToForm(data.product);
    } catch (e) {
      setSaveState({ variant: "danger", text: e.message || "Load failed" });
    } finally {
      setDetailLoading(false);
    }
  };

  const startNew = () => {
    setSelectedId(null);
    setIsNew(true);
    setForm(emptyForm());
    setExtraRows([]);
    setInitialExtraKeys(new Set());
    setSaveState(null);
    setDeleteError(null);
  };

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      return name.includes(q) || brand.includes(q);
    });
  }, [list, search]);

  const buildExtrasObject = () => {
    const out = {};
    const seen = new Set();
    for (const row of extraRows) {
      const k = row.key.trim();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out[k] = parseExtraValue(row.value);
    }
    return out;
  };

  const handleSave = async () => {
    if (!actingUserId) return;
    setSaveState(null);
    const priceAmount = Number(form.priceAmount);
    const core = {
      name: form.name.trim() || "Untitled",
      description: form.description,
      brand: form.brand,
      masterCategory: form.masterCategory,
      subCategory: form.subCategory,
      articleType: form.articleType,
      price: {
        amount: Number.isFinite(priceAmount) ? priceAmount : 0,
        currency: form.priceCurrency || "USD",
      },
      image: { url: form.imageUrl },
    };
    const extras = buildExtrasObject();

    try {
      if (isNew) {
        const created = await createCatalogProduct(actingUserId, {
          ...core,
          ...extras,
        });
        setSaveState({ variant: "success", text: "Product created." });
        setIsNew(false);
        setSelectedId(created._id);
        await loadList();
        applyProductToForm(created);
        setInitialExtraKeys(new Set(Object.keys(extras)));
      } else if (selectedId) {
        const currentExtraKeys = new Set(
          extraRows.map((r) => r.key.trim()).filter(Boolean)
        );
        const unsetKeys = [...initialExtraKeys].filter(
          (k) => !currentExtraKeys.has(k)
        );
        await updateCatalogProduct(
          actingUserId,
          selectedId,
          { ...core, ...extras },
          unsetKeys.length ? unsetKeys : undefined
        );
        setSaveState({ variant: "success", text: "Saved." });
        setInitialExtraKeys(new Set(currentExtraKeys));
        await loadList();
      }
    } catch (e) {
      setSaveState({ variant: "danger", text: e.message || "Save failed" });
    }
  };

  const handleDelete = async () => {
    if (!actingUserId || !selectedId || isNew) return;
    if (!window.confirm("Delete this product permanently?")) return;
    setDeleteError(null);
    try {
      await deleteCatalogProduct(actingUserId, selectedId);
      setSelectedId(null);
      setForm(emptyForm());
      setExtraRows([]);
      setInitialExtraKeys(new Set());
      await loadList();
      setSaveState({ variant: "success", text: "Product deleted." });
    } catch (e) {
      setDeleteError(e.message || "Delete failed");
    }
  };

  if (!isOwner) {
    return (
      <main>
        <Navbar />
        <LeafyGreenProvider>
          <Container className="py-5">
            <Alert variant="secondary">
              <Alert.Heading>Catalog editing is restricted</Alert.Heading>
              <p className="mb-0">
                Switch to the <strong>Store Owner</strong> account in the profile
                menu. If you have not seeded the owner user, run{" "}
                <code>npm run seed:owner</code> from the project root (requires{" "}
                <code>MONGODB_URI</code> and <code>DATABASE_NAME</code>).
              </p>
            </Alert>
          </Container>
        </LeafyGreenProvider>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <LeafyGreenProvider>
      <Container fluid className="py-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <H2>Edit catalog</H2>
          <Button variant="primary" onClick={startNew}>
            New product
          </Button>
        </div>

        <div className={styles.layout}>
          <div className={styles.listPanel}>
            <SearchInput
              aria-label="Filter products"
              placeholder="Search by name or brand"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSubmit={(e) => e.preventDefault()}
              className="mb-2"
            />
            {listLoading && <Body>Loading…</Body>}
            {listError && <Alert variant="danger">{listError}</Alert>}
            {!listLoading &&
              filteredList.map((p) => {
                const id = String(p._id);
                const active = id === selectedId && !isNew;
                return (
                  <div
                    key={id}
                    role="button"
                    tabIndex={0}
                    className={`${styles.listItem} ${active ? styles.listItemActive : ""}`}
                    onClick={() => selectProduct(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectProduct(id);
                      }
                    }}
                  >
                    <strong>{p.name || "(no name)"}</strong>
                    <div className="small text-muted">
                      {p.brand} ·{" "}
                      {p.price?.amount != null
                        ? `${p.price.amount} ${p.price.currency || ""}`
                        : ""}
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={styles.formPanel}>
            {saveState && (
              <Alert
                variant={saveState.variant}
                dismissible
                onClose={() => setSaveState(null)}
                className="mb-3"
              >
                {saveState.text}
              </Alert>
            )}
            {deleteError && (
              <Alert variant="danger" dismissible onClose={() => setDeleteError(null)}>
                {deleteError}
              </Alert>
            )}

            {detailLoading && <Body>Loading product…</Body>}

            {!detailLoading && (selectedId || isNew) && (
              <>
                <Form className="mb-3">
                  <Form.Group className="mb-2">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
                  </Form.Group>
                  <div className="row">
                    <Form.Group className="col-md-6 mb-2">
                      <Form.Label>Price amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={form.priceAmount}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, priceAmount: e.target.value }))
                        }
                      />
                    </Form.Group>
                    <Form.Group className="col-md-6 mb-2">
                      <Form.Label>Currency</Form.Label>
                      <Form.Control
                        value={form.priceCurrency}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            priceCurrency: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Label>Image URL</Form.Label>
                    <Form.Control
                      value={form.imageUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imageUrl: e.target.value }))
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Brand</Form.Label>
                    <Form.Control
                      value={form.brand}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, brand: e.target.value }))
                      }
                    />
                  </Form.Group>
                  <div className="row">
                    <Form.Group className="col-md-4 mb-2">
                      <Form.Label>Master category</Form.Label>
                      <Form.Control
                        value={form.masterCategory}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            masterCategory: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                    <Form.Group className="col-md-4 mb-2">
                      <Form.Label>Sub category</Form.Label>
                      <Form.Control
                        value={form.subCategory}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, subCategory: e.target.value }))
                        }
                      />
                    </Form.Group>
                    <Form.Group className="col-md-4 mb-2">
                      <Form.Label>Article type</Form.Label>
                      <Form.Control
                        value={form.articleType}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            articleType: e.target.value,
                          }))
                        }
                      />
                    </Form.Group>
                  </div>
                </Form>

                <Body weight="medium" className="mb-2">
                  Extra attributes
                </Body>
                <Body className="small text-muted mb-2">
                  Use JSON for arrays/objects (e.g. [&quot;S&quot;,&quot;M&quot;]).
                </Body>
                {extraRows.map((row) => (
                  <div key={row.id} className={styles.extraRow}>
                    <Form.Group>
                      <Form.Label className="small">Key</Form.Label>
                      <Form.Control
                        value={row.key}
                        onChange={(e) =>
                          setExtraRows((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, key: e.target.value } : r
                            )
                          )
                        }
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label className="small">Value</Form.Label>
                      <Form.Control
                        value={row.value}
                        onChange={(e) =>
                          setExtraRows((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, value: e.target.value } : r
                            )
                          )
                        }
                      />
                    </Form.Group>
                    <Button
                      variant="default"
                      onClick={() =>
                        setExtraRows((rows) => rows.filter((r) => r.id !== row.id))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  className="mb-3"
                  variant="default"
                  onClick={() =>
                    setExtraRows((rows) => [
                      ...rows,
                      {
                        id: `new-${Date.now()}`,
                        key: "",
                        value: "",
                      },
                    ])
                  }
                >
                  Add attribute
                </Button>

                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={handleSave}>
                    {isNew ? "Create" : "Save changes"}
                  </Button>
                  {!isNew && selectedId && (
                    <Button variant="danger" onClick={handleDelete}>
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}

            {!detailLoading && !selectedId && !isNew && (
              <Body>Select a product or create a new one.</Body>
            )}
          </div>
        </div>
      </Container>
      </LeafyGreenProvider>
    </main>
  );
}
