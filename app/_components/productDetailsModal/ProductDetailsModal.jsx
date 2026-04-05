"use client";

import { useState, useEffect } from "react";
import Icon from "@leafygreen-ui/icon";
import { useSelector, useDispatch } from "react-redux";
import styles from "./productDetailsModal.module.css";
import { Subtitle, Label, Description, Body } from "@leafygreen-ui/typography";
import { Modal, Container, Alert } from "react-bootstrap";
import JsonTreeViewer from "@/app/_components/jsonTreeViewer/JsonTreeViewer";
import Image from "next/image";
import Button from "@leafygreen-ui/button";
import IconButton from "@leafygreen-ui/icon-button";
import { setOpenedProductDetails } from "@/redux/slices/ProductsSlice";
import { updateCartProduct, redeemNextBestAction } from "@/lib/api";
import { setCartProductsList } from "@/redux/slices/UserSlice";
import { markNextBestActionAsRedeemed } from "@/redux/slices/CustomerRetentionSlice";
import { EVENT_STREAMS_TYPES, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import useCustomerRetentionTracking from "@/hooks/useCustomerRetentionTracking";
import { SPEC_KEYS } from "@/lib/productSpecKeys";

// Keys to exclude from the JSON display
const EXCLUDED_KEYS = [
  "_id", "id", "photo", "image", "price", "name", "brand",
  "masterCategory", "subCategory", "articleType", "description",
  "score", "vai_4_embedding", "vai_text_embedding",
  "stockQuantity",
  ...SPEC_KEYS.map((s) => s.key),
];

/** Root keys not shown as dynamic Amazon-style attribute rows (keep in sync with lib/amazonImportShape). */
const RESERVED_ROOT_KEYS = new Set([
  "_id",
  "id",
  "name",
  "brand",
  "price",
  "image",
  "photo",
  "masterCategory",
  "subCategory",
  "articleType",
  "description",
  "score",
  "stockQuantity",
  "source",
  "importedAt",
  "lastUpdatedAt",
  "enrichmentStatus",
  "amazonImports",
  "vai_4_embedding",
  "vai_text_embedding",
  "amazonTextEnrichedAt",
  "amazonPdpScrapeError",
]);

const ProductDetailsModal = () => {
  const openedProductDetails = useSelector(
    (state) => state.Products.openedProductDetails
  );
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.User.selectedUser?._id);
  const trackEvent = useCustomerRetentionTracking();
  const cartProducts = useSelector((state) => state.User.cart?.products);
  const highlightedProducts = useSelector(
    (state) => state.CustomerRetention.productNotifications.highlightedProducts
  );
  const [isInCart, setIsInCart] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const handleClose = () => {
    dispatch(setOpenedProductDetails(null));
    setShowJson(false);
  };

  const onAddToCartClick = async () => {
    if (isInCart) return;
    try {
      if (highlightedProducts[openedProductDetails.id]) {
        const nextBestActionId =
          highlightedProducts[openedProductDetails.id]._id;
        try {
          const redeemRes = await redeemNextBestAction(nextBestActionId);
          if (redeemRes.modifiedCount === 1) {
            dispatch(markNextBestActionAsRedeemed(nextBestActionId));
          }
        } catch (error) {
          console.error("Error redeeming next best action:", error);
        }
      }

      const cart = await updateCartProduct(
        userId,
        openedProductDetails.id,
        isInCart
      );
      if (cart) {
        setIsInCart(!isInCart);
        dispatch(setCartProductsList(cart));
        trackEvent(EVENT_STREAMS_TYPES.ADD_TO_CART, {
          productId: openedProductDetails?.id,
          subCategory: openedProductDetails?.subCategory,
          articleType: openedProductDetails?.articleType,
          brand: openedProductDetails?.brand,
        });
      }
    } catch (err) {
      console.log(`Error filling cart ${err}`);
    }
  };

  useEffect(() => {
    if (openedProductDetails?.id) {
      const _isInCart = cartProducts.some(
        (obj) => obj._id === openedProductDetails.id
      );
      setIsInCart(_isInCart);
      setShowJson(false);
    }
  }, [openedProductDetails?.id]);

  // Build category breadcrumb
  const breadcrumbParts = [
    openedProductDetails?.masterCategory,
    openedProductDetails?.subCategory,
    openedProductDetails?.articleType,
  ].filter(Boolean);

  // Collect product specs that exist on this document
  const specs = SPEC_KEYS.filter(
    ({ key }) =>
      openedProductDetails?.[key] !== undefined &&
      openedProductDetails?.[key] !== null &&
      openedProductDetails?.[key] !== ""
  );

  const specKeyNames = new Set(SPEC_KEYS.map((s) => s.key));

  const dynamicSpecs = openedProductDetails
    ? Object.entries(openedProductDetails)
        .filter(([k, v]) => {
          if (!k || k.startsWith("_")) return false;
          if (RESERVED_ROOT_KEYS.has(k)) return false;
          if (specKeyNames.has(k)) return false;
          const t = typeof v;
          if (t === "string") return v.trim() !== "";
          if (t === "number" || t === "boolean") return true;
          return false;
        })
        .sort(([a], [b]) => a.localeCompare(b))
    : [];

  // Build a clean JSON object for the raw view (exclude UI-computed fields)
  const buildJsonDisplay = () => {
    if (!openedProductDetails) return {};
    const clean = {};
    Object.keys(openedProductDetails).forEach((key) => {
      if (!EXCLUDED_KEYS.includes(key)) {
        clean[key] = openedProductDetails[key];
      }
    });
    // Always include these core fields at the top
    return {
      _id: openedProductDetails.id || openedProductDetails._id,
      name: openedProductDetails.name,
      brand: openedProductDetails.brand,
      price: openedProductDetails.price,
      masterCategory: openedProductDetails.masterCategory,
      subCategory: openedProductDetails.subCategory,
      articleType: openedProductDetails.articleType,
      description: openedProductDetails.description,
      stockQuantity:
        openedProductDetails.stockQuantity !== undefined
          ? openedProductDetails.stockQuantity
          : null,
      ...Object.fromEntries(specs.map(({ key }) => [key, openedProductDetails[key]])),
      ...clean,
    };
  };

  const priceLabel =
    openedProductDetails &&
    (typeof openedProductDetails.price === "object"
      ? `${openedProductDetails.price.currency === "USD" ? "$" : openedProductDetails.price.currency + " "}${openedProductDetails.price.amount}`
      : `$${openedProductDetails.price}`);

  const rawStock = openedProductDetails?.stockQuantity;
  let stockQty = null;
  if (rawStock !== undefined && rawStock !== null) {
    const n = Number(rawStock);
    if (Number.isFinite(n)) stockQty = n;
  }
  const isLowStockModal =
    stockQty !== null && stockQty > 0 && stockQty <= LOW_STOCK_THRESHOLD;
  const outOfStock = stockQty === 0;

  return (
    <Modal
      show={openedProductDetails !== null}
      onHide={handleClose}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      fullscreen={"md-down"}
      className={styles.leafyFeel}
    >
      <Container className="p-0 h-100">
        <div
          className={styles.closeButton}
          onClick={handleClose}
        >
          <Icon glyph="X" size="large" />
        </div>
        {openedProductDetails !== null && (
          <div className={styles.detailModal}>
            {/* Left: Product Image */}
            <div className={styles.detailPhoto}>
              <Image
                src={openedProductDetails.photo}
                alt={openedProductDetails.name}
                width={350}
                height={350}
                priority={true}
                style={{
                  objectFit: "contain",
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </div>

            {/* Right: Product Info */}
            <div className={styles.detailInfo}>
              {/* Category Breadcrumb */}
              {breadcrumbParts.length > 0 && (
                <div className={styles.breadcrumb}>
                  {breadcrumbParts.map((part, i) => (
                    <span key={i}>
                      {i > 0 && <span className={styles.breadcrumbSep}> › </span>}
                      <span className={styles.breadcrumbItem}>{part}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Product Name */}
              <h2 className={styles.productName}>
                {openedProductDetails.name}
              </h2>

              {/* Brand */}
              <div className={styles.brandLine}>
                Visit the <span className={styles.brandLink}>{openedProductDetails.brand}</span> Store
              </div>

              {/* Price */}
              <div className={styles.priceSection}>
                <span className={styles.priceLabel}>Price:</span>
                <span className={styles.price}>{priceLabel}</span>
                {isLowStockModal && (
                  <span className={styles.lowInventoryChip}>low inventory</span>
                )}
              </div>

              {stockQty === null && (
                <Body className="text-muted mt-2 mb-0">
                  In stock — quantity not tracked until inventory is seeded.
                </Body>
              )}
              {stockQty !== null && stockQty > LOW_STOCK_THRESHOLD && (
                <Body className="mt-2 mb-0">
                  <strong>{stockQty}</strong> in stock
                </Body>
              )}
              {outOfStock && (
                <Alert variant="danger" className="mt-2 mb-2">
                  <Alert.Heading className="h6 mb-0">Out of stock</Alert.Heading>
                  <p className="mb-0 small">
                    This item cannot be added to the cart until stock is replenished.
                  </p>
                </Alert>
              )}

              {/* Special Offer Alert */}
              {highlightedProducts[openedProductDetails?.id] && (
                <Alert key="danger" variant="danger" className="mt-2 mb-2">
                  <div className="d-flex flex-row align-items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      fill="#6c3036"
                      className="me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15" />
                    </svg>
                    <Alert.Heading className="m-0">
                      {highlightedProducts[openedProductDetails.id]?.title ||
                        "Special Offer!"}
                    </Alert.Heading>
                  </div>
                  <p>
                    {highlightedProducts[openedProductDetails.id]?.message ||
                      "Get 10% off on your next purchase!"}
                  </p>
                </Alert>
              )}

              {/* Add to Cart */}
              <Button
                className={styles.addToCartBtn}
                variant="primary"
                disabled={isInCart || outOfStock}
                onClick={() => onAddToCartClick()}
              >
                <img src="/cart.png" alt="Add Cart" width={18} height={18} />
                {isInCart ? "In Cart" : "Add to Cart"}
              </Button>

              {/* Description */}
              {openedProductDetails.description && (
                <div className={styles.descriptionSection}>
                  <h4 className={styles.sectionTitle}>About this item</h4>
                  <p className={styles.descriptionText}>
                    {openedProductDetails.description}
                  </p>
                </div>
              )}

              {/* Product Specifications + Amazon PDP labels (flattened on document root) */}
              {(specs.length > 0 || dynamicSpecs.length > 0) && (
                <div className={styles.specsSection}>
                  <h4 className={styles.sectionTitle}>Product Details</h4>
                  <table className={styles.specsTable}>
                    <tbody>
                      {specs.map(({ key, label, icon }) => (
                        <tr key={key}>
                          <td className={styles.specLabel}>
                            <span className={styles.specIcon}>{icon}</span>
                            {label}
                          </td>
                          <td className={styles.specValue}>
                            {openedProductDetails[key]}
                          </td>
                        </tr>
                      ))}
                      {dynamicSpecs.map(([key, value]) => (
                        <tr key={key}>
                          <td className={styles.specLabel}>
                            <span className={styles.specIcon}>📋</span>
                            {key}
                          </td>
                          <td className={styles.specValue}>{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Magic Wand - JSON Toggle */}
              <div className={styles.jsonToggleSection}>
                <button
                  className={styles.magicWandBtn}
                  onClick={() => setShowJson(!showJson)}
                  title={showJson ? "Hide raw document" : "Show raw MongoDB document"}
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
                    {showJson ? "Hide" : "Show"} MongoDB Document
                  </span>
                </button>

                {showJson && (
                  <div className={styles.jsonContainer}>
                    <JsonTreeViewer data={buildJsonDisplay()} fillParent />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </Modal>
  );
};

export default ProductDetailsModal;
