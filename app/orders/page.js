"use client"

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { H1, H3, Body } from '@leafygreen-ui/typography';

import styles from "./orders.module.css";
import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import OrderItemCard from '../_components/orderItemCard/OrderItemCard';
const orders = [
    {
        "_id": {
          "$oid": "67043d2ba3c44529d63d9441"
        },
        "products": [
          {
            "id": "65e1e313cffbb90f3409a3c6",
            "name": "ADIDAS Men Spry M Black Sandals",
            "description": "ADIDAS Men Spry M Black Sandals",
            "code": "AMSMBS-MDB0001",
            "brand": "ADIDAS",
            "price": {
              "amount": "20",
              "currency": "USD"
            },
            "image": {
              "url": "http://assets.myntassets.com/v1/images/style/properties/c5a22e9ccf9b10e0a89ffbbf3e386584_images.jpg"
            }
          }
        ],
        "shipping_address": "shipping address",
        "status_history": [
          {
            "status": "In process",
            "timestamp": {
              "$date": {
                "$numberLong": "946706400000"
              }
            }
          },
          {
            "status": "Ready for pickup",
            "timestamp": {
              "$date": {
                "$numberLong": "946706400000"
              }
            }
          }
        ],
        "type": "Ship to Home",
        "user": {
          "$oid": "65a546ae4a8f64e8f88fb89e"
        }
      }
]
export default function Page() {

    return (
        <>
            <Navbar></Navbar>

            <Container className=''>
                <div className='d-flex align-items-end'>
                    <H1>My orders</H1>
                </div>
                <div className='mt-3 mb-2' >
                    {
                        orders.map((order, index) => (
                            <OrderItemCard key={index} order={order} />
                        ))
                    }
                </div>
            </Container>

            <Footer></Footer>
        </>
    );
}










