"use client";
import { useDispatch } from 'react-redux';
import styles from "./productCard.module.css";
import PropTypes from "prop-types";

import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Card from "@leafygreen-ui/card";
import {
  Label,
  Description,
  Subtitle
} from "@leafygreen-ui/typography";
import { setOpenedProductDetails } from "@/redux/slices/ProductsSlice";
import Image from "next/image";

const ProductCard = ({ id, product }) => {
  const {  name, brand } = product;
  const photo = product?.image?.url || '/placeholder.png';
  const price = product?.price?.amount ? product.price.amount.toFixed(2) : 'N/A';
  const dispatch = useDispatch();


  const onProductClick = () => {
    dispatch(setOpenedProductDetails({
      id,
      photo,
      name,
      brand,
      price,
    }))
  }

  return (
    <LeafyGreenProvider>
      <Card className={styles.card} onClick={() => onProductClick()}>
        <div className={styles.scoreContainer}>
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
};

export default ProductCard;
