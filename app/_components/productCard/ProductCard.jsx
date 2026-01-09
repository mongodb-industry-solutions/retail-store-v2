"use client";
import { useDispatch, useSelector } from 'react-redux';
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
import { sendEvent } from '@/redux/slices/eventsSlice';
import { generateTimeSeriesEvent } from '@/lib/helpers';
import Image from "next/image";
import { EVENT_STREAMS_TYPES } from '@/lib/constants';

const ProductCard = ({ id, product }) => {
  const {  name, brand } = product;
  const photo = product?.image?.url || '/placeholder.png';
  const price = product?.price?.amount ? product.price.amount.toFixed(2) : 'N/A';
  const dispatch = useDispatch();
  const selectedUser = useSelector(state => state.User.selectedUser);


  const onProductClick = () => {
    dispatch(setOpenedProductDetails({
      id,
      photo,
      name,
      brand,
      price,
    }))
    
    // Track view-product event
    if (selectedUser && selectedUser._id) {
      const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString();
      const metadata = {
          productId: id,
          masterCategory: "TODO...",
          brand: brand,
        };
      const payload = generateTimeSeriesEvent(
        selectedUser._id, 
        sessionId, 
        EVENT_STREAMS_TYPES.VIEW_PRODUCT, 
        metadata
      );
      dispatch(sendEvent(payload));
    }
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
