
"use client"
import React, { useEffect, useRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { H1, H2, H3, Subtitle, Body, InlineCode, InlineKeyCode, Overline, Link } from '@leafygreen-ui/typography';

import styles from "./cart.module.css";
import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import { Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";
import { fetchCart } from '@/lib/api';
import { setCartProductsList, setLoading } from '@/redux/slices/CartSlice';
import CartItem from '../_components/cart/CartItem';

export default function Page() {
    const selectedUser = useSelector(state => state.User.selectedUser);
    const cart = useSelector(state => state.Cart);
    const prevSelectedUser = useRef();

    const onCheckout = () => {
        
    }

    useEffect(() => {
        const getCart = async () => {
            try {
                const result = await fetchCart(selectedUser._id);
                console.log('result', result)
                if (result) {
                    if (result.length > 0)
                        dispatch(setCartProductsList(result[0]))
                }
                dispatch(setLoading(false))
            } catch (err) {
                console.log(`Error fetching cart`)
            }
        };

        // get user's cart when the selected user has changed
        if (prevSelectedUser.current !== selectedUser) {
            prevSelectedUser.current = selectedUser;
            getCart();
        }

        return () => { }
    }, [selectedUser]);

    return (
        <>
            <Navbar></Navbar>
            <Container className=''>
                <div className='d-flex align-items-end'>
                    <H1>My cart</H1>
                    <Button
                        size='small'
                        className='ms-3 mb-2'
                        disabled={cart.loading}
                    >
                        Fill cart
                    </Button>
                </div>
                <div className='mt-3'>
                    <H3>Products</H3>
                    <div>
                        {
                            cart.loading === true
                                ? [0, 1, 2, 3, 4].map((item) => (
                                    <CartItem
                                        key={`loading-product-${item}`}
                                        product={{
                                            "amount": {
                                                "$numberInt": "2"
                                            },
                                            "brand": "Indigo",
                                            "code": "INMPBT-MDB0001",
                                            "description": "Indigo Nation Men Printed Black T-shirt",
                                            "id": {
                                                "$oid": "65e1e313cffbb90f3409a3cf"
                                            },
                                            "image": {
                                                "url": "http://assets.myntassets.com/v1/images/style/properties/7a1bc7d255671c7f4b85f1b1b35e945b_images.jpg"
                                            },
                                            "name": "Indigo Nation Men Printed Black T-shirt",
                                            "price": {
                                                "amount": {
                                                    "$numberDouble": "20.0"
                                                },
                                                "currency": "USD"
                                            }
                                        }}
                                    />
                                ))
                                : cart.products.length > 0
                                    ? cart.products.map((product, index) => (
                                        <CartItem
                                            key={`cart-product-${index}`}
                                            product={null}
                                        />
                                    ))
                                    : 'No products found, please reload'
                        }
                    </div>
                    <div className='d-flex flex-row-reverse mt-3'>
                        <Body>Subtotal (3 products): <strong>$784.99</strong></Body>
                    </div>
                    <div className='d-flex flex-row-reverse mt-3'>
                        <Button 
                            variant='primary'
                            onClick={() => onCheckout()}
                        >
                            Proceed to checkout
                        </Button>
                    </div>
                </div>

            </Container>
            <Footer></Footer>
        </>
    );
}
