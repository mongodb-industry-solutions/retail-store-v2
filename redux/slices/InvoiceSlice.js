import { createSlice } from "@reduxjs/toolkit";
//import { SEARCH_TYPES } from "../../app/_lib/constants";

const InvoiceSlice = createSlice({
    name: "Invoice",
    initialState: {
        invoiceIsLoading: false,
        error: null,         // null or {msg: ""}
        openedInvoice: null, // null or {...} este es el 
        invoiceEndpoint: process.env.NEXT_PUBLIC_GCP_INVOICE_URL
    },
    reducers: {
        setOpenedInvoice: (state, action) => {
            return { 
                ...state, 
                openedInvoice: action.payload, 
                invoiceEndpoint: process.env.NEXT_PUBLIC_GCP_INVOICE_URL.replaceAll('invoiceId', action.payload?._id)
            }
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
    }
})

export const {
    setOpenedInvoice,
    setLoading,
    setError
} = InvoiceSlice.actions

export default InvoiceSlice.reducer
