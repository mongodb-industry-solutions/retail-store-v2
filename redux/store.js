import { configureStore } from '@reduxjs/toolkit';
import UserReducer from './slices/UserSlice'
import OrderReducer from './slices/OrderSlice'
import ChatbotReducer from './slices/ChatbotSlice'
import ProductsReducer from './slices/ProductsSlice.js'
import InvoiceReducer from './slices/InvoiceSlice.js'
import AlertReducer from './slices/AlertSlice.js'
import CustomerRetentionReducer from './slices/CustomerRetentionSlice'
import GlobalReducer from './slices/GlobalSlice.js'

const store = configureStore({
    reducer: {
        "User": UserReducer,
        "Order": OrderReducer,
        "Chatbot": ChatbotReducer,
        "Products": ProductsReducer,
        "Invoice": InvoiceReducer,
        "Alerts": AlertReducer,
        "CustomerRetention": CustomerRetentionReducer,
        "Global": GlobalReducer
    }
});

export default store;
