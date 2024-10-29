
"use client"
import React, { useEffect, useRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { H1, H2, H3, Subtitle, Body, InlineCode, InlineKeyCode, Overline, Link } from '@leafygreen-ui/typography';

import styles from "./cart.module.css";
import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import { Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";

export default function Page() {
    const selectedUser = useSelector(state => state.User.selectedUser);
    const cart = useSelector(state => state.Cart);
    const prevSelectedUser = useRef();
    
    useEffect(() => {
        // get user's cart when the selected user has changed
        if (prevSelectedUser.current !== selectedUser) {
            prevSelectedUser.current = selectedUser;


        }
    }, [selectedUser]);
    

    return (
        <>
            <Navbar></Navbar>
            <Container className=''>
                <div className='d-flex align-items-end'>
                    <H1>My cart</H1>
                    <Button size='small' className='ms-3 mb-2'>
                        Fill cart
                    </Button>
                </div>
                <div className='mt-3'>
                    <H3>Products</H3>
                    {
                        cart.loading === true
                        ? [0, 1, 2, 3, 4].map((item) => (
                            <>Hola </>
                        ))
                        : cart.products.length > 0
                        ? cart.products.map((user, index) => (
                            <>Prod </>
                        ))
                        : 'No products found, please reload'
                    }
                </div>

            </Container>
            <Footer></Footer>
        </>
    );
}
