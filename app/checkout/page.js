
"use client"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { H1, H3, Disclaimer, Body } from '@leafygreen-ui/typography';
import Icon from '@leafygreen-ui/icon';
import { RadioBox, RadioBoxGroup } from '@leafygreen-ui/radio-box-group';

import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import { Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";
import { fetchCart, fetchStoreLocations } from '@/lib/api';
import { setCartProductsList, setLoading } from '@/redux/slices/CartSlice';
import styles from './checkout.module.css'
import Card from '@leafygreen-ui/card';
import HomeAddressComp from '../_components/homeAddressComp/homeAddressComp';
import BopisComp from '../_components/bopisComp/BopisComp';

const shippingMethods = [
    {value: 'home', label: 'Send to my home address'},
    {value: 'bopis', label: 'Pick up in store'}
]

export default function Page() {
    const dispatch = useDispatch();
    const cart = useSelector(state => state.Cart);
    const selectedUser = useSelector(state => state.User.selectedUser);
    const [shippingMethod, setShippingMethod] = useState(shippingMethods[0].value)
    const [storeLocations, setStoreLocations] = useState([])

    const onConfirmOrder = () => {

    }
    const onShippingMethodChange = (e) => {
        console.log('onShippingMethodChange', e.target.value)
        setShippingMethod(e.target.value)
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
        if (cart.loading === true && selectedUser !== null)
            getCart();

        return () => { }
    }, [selectedUser, cart.loading]);

    useEffect(() => {
        const getStoreLocations = async () => {
            try {
                const result = await fetchStoreLocations();
                if (result !== null) {
                    setStoreLocations(result)
                }
            } catch (err) {
                console.log(`Error fetching cart ${err}`)
            }
        }
        
        getStoreLocations();

      return () => {}
    }, [])
    

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
                                    <Body><strong>Amount: </strong>{cart.totalAmount} items in cart <Icon className="cursorPointer d-none" glyph="Visibility" /></Body>
                                </Card>

                                <H3 className="mb-2 mt-3">Shipping address</H3>
                                <Card className={styles.cardInfo}>
                                    <RadioBoxGroup 
                                        onChange={(e) => onShippingMethodChange(e)} 
                                        className="radio-box-group-style mb-3"
                                    >
                                        {
                                            shippingMethods.map((method, index) => (
                                                <RadioBox 
                                                    checked={index == 0} 
                                                    value={method.value}
                                                >
                                                   {method.label}
                                                </RadioBox>

                                            ))
                                        }
                                    </RadioBoxGroup>
                                    {
                                        shippingMethod === shippingMethods[0].value // home
                                        ? <HomeAddressComp address={selectedUser.address} containerStyle={styles.cardInfo}/>
                                        :  shippingMethod === shippingMethods[1].value // bopis
                                        ? <BopisComp containerStyle={styles.cardInfo}/>
                                        : 'Unrecognized shipping method, please select another option'
                                    }
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
