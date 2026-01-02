"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

import styles from "./productList.module.css";
import ProductCard from "../productCard/ProductCard";
import Pagination from "@leafygreen-ui/pagination";
import { setCurrentPage, setInitialLoad, setLoading, setProducts, updateProductPrice } from "../../../redux/slices/ProductsSlice";
import { getProductsWithSearch } from "@/lib/api";
import { PAGINATION_PER_PAGE } from "@/lib/constants";


const itemsPerPage = PAGINATION_PER_PAGE;

const ProductList = () => {
  const dispatch = useDispatch();
  const {
    initialLoad, 
    currentPage, 
    products,
    totalItems,
    query
  } = useSelector(state => state.Products)


  const getProducts = async () => {
    try {
      dispatch(setLoading(true))
      let result = await getProductsWithSearch(query);
      console.log('getProducts result', result)
        if(result){
          setLoading(false)
          dispatch(setProducts({products: result.products, totalItems: result.totalItems}))
        }
    } catch (err) {
        console.log(`Error getting all products, ${err}`)
    }
  }


  useEffect(() => {
    const getAllProducts = async () => {
      try {
        dispatch(setLoading(true))
        let result = await getProductsWithSearch();
        if(result){
            dispatch(setProducts({products: result.products, totalItems: result.totalItems}))
        }
      } catch (err) {
          console.log(`Error getting all products, ${err}`)
      } finally {
            dispatch(setInitialLoad(true))
      }
    }

    if(initialLoad === false){
      getAllProducts()
    }
  }, [initialLoad]);

  useEffect(() => {
    if(initialLoad === true)
      getProducts()
  }, [currentPage, query])

  return (
    <div>
      <div className={styles.productContainer}>
        {products?.length > 0
        ? products.map((product, index) => (
            <div key={index}>
              <ProductCard
                id={product._id}
                product={product}
              />
            </div>
          ))
        : initialLoad == false
        ? 'loading...'
        : 'no products found'
        }
      </div>
      <br></br>
      <hr className={styles.hr}></hr>
      <Pagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[8, 16, itemsPerPage]}
        numTotalItems={totalItems}
        onForwardArrowClick={ () => dispatch(setCurrentPage(currentPage + 1)) }
        onBackArrowClick={ () => dispatch(setCurrentPage(currentPage - 1)) }
      ></Pagination>
    </div>
  );
};
export default ProductList;
