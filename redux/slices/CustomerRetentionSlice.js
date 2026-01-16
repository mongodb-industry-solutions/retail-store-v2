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
        nextBestActions:  {
            initialFetch: false,
            isLoading: false,
            data: [],
        },
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
        setNextBestActions: (state, action) => {
            return { ...state, nextBestActions: { ...state.nextBestActions, ...action.payload} }
        },
        pushCustomerBehaviourItem: (state, action) => {
            state.customerBehaviour.data.push(action.payload);
        },
        pushNextBestActionItem: (state, action) => {
            state.nextBestActions.data.push(action.payload);
        },
        markNextBestActionAsRedeemed: (state, action) => {
            const itemId = action.payload;
            const item = state.nextBestActions.data.find(item => item._id === itemId);
            if (item) {
                item.redeemed = true;
            }
        }
    }
})

export const {
    setIsDrawerOpen,
    setIsCustomerRetentionEnabled,
    setCustomerBehaviour,
    pushCustomerBehaviourItem,
    setNextBestActions,
    pushNextBestActionItem,
    markNextBestActionAsRedeemed
} = CustomerRetentionSlice.actions

export default CustomerRetentionSlice.reducer
