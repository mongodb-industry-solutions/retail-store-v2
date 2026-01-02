import { next_best_actions } from "@/lib/constants";
import { createSlice } from "@reduxjs/toolkit";

const CustomerRetentionSlice = createSlice({
    name: "CustomerRetention",
    initialState: {
        isCustomerRetentionEnabled: false,
        isDrawerOpen: true,
        nextBestActions: next_best_actions,
    },
    reducers: {
        setIsDrawerOpen: (state, action) => {
            return { ...state, isDrawerOpen: action.payload }
        },
        setIsCustomerRetentionEnabled: (state, action) => {
            return { ...state, isCustomerRetentionEnabled: action.payload.isCustomerRetentionEnabled }
        },
    }
})

export const {
    setIsDrawerOpen,
    setIsCustomerRetentionEnabled
} = CustomerRetentionSlice.actions

export default CustomerRetentionSlice.reducer
