import { createSlice } from "@reduxjs/toolkit";

const GlobalSlice = createSlice({
    name: "Global",
    initialState: {
        feature: null, // null, "omnichannel", "chatbot", "receipts"
    },
    reducers: {
        setFeature: (state, action) => {
            state.feature = action.payload.feature;
            console.log("Feature set to:", state.feature);
        },
    }
})

export const {
    setFeature
} = GlobalSlice.actions

export default GlobalSlice.reducer
