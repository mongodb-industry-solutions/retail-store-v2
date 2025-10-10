"use client";  
  
import React, { useState, useCallback, useEffect, useRef } from 'react';  
import { useSelector } from 'react-redux';  
import { Container } from 'react-bootstrap';  
import { H1 } from '@leafygreen-ui/typography';  
import { v4 as uuidv4 } from "uuid";  
import { GuideCue } from '@leafygreen-ui/guide-cue';  
  
import Footer from "../_components/footer/Footer";  
import Navbar from "../_components/navbar/Navbar";  
import OrderItemCard from '../_components/orderItemCard/OrderItemCard';  
import { CardSkeleton } from '@leafygreen-ui/skeleton-loader';  
import { handleChangeInOrders, handleCreateNewOrder } from '@/lib/helpers';  
import TalkTrackContainer from '../_components/talkTrackContainer/talkTrackContainer';  
import { ordersPage } from '@/lib/talkTrack';  
import { GUIDE_CUE_MESSAGES } from '@/lib/constants';  
  
export default function Page() {  
    const sseConnection = useRef(null);  
    const sessionId = useRef(uuidv4());  
    const userId = useSelector(state => state.User.selectedUser?._id);  
    const orders = useSelector(state => state.User.orders);  
  
    const feature = useSelector((state) => state.Global.feature);  
    const [currentStep, setCurrentStep] = useState(1);  
    const [open, setOpen] = useState(false);  
  
    // --- Receipts walkthrough refs ---  
    const triggerRefReceipts1 = useRef(null); // My Orders heading  
    const triggerRefReceipts2 = useRef(null); // Orders list container  
    const triggerRefReceipts3 = useRef(null); // First order card  
  
    // --- Chatbot walkthrough refs ---  
    const triggerRefChatbot1 = useRef(null); // Orders list  
    const triggerRefChatbot2 = useRef(null); // Green headphone icon  
    const triggerRefChatbot3 = useRef(null); // Chatbot input textbox  
  
    // ✅ Guide configs using constants  
    const guideConfigs = {  
        receipts: {  
            messages: GUIDE_CUE_MESSAGES.orders.receipts.messages,  
            triggers: [triggerRefReceipts1, triggerRefReceipts2, triggerRefReceipts3]  
        },  
        chatbot: {  
            messages: GUIDE_CUE_MESSAGES.orders.chatbot.messages,  
            triggers: [triggerRefChatbot1, triggerRefChatbot2] // Only 2 refs needed  
        }  
    };  
  
    const currentConfig = guideConfigs[feature] || { messages: [], triggers: [] };  
    const messages = currentConfig.messages;  
    const triggers = currentConfig.triggers;  
    const steps = triggers.length;  
  
    const listenToSSEUpdates = useCallback(() => {  
        const collection = "orders";  
        const user = userId;  
        const eventSource = new EventSource(  
            `/api/sse?sessionId=${sessionId.current}&colName=${collection}&user=${user}`  
        );  
  
        eventSource.onopen = () => {  
            console.log('SSE connection opened.');  
        };  
  
        eventSource.onmessage = (event) => {  
            const data = JSON.parse(event.data);  
            const orderId = data.documentKey._id;  
            if (data.operationType === 'update')  
                handleChangeInOrders(orderId, data.fullDocument);  
            else if (data.operationType === 'insert')  
                handleCreateNewOrder(data.fullDocument);  
        };  
  
        eventSource.onerror = (event) => {  
            console.error('SSE Error:', event);  
        };  
  
        if (sseConnection.current) {  
            sseConnection.current.close();  
            console.log("Previous SSE connection closed - dashboard.");  
        }  
  
        sseConnection.current = eventSource;  
        return eventSource;  
    }, [userId]);  
  
    const handleNext = () => {  
        if (currentStep < steps) {  
            setCurrentStep(n => n + 1);  
            setOpen(true);  
        } else {  
            setOpen(false);  
        }  
    };  
  
    const handleDismiss = () => {  
        console.log("Guide dismissed");  
        setOpen(false);  
    };  
  
    const handleReset = () => {  
        setCurrentStep(1);  
        setOpen(true);  
    };  
  
    // Auto-start guide cue if feature matches  
    useEffect(() => {  
        console.log('🛠 Feature from Redux:', feature);  
        if (feature && guideConfigs[feature]) {  
            setTimeout(() => {  
                // Set up refs for chatbot walkthrough  
                if (feature === 'chatbot') {  
                    // Step 2: Find the green headphone icon  
                    const chatbotButton = document.getElementById('chatbot-opener-button');  
                    if (chatbotButton) {  
                        triggerRefChatbot2.current = chatbotButton;  
                    }  
                }  
  
                handleReset();  
                console.log('🚀 Starting walkthrough for feature:', feature);  
            }, 500);  
        }  
    }, [feature]);  
  
    useEffect(() => {  
        if (userId) {  
            const eventSource = listenToSSEUpdates();  
            return () => {  
                if (eventSource) {  
                    eventSource.close();  
                    console.log("SSE connection closed.");  
                }  
            };  
        }  
    }, [listenToSSEUpdates, userId]);  
  
    useEffect(() => {  
        const handleBeforeUnload = () => {  
            if (sseConnection.current) {  
                sseConnection.current.close();  
            }  
        };  
        window.addEventListener("beforeunload", handleBeforeUnload);  
        return () => {  
            window.removeEventListener("beforeunload", handleBeforeUnload);  
        };  
    }, []);  
  
    return (  
        <>  
            <Navbar />  
            <Container className=''>  
                {/* GuideCue component */}  
                <GuideCue  
                    open={open}  
                    setOpen={setOpen}  
                    refEl={triggers[currentStep - 1]}  
                    numberOfSteps={steps}  
                    currentStep={currentStep}  
                    onPrimaryButtonClick={handleNext}  
                    onDismiss={handleDismiss}  
                    title={messages[currentStep - 1]}  
                >  
                    {messages[currentStep - 1]}  
                </GuideCue>  
  
                <div className='d-flex flex-row'>  
                    <div   
                        ref={  
                            feature === 'receipts' ? triggerRefReceipts1 : null  
                        }   
                        className='d-flex align-items-end w-100'  
                    >  
                        <H1>  
                            My orders  
                        </H1>  
                    </div>  
                    <TalkTrackContainer sections={ordersPage} />  
                </div>  
  
                {/* Orders list */}  
                <div  
                    className='mt-3 mb-2'  
                    ref={  
                        feature === 'receipts' ? triggerRefReceipts2 :  
                        feature === 'chatbot' ? triggerRefChatbot1 : null  
                    }  
                >  
                    {orders.loading === true  
                        ? [0, 1, 2].map(loadCard => (  
                            <CardSkeleton className='mb-2' key={loadCard}></CardSkeleton>  
                        ))  
                        : orders.list.map((order, index) => (  
                            <OrderItemCard  
                                key={index}  
                                order={order}  
                                updateToggle={orders.updateToggle}  
                                feature={feature}  
                                triggerRef={  
                                    feature === 'receipts' && index === 0  
                                        ? triggerRefReceipts3  
                                        : null  
                                }  
                            />  
                        ))  
                    }  
                </div>  
  
            </Container>  
            <Footer />  
        </>  
    );  
}  