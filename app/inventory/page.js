"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../_components/navbar/Navbar";
import {
  fetchInventoryProducts,
  fetchInventoryMovements,
  patchInventoryProduct,
  seedInventory,
} from "@/lib/api";
import { Container, Alert, Table, Form, Badge } from "react-bootstrap";
import Button from "@leafygreen-ui/button";
import { H2, Body } from "@leafygreen-ui/typography";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import { SearchInput } from "@leafygreen-ui/search-input";
import JsonTreeViewer from "@/app/_components/jsonTreeViewer/JsonTreeViewer";
import Icon from "@leafygreen-ui/icon";
import styles from "./inventory.module.css";

function formatMovementTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function reasonVariant(reason) {
  if (reason === "sale") return "primary";
  if (reason === "seed") return "secondary";
  if (reason === "admin_adjust") return "warning";
  return "dark";
}

export default function InventoryPage() {
  const selectedUser = useSelector((s) => s.User.selectedUser);
  const actingUserId =
    selectedUser?._id != null ? String(selectedUser._id) : null;
  const isOwner = selectedUser?.type === "owner";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [seedMsg, setSeedMsg] = useState(null);

  const [expandedProductId, setExpandedProductId] = useState(null);
  const [movementsByProduct, setMovementsByProduct] = useState({});
  const [loadingMovementsId, setLoadingMovementsId] = useState(null);
  const [showRawJsonFor, setShowRawJsonFor] = useState({});

  const load = useCallback(async () => {
    if (!actingUserId || !isOwner) return;
    setLoading(true);
    setError(null);
    try {
      const productsData = await fetchInventoryProducts(actingUserId);
      const list = productsData.products || [];
      setRows(list);
      const d = {};
      list.forEach((p) => {
        d[p._id] =
          p.stockQuantity != null ? String(p.stockQuantity) : "0";
      });
      setDrafts(d);
      setMovementsByProduct({});
      setExpandedProductId(null);
      setShowRawJsonFor({});
    } catch (e) {
      setError(e.message || "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [actingUserId, isOwner]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const toggleMovements = useCallback(
    async (productId) => {
      if (expandedProductId === productId) {
        setExpandedProductId(null);
        return;
      }
      setExpandedProductId(productId);

      if (movementsByProduct[productId] != null) return;

      if (!actingUserId) return;
      setLoadingMovementsId(productId);
      setError(null);
      try {
        const data = await fetchInventoryMovements(
          actingUserId,
          100,
          productId
        );
        setMovementsByProduct((prev) => ({
          ...prev,
          [productId]: data.movements || [],
        }));
      } catch (e) {
        setError(e.message || "Failed to load movements");
        setMovementsByProduct((prev) => ({
          ...prev,
          [productId]: [],
        }));
      } finally {
        setLoadingMovementsId(null);
      }
    },
    [actingUserId, expandedProductId, movementsByProduct]
  );

  const toggleRawJson = (productId) => {
    setShowRawJsonFor((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleSeed = async () => {
    if (!actingUserId) return;
    setSeedMsg(null);
    setError(null);
    try {
      const r = await seedInventory(actingUserId);
      setSeedMsg(
        `Seeded ${r.productsUpdated} products (random quantity 0–50 per product).`
      );
      await load();
    } catch (e) {
      setError(e.message || "Seed failed");
    }
  };

  const handleSave = async (productId) => {
    if (!actingUserId) return;
    const raw = drafts[productId];
    const q = parseInt(raw, 10);
    if (!Number.isFinite(q) || q < 0) {
      setError("Quantity must be a non-negative integer");
      return;
    }
    setSavingId(productId);
    setError(null);
    try {
      await patchInventoryProduct(actingUserId, productId, q);
      await load();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  if (!isOwner) {
    return (
      <main>
        <Navbar />
        <LeafyGreenProvider>
          <Container className="py-5">
            <Alert variant="secondary">
              <Alert.Heading>Inventory management is restricted</Alert.Heading>
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
            <H2>Inventory</H2>
            <Button variant="primary" onClick={handleSeed}>
              Seed all products (random 0–50)
            </Button>
          </div>
          <Body className="text-muted mb-3">
            Updates run in a MongoDB multi-document transaction (inventory +
            <code className="mx-1">inventory_movements</code>). Use the chevron
            on a row to load and show that product&apos;s movement history.
          </Body>
          <SearchInput
            aria-label="Filter products"
            placeholder="Search by name or brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSubmit={(e) => e.preventDefault()}
            className="mb-3"
          />
          {seedMsg && (
            <Alert variant="success" dismissible onClose={() => setSeedMsg(null)}>
              {seedMsg}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Body>Loading…</Body>
          ) : (
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th style={{ width: 48 }} aria-label="Movement history" />
                  <th>Name</th>
                  <th>Brand</th>
                  <th style={{ width: 140 }}>Quantity</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const open = expandedProductId === p._id;
                  const movements = movementsByProduct[p._id];
                  const loadingM = loadingMovementsId === p._id;

                  return (
                    <Fragment key={p._id}>
                      <tr>
                        <td className="align-middle text-center">
                          <button
                            type="button"
                            className={styles.expandBtn}
                            onClick={() => toggleMovements(p._id)}
                            aria-expanded={open}
                            aria-label={
                              open
                                ? "Hide inventory movements"
                                : "Show inventory movements"
                            }
                            title="Inventory movements"
                          >
                            <Icon
                              glyph={open ? "ChevronDown" : "ChevronRight"}
                              size={16}
                            />
                          </button>
                        </td>
                        <td>{p.name || "—"}</td>
                        <td>{p.brand || "—"}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min={0}
                            value={drafts[p._id] ?? ""}
                            onChange={(e) =>
                              setDrafts((d) => ({
                                ...d,
                                [p._id]: e.target.value,
                              }))
                            }
                            size="sm"
                          />
                        </td>
                        <td>
                          <Button
                            size="small"
                            disabled={savingId === p._id}
                            onClick={() => handleSave(p._id)}
                          >
                            Save
                          </Button>
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={5} className="p-0 border-0">
                            <div className={styles.movementPanel}>
                              <div className={styles.movementPanelTitle}>
                                inventory_movements (this product)
                              </div>
                              {loadingM ? (
                                <Body className="mb-0">Loading…</Body>
                              ) : !movements || movements.length === 0 ? (
                                <Body className="mb-0 text-muted">
                                  No movements for this product yet.
                                </Body>
                              ) : (
                                <>
                                  <Table
                                    striped
                                    bordered
                                    hover
                                    responsive
                                    size="sm"
                                    className="mb-3 bg-white"
                                  >
                                    <thead>
                                      <tr>
                                        <th style={{ minWidth: 160 }}>
                                          When
                                        </th>
                                        <th>Reason</th>
                                        <th style={{ width: 90 }}>Delta</th>
                                        <th>Order</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {movements.map((m) => (
                                        <tr key={m._id}>
                                          <td className="small">
                                            {formatMovementTime(m.at)}
                                          </td>
                                          <td>
                                            <Badge bg={reasonVariant(m.reason)}>
                                              {m.reason}
                                            </Badge>
                                          </td>
                                          <td
                                            className={
                                              m.delta < 0
                                                ? "text-danger"
                                                : m.delta > 0
                                                  ? "text-success"
                                                  : ""
                                            }
                                          >
                                            {m.delta > 0 ? `+${m.delta}` : m.delta}
                                          </td>
                                          <td className="small text-muted">
                                            {m.refOrderId || "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                  <div className={styles.jsonToggleSection}>
                                    <button
                                      type="button"
                                      className={styles.magicWandBtn}
                                      onClick={() => toggleRawJson(p._id)}
                                      title={
                                        showRawJsonFor[p._id]
                                          ? "Hide raw documents"
                                          : "Show raw MongoDB documents"
                                      }
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M15 4V2" />
                                        <path d="M15 16v-2" />
                                        <path d="M8 9h2" />
                                        <path d="M20 9h2" />
                                        <path d="M17.8 11.8 19 13" />
                                        <path d="M15 9h0" />
                                        <path d="M17.8 6.2 19 5" />
                                        <path d="M3 21l9-9" />
                                        <path d="M12.2 6.2 11 5" />
                                      </svg>
                                      <span className={styles.magicWandLabel}>
                                        {showRawJsonFor[p._id] ? "Hide" : "Show"}{" "}
                                        MongoDB documents
                                      </span>
                                    </button>
                                    {showRawJsonFor[p._id] && (
                                      <div className={styles.jsonContainer}>
                                        <JsonTreeViewer
                                          data={movements}
                                          fillParent
                                        />
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Container>
      </LeafyGreenProvider>
    </main>
  );
}
