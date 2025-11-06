import { createSlice } from "@reduxjs/toolkit";

const CustomerRetentionSlice = createSlice({
    name: "CustomerRetention",
    initialState: {
        isDrawerOpen: false,
    },
    reducers: {
        setIsDrawerOpen: (state, action) => {
            return { ...state, isDrawerOpen: action.payload }
        },
       
    }
})

export const {
    setIsDrawerOpen
} = CustomerRetentionSlice.actions

export default CustomerRetentionSlice.reducer
