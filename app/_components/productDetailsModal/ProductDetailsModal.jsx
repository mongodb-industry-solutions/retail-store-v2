"use client";

import { useState, useEffect } from "react";
import Icon from '@leafygreen-ui/icon';
import { useSelector, useDispatch } from 'react-redux';
import styles from "./productDetailsModal.module.css";
import {
    Subtitle,
    Label,
    Description,
} from "@leafygreen-ui/typography";
import { Modal, Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";
import Image from "next/image";
import { setOpenedProductDetails } from "@/redux/slices/ProductsSlice";
import { updateCartProduct } from "@/lib/api";

const ProductDetailsModal = () => {
    const openedProductDetails = useSelector(state => state.Products.openedProductDetails)
    const dispatch = useDispatch();
    const userId = useSelector(state => state.User.selectedUser?._id)
    const cartProducts = useSelector(state => state.User.cart?.products)
    const [addToCart, setAddToCart] = useState(cartProducts.some(obj => obj._id === openedProductDetails?.id))
    
    const handleClose = () => {
        dispatch(setOpenedProductDetails(null))
    }
    const onAddToCartClick = async () => {
        try {
            //const addToCart = cartProducts.some(obj => obj._id === openedProductDetails.id);
            const cart = await updateCartProduct(userId, product.id, addToCart);
            console.log('result', cart)
            // todo set add to cart
        } catch (err) {
            console.log(`Error filling cart ${err}`)
        }
    }

    useEffect(() => {
        let _addToCart = cartProducts.some(obj => obj._id === openedProductDetails?.id)
        setAddToCart(_addToCart)
    }, [openedProductDetails?.id])
    

    return (
        <Modal
            show={openedProductDetails !== null}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            fullscreen={'md-down'}
            className={styles.leafyFeel}
            backdrop="static"
        >
            <Container className='p-3 h-100'>
                <div className='d-flex flex-row-reverse p-1 cursorPointer' onClick={handleClose}>
                    <Icon glyph="X" />
                </div>
                {
                    openedProductDetails !== null &&
                    <div className={styles.detailModal}>
                        <div className={styles.detailPhoto}>
                            <img src={openedProductDetails.photo} alt={openedProductDetails.name} width={400} height={400}></img>
                        </div>
                        <div className={styles.detailInfo}>
                            <Label className={styles.productName}>{openedProductDetails.name}</Label>
                            <Description>{openedProductDetails.brand}</Description>
                            <Subtitle className={styles.price}>${openedProductDetails.price}</Subtitle>

                            {/* <div className={styles.quantitySection}>
                                <Description>Quantity:</Description>
                                <button
                                    className={styles.quantityPicker}
                                    onClick={handleDecrease}
                                >
                                    -
                                </button>
                                <span className={styles.quantity}>{quantity}</span>
                                <button
                                    className={styles.quantityPicker}
                                    onClick={handleIncrease}
                                >
                                    +
                                </button>
                                </div>
                            */}

                            <Button
                                className={styles.detailCart}
                                disabled={false}
                                onClick={() => onAddToCartClick()}
                            >
                                <img
                                    src="/cart.png"
                                    alt="Add Cart"
                                    width={18}
                                    height={18}
                                />
                                {addToCart ? 'Add to' : 'Remove from' } Cart
                            </Button>
                        </div>
                    </div>
                }
            </Container>
        </Modal>
    );
};

export default ProductDetailsModal;
