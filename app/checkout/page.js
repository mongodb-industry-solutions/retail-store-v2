
"use client"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { H1, H3, Disclaimer, Body } from '@leafygreen-ui/typography';

import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import { Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";
import { fetchCart } from '@/lib/api';
import { setCartProductsList, setLoading, setTotalAmount, setTotalPrice } from '@/redux/slices/CartSlice';
import styles from './checkout.module.css'
import Card from '@leafygreen-ui/card';

export default function Page() {
    const dispatch = useDispatch();
    const cart = useSelector(state => state.Cart);
    const selectedUser = useSelector(state => state.User.selectedUser);

    const onConfirmOrder = () => {

    }

    useEffect(() => {
        const getCart = async () => {
            try {
                const result = await fetchCart(selectedUser._id);
                if (result !== null) {
                    dispatch(setCartProductsList(result))
                }
                dispatch(setLoading(false))
            } catch (err) {
                console.log(`Error fetching cart ${err}`)
            }
        }
        if(cart.loading === true && selectedUser !== null)
            getCart();
    
        return () => { }
      }, [selectedUser, cart.loading]);

    return (
        <>
            <Navbar></Navbar>
            <Container className=''>
                <div className='d-flex align-items-end'>
                    <H1>Checkout</H1>
                </div>
                {
                    cart.loading
                    ? 'Loading...'
                    : cart.products?.length < 1
                        ? <div>
                            Fill cart randomly
                        </div>
                        : <div className='mt-3'>
                            <H3 className="mb-2">Payment details</H3>
                            <Card className={styles.cardInfo}>
                                <Body><strong>Order: </strong>${cart.totalPrice}</Body>
                                <Body><strong>Shipping: </strong>$0</Body>
                                <Body><strong>Total: </strong>${cart.totalPrice}</Body>
                            </Card>

                            <H3 className="mb-2 mt-3">Products</H3>
                            <Card className={styles.cardInfo}>
                                <Body><strong>Amount: </strong>{cart.totalAmount} items in cart EYE</Body>
                            </Card>

                            <H3 className="mb-2 mt-3">Shipping address</H3>
                            <Card className={styles.cardInfo}>
                            </Card>

                            <div className='d-flex flex-row-reverse mt-3'>
                                <Button
                                    variant='primary'
                                    onClick={() => onConfirmOrder()}
                                >
                                    Confirm & order
                                </Button>
                            </div>
                        </div>
                }
            </Container>
            <Footer></Footer>
        </>
    );
}
