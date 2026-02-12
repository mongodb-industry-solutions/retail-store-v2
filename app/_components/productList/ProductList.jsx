"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

import styles from "./productList.module.css";
import ProductCard from "../productCard/ProductCard";
import Pagination from "@leafygreen-ui/pagination";
import { setCurrentPage, setInitialLoad, setLoading, setProducts } from "../../../redux/slices/ProductsSlice";
import { getProductsWithSearch } from "@/lib/api";
import { PAGINATION_PER_PAGE, EVENT_STREAMS_TYPES } from "@/lib/constants";
import useCustomerRetentionTracking from '@/hooks/useCustomerRetentionTracking';

const ProductList = () => {
  const dispatch = useDispatch();
  const trackEvent = useCustomerRetentionTracking();
  const {
    initialLoad, 
    currentPage, 
    products,
    totalItems,
    query
  } = useSelector(state => state.Products);

  const getProducts = async () => {
    try {
      dispatch(setLoading(true))
      let result = await getProductsWithSearch(query);
      console.log('getProducts result', result)
        if(result){
          setLoading(false)
          dispatch(setProducts({products: result.products, totalItems: result.totalItems}))
          
          // Track search event (only if feature is customer retention)
          if (query) {
            trackEvent(EVENT_STREAMS_TYPES.SEARCH, {
              query: query,
              productId: result.products.length > 0 ? result.products[0]._id : null,
              subCategory: result.products.length > 0 ? result.products[0].subCategory : null,
              articleType: result.products.length > 0 ? result.products[0].articleType : null,
              brand: result.products.length > 0 ? result.products[0].brand : null,
            });
          }
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
        itemsPerPage={PAGINATION_PER_PAGE}
        itemsPerPageOptions={[8, 16, PAGINATION_PER_PAGE]}
        numTotalItems={totalItems}
        onForwardArrowClick={ () => {
          const maxPage = Math.ceil(totalItems / PAGINATION_PER_PAGE);
          if (currentPage < maxPage) {
            dispatch(setCurrentPage(currentPage + 1));
          }
        }}
        onBackArrowClick={ () => {
          if (currentPage > 1) {
            dispatch(setCurrentPage(currentPage - 1));
          }
        }}
      ></Pagination>
      <br></br>
    </div>
  );
};
export default ProductList;
