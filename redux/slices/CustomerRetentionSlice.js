import { next_best_actions } from "@/lib/constants";
import { createSlice } from "@reduxjs/toolkit";

const CustomerRetentionSlice = createSlice({
    name: "CustomerRetention",
    initialState: {
        isCustomerRetentionEnabled: false,
        isDrawerOpen: true,
        customerBehaviour: {
            initialFetch: false,
            isLoading: false,
            data: [],
        },
        nextBestActions: next_best_actions,
        

    },
    reducers: {
        setIsDrawerOpen: (state, action) => {
            return { ...state, isDrawerOpen: action.payload }
        },
        setIsCustomerRetentionEnabled: (state, action) => {
            return { ...state, isCustomerRetentionEnabled: action.payload.isCustomerRetentionEnabled }
        },
        setCustomerBehaviour: (state, action) => {
            return { ...state, customerBehaviour: { ...state.customerBehaviour, ...action.payload} }
        },
        pushCustomerBehaviourItem: (state, action) => {
            state.customerBehaviour.data.push(action.payload);
        }
    }
})

export const {
    setIsDrawerOpen,
    setIsCustomerRetentionEnabled,
    setCustomerBehaviour,
    pushCustomerBehaviourItem
} = CustomerRetentionSlice.actions

export default CustomerRetentionSlice.reducer
