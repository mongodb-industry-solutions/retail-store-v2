import { createSlice } from "@reduxjs/toolkit";
/*
This is a minimized version of the schema that is send to dataworkz chatbot
*/
const ChatbotSlice = createSlice({
    name: "Chatbot",
    initialState: {
        initialMessage: "...",
        orderData: [],      // [] or [...]
        error: null,         // null or {msg: ""}
        loading: false,
        isLoadingAnswer: false,
        initialLoad:false,
        messages: []
        // {
        //     content: '' || <></>,
        //     contentType: 'text' || 'html',
        //     role: ROLE.assistant || ROLE.user
        // }
    },
    reducers: {
        setOrderData: (state, action) => {
            return {
                ...state,  
                orderData: action.payload.orderData,
                initialLoad: true
            }
        },
        setInitialMessage: (state, action) => {
            return {...state,  initialMessage: action.payload}
        },
        setLoading: (state, action) => {
            return { ...state, loading: action.payload }
        },
        setError: (state, action) => {
            if (error === null)
                return { ...state, error: null }
            else
                return { ...state, error: { ...action.payload } }
        },
        addMessage: (state, action) => {
            return {
                ...state, 
                messages: [...state.messages, action.payload] }
        },
        setIsLoadingAnswer: (state, action) => {
            return {...state,  isLoadingAnswer: action.payload}

        }
    }
})

export const {
    setOrderData,
    setInitialMessage,
    setLoading,
    setError,
    addMessage,
    setIsLoadingAnswer
} = ChatbotSlice.actions

export default ChatbotSlice.reducer
