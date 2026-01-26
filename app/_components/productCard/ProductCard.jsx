"use client";
import { useDispatch, useSelector } from "react-redux";
import styles from "./productCard.module.css";
import PropTypes from "prop-types";

import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Card from "@leafygreen-ui/card";
import { Label, Description, Subtitle } from "@leafygreen-ui/typography";
import { setOpenedProductDetails } from "@/redux/slices/ProductsSlice";
import Image from "next/image";
import { EVENT_STREAMS_TYPES } from "@/lib/constants";
import useCustomerRetentionTracking from "@/hooks/useCustomerRetentionTracking";

const ProductCard = ({ id, product }) => {
  const { name, brand, masterCategory, subCategory, articleType } = product;
  const photo = product?.image?.url || "/placeholder.png";
  const price = product?.price?.amount
    ? product.price.amount.toFixed(2)
    : "N/A";
  const dispatch = useDispatch();
  const trackEvent = useCustomerRetentionTracking();

  // Check if this product has a notification
  const highlightedProducts = useSelector(
    (state) => state.CustomerRetention.productNotifications.highlightedProducts
  );
  const hasNotification = highlightedProducts[id];

  const onProductClick = () => {
    dispatch(
      setOpenedProductDetails({
        id,
        photo,
        name,
        brand,
        price,
        articleType,
        subCategory,
      })
    );

    // Track view-product event (only if feature is customer retention)
    trackEvent(EVENT_STREAMS_TYPES.VIEW_PRODUCT, {
      productId: id,
      subCategory: subCategory,
      articleType: articleType,
      brand: brand,
    });
  };

  return (
    <LeafyGreenProvider>
      <Card className={styles.card} onClick={() => onProductClick()}>
        <div>
          {hasNotification && (
            <div className={styles.fireIcon}>
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
            </div>
          )}
        </div>
        <div className={styles.productInfo}>
          <div className={styles.imageContainer}>
            <Image
              src={photo}
              alt={name}
              fill
              quality={50}
              unoptimized
              style={{ objectFit: "contain" }}
            />
          </div>
          <Label className={styles.productName}>{name}</Label>
          <Description>{brand}</Description>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.subtitle}>
            <Subtitle>${price}</Subtitle>
          </div>
        </div>
      </Card>
    </LeafyGreenProvider>
  );
};

ProductCard.propTypes = {
  photo: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  brand: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  masterCategory: PropTypes.string.isRequired,
  subCategory: PropTypes.string.isRequired,
  articleType: PropTypes.string.isRequired,
};

export default ProductCard;
