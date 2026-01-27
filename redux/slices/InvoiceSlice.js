import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch invoice URL from server-side environment variable
export const fetchInvoiceUrl = createAsyncThunk(
    'invoice/fetchUrl',
    async () => {
        const response = await fetch('/api/getInvoiceUrl');
        if (!response.ok) {
            throw new Error('Failed to fetch invoice URL');
        }
        const data = await response.json();
        return data.invoiceUrl;
    }
);

const InvoiceSlice = createSlice({
    name: "Invoice",
    initialState: {
        invoiceIsLoading: false,
        error: null,         // null or {msg: ""}
        openedInvoice: null, // null or {...} este es el 
        invoiceEndpoint: null,
        baseInvoiceUrl: null
    },
    reducers: {
        setOpenedInvoice: (state, action) => {
            return { 
                ...state, 
                openedInvoice: action.payload, 
                invoiceEndpoint: state.baseInvoiceUrl?.replaceAll('invoiceId', action.payload?._id)
            }
        },
        setLoading: (state, action) => {
            return { ...state, invoiceIsLoading: action.payload }
        },
        setError: (state, action) => {
            if (action.payload === null)
                return { ...state, error: null }
            else
                return { ...state, error: { ...action.payload } }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvoiceUrl.pending, (state) => {
                state.invoiceIsLoading = true;
            })
            .addCase(fetchInvoiceUrl.fulfilled, (state, action) => {
                state.invoiceIsLoading = false;
                state.baseInvoiceUrl = action.payload;
                console.log('Successfully fetched invoice URL:', action.payload);
            })
            .addCase(fetchInvoiceUrl.rejected, (state, action) => {
                state.invoiceIsLoading = false;
                state.error = { msg: action.error.message };
                console.error('Failed to fetch invoice URL:', action.error.message);
            });
    }
})

export const {
    setOpenedInvoice,
    setLoading,
    setError
} = InvoiceSlice.actions

export default InvoiceSlice.reducer
