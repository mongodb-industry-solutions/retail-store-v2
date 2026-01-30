import { createSlice } from "@reduxjs/toolkit";
//import { SEARCH_TYPES } from "../../app/_lib/constants";

const ProductsSlice = createSlice({
    name: "Products",
    initialState: {
        products: [],
        query: '', 
        filters: {}, // {selectedBrands: {String, String...}, selectedCategories: {String, String...} }
        query: '', 
        totalItems: 0,
        currentPage: 1,
        searchIsLoading: false,
        initialLoad: false,
        error: null,         // null or {msg: ""}
        openedProductDetails: null // null or {...} este es el 
    },
    reducers: {
        setQuery: (state, action) => {
            return { ...state, query: action.payload }
        },
        setLoading: (state, action) => {
            return { ...state, searchIsLoading: action.payload }
        },
        setError: (state, action) => {
            if (error === null)
                return { ...state, error: null }
            else
                return { ...state, error: { ...action.payload } }
        },
        setInitialLoad: (state, action) => {
            return { ...state, initialLoad: action.payload }
        },
        setSearchTypeValue: (state, action) => {
            return {
                ...state,
                searchType: action.payload
            }
        },
        setProducts: (state, action) => {
            console.log('action.payload in setProducts: ', action.payload)
            return {
                ...state,
                products: [...action.payload.products],
                totalItems: action.payload.totalItems,
                searchIsLoading: false,
                error: null,

            }
        },
        setFilters: (state, action) => {
            return {
                ...state,
                filters: {...action.payload},
                searchIsLoading: false,
                error: null,

            }
        },
        setOpenedProductDetails: (state, action) => {
            let newOpenedProductDetails = action.payload == null ? null : {...action.payload}
            return {
                ...state,
                openedProductDetails: newOpenedProductDetails,
            }
        },
        setCurrentPage: (state, action) => {
            return {
                ...state,
                currentPage: action.payload
            }
        },

    }
})

export const {
    setLoading,
    setError,
    setSearchTypeValue,
    setProducts,
    setInitialLoad,
    setFilters,
    setQuery,
    updateProductPrice,
    setOpenedProductDetails,
    setCurrentPage
} = ProductsSlice.actions

export default ProductsSlice.reducer
