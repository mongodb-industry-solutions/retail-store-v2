"use client";

import { useState, useEffect } from "react";
import Icon from "@leafygreen-ui/icon";
import { useSelector, useDispatch } from "react-redux";
import styles from "./productDetailsModal.module.css";
import { Subtitle, Label, Description } from "@leafygreen-ui/typography";
import { Modal, Container, Alert } from "react-bootstrap";
import Code from "@leafygreen-ui/code";
import Image from "next/image";
import Button from "@leafygreen-ui/button";
import { setOpenedProductDetails } from "@/redux/slices/ProductsSlice";
import { updateCartProduct, redeemNextBestAction } from "@/lib/api";
import { setCartProductsList } from "@/redux/slices/UserSlice";
import { markNextBestActionAsRedeemed } from "@/redux/slices/CustomerRetentionSlice";
import { EVENT_STREAMS_TYPES } from "@/lib/constants";
import useCustomerRetentionTracking from "@/hooks/useCustomerRetentionTracking";

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
  const [isInCart, setIsInCart] = useState(
    cartProducts.some((obj) => obj._id === openedProductDetails?.id)
  );
console.log('openedProductDetails:', openedProductDetails);
  const handleClose = () => {
    dispatch(setOpenedProductDetails(null));
  };
  const onAddToCartClick = async () => {
    if (isInCart)
      // TODO temporary while we implement remove from cart
      return;
    try {
      //const addToCart = cartProducts.some(obj => obj._id === openedProductDetails.id);      
      // Check if there's a highlighted product notification for this product
      if (highlightedProducts[openedProductDetails.id]) {
        // First redeem the next best action in the database
        const nextBestActionId = highlightedProducts[openedProductDetails.id]._id;
        try {
          const redeemRes = await redeemNextBestAction(nextBestActionId);          
          // If the database update was successful, mark the item as redeemed in Redux
          if (redeemRes.modifiedCount === 1) {
            dispatch(markNextBestActionAsRedeemed(nextBestActionId));
          }
        } catch (error) {
          console.error('Error redeeming next best action:', error);
        }
      }
      
      const cart = await updateCartProduct(
        userId,
        openedProductDetails.id,
        isInCart
      );
      console.log("result", cart);
      if (cart) {
        setIsInCart(!isInCart);
        dispatch(setCartProductsList(cart));
        // Track add-to-cart event (only if feature is customer retention)
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
    let _isInCart = cartProducts.some(
      (obj) => obj._id === openedProductDetails?.id
    );
    setIsInCart(_isInCart);
  }, [openedProductDetails?.id]);

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
      <Container className="p-3 h-100">
        <div
          className="d-flex flex-row-reverse p-1 cursorPointer"
          onClick={handleClose}
        >
          <Icon glyph="X" />
        </div>
        {openedProductDetails !== null && (
          <div className={styles.detailModal}>
            <div className={styles.detailPhoto}>
              <Image
                src={openedProductDetails.photo}
                alt={openedProductDetails.name}
                width={400}
                height={400}
                priority={true}
                style={{
                  objectFit: "contain",
                  borderRadius: "8px"
                }}
              />
            </div>
            <div className={styles.detailInfo}>
              <Label className={styles.productName}>
                {openedProductDetails.name}
              </Label>
              
              <div className="mb-2">
                <Description><strong>Brand:</strong> {openedProductDetails.brand}</Description>
                {openedProductDetails.articleType && (
                  <Description><strong>Type:</strong> {openedProductDetails.articleType}</Description>
                )}
                {openedProductDetails.subCategory && (
                  <Description><strong>Category:</strong> {openedProductDetails.subCategory}</Description>
                )}
              </div>
              
              <Subtitle className={styles.price}>
                ${openedProductDetails.price}
              </Subtitle>

              {(highlightedProducts[openedProductDetails?.id]) && (
                <Alert key="danger" variant="danger">
                  <div className="d-flex flex-row align-items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#6c3036" className="me-2" viewBox="0 0 16 16">
                      <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"/>
                    </svg>
                    <Alert.Heading className="m-0">
                      {highlightedProducts[openedProductDetails.id]?.title ||
                        "Special Offer!"}{" "}
                    </Alert.Heading>
                  </div>
                  <p>
                    {highlightedProducts[openedProductDetails.id]?.message ||
                      "Get 10% off on your next purchase!"}
                  </p>
                </Alert>
              )}

              <Button
                className={styles.detailCart}
                disabled={isInCart} // TODO temporary while we implement remove from cart
                onClick={() => onAddToCartClick()}
              >
                <img src="/cart.png" alt="Add Cart" width={18} height={18} />
                {
                  // TODO commented temporary while we implement remove from cart
                  //isInCart ? 'Remove from' : 'Add to'
                }{" "}
                Add to Cart
              </Button>

              <div className="mt-3">
                <Description className="mb-2">Product Document (partial):</Description>
                <Code language="javascript">
                  {JSON.stringify(openedProductDetails, null, 2)}
                </Code>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Modal>
  );
};

export default ProductDetailsModal;
