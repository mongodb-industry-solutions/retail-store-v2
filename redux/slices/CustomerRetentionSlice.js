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
        productNotifications: {
            // Map of productId to notification data: { title, message, _id, productId }
            highlightedProducts: {},
        },
        sessionState: null, // The session_state generated/updated by ASP 1
        recalculateAnalytics: false, // Flag to trigger recalculation of analytics when needed
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
            state.nextBestActions.data.unshift(action.payload);
            state.recalculateAnalytics = !state.recalculateAnalytics; // Toggle to trigger analytics recalculation if needed
        },
        markNextBestActionAsRedeemed: (state, action) => {
            const itemId = action.payload;
            const item = state.nextBestActions.data.find(item => item._id === itemId);
            if (item) {
                item.redeemed = true;
            }
            state.recalculateAnalytics = !state.recalculateAnalytics; // Toggle to trigger analytics recalculation if needed
        },
        addProductNotification: (state, action) => {
            const { productId, title, message, _id } = action.payload;
            if (productId) {
                state.productNotifications.highlightedProducts[productId] = {
                    title,
                    message,
                    _id,
                    productId
                };
            }
        },

        removeProductNotification: (state, action) => {
            const productId = action.payload;
            delete state.productNotifications.highlightedProducts[productId];
        },
        setSessionState: (state, action) => {
            state.sessionState = action.payload;
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
    markNextBestActionAsRedeemed,
    addProductNotification,
    removeProductNotification,
    setSessionState
} = CustomerRetentionSlice.actions

export default CustomerRetentionSlice.reducer
