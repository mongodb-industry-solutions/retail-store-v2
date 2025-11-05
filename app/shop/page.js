"use client"
import React, { useState } from 'react';

import styles from "./shop.module.css";
import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import ProductList from "../_components/productList/ProductList";
import ProductDetailsModal from "../_components/productDetailsModal/ProductDetailsModal";


export default function Page() {

  return (
    <>
      <Navbar/>
        <div className={styles.pageContainer}>
          <div className={styles.productList}>
            <ProductList/>
          </div>
        </div>
        <ProductDetailsModal/>
      <Footer/>
    </>
  );
}










