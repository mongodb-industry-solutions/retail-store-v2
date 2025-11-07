"use client";

import React, { useState, useCallback, useEffect, useRef,useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Container } from 'react-bootstrap';
import { H1 } from '@leafygreen-ui/typography';
import { v4 as uuidv4 } from "uuid";
import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import OrderItemCard from '../_components/orderItemCard/OrderItemCard';
import { CardSkeleton } from '@leafygreen-ui/skeleton-loader';
import { handleChangeInOrders, handleCreateNewOrder } from '@/lib/helpers';
import TalkTrackContainer from '../_components/talkTrackContainer/talkTrackContainer';  
import { ordersPage } from '@/lib/talkTrack';  
import { GUIDE_CUE_MESSAGES_2, FEATURES } from '@/lib/constants';  
import GuideCueContainer from '../_components/guideCueContainer/GuideCuecontainer';  
  
export default function Page() {  
    const sseConnection = useRef(null);  
    const sessionId = useRef(uuidv4());  
    const userId = useSelector(state => state.User.selectedUser?._id);  
    const orders = useSelector(state => state.User.orders);  
  
    const feature = useSelector((state) => state.Global.feature);  
  
    // --- Receipts walkthrough refs ---    
    const triggerRefReceipts1 = useRef(null); // My Orders heading    
    const triggerRefReceipts2 = useRef(null); // Orders list container    
    const triggerRefReceipts3 = useRef(null); // First order card    
  
    // --- Chatbot walkthrough refs ---    
    const triggerRefChatbot1 = useRef(null); // Orders list    
    const triggerRefChatbot2 = useRef(null); // Green headphone icon    
    const triggerRefChatbot3 = useRef(null); // Chatbot input textbox    
  
    // ✅ Guide configs using constants    
    const triggers = {  
        [FEATURES.RECEIPTS]: [  
          triggerRefReceipts1,  
          triggerRefReceipts2,  
          triggerRefReceipts3,  
        ],  
        [FEATURES.AI_CHATBOT]: [  
          triggerRefChatbot1,  
          triggerRefChatbot2,  
        ],  
      };  
      
      const currentConfig = useMemo(  
        () =>  
          GUIDE_CUE_MESSAGES_2.orders[feature]  
            ? {  
                ...GUIDE_CUE_MESSAGES_2.orders[feature],  
                triggers: triggers[feature],  
                steps: triggers[feature].length,  
              }  
            : null,  
        [feature, triggers]  
      );  
      console.log("🛠 Orders Page currentConfig:", currentConfig);  
  
     
  
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
  
    // Auto-start guide cue if feature matches    
    useEffect(() => {  
        console.log('🛠 Feature from Redux:', feature);  
        if (feature && currentConfig) {  
            setTimeout(() => {  
                // Set up refs for chatbot walkthrough    
                if (feature === FEATURES.AI_CHATBOT) {  
                    // Step 2: Find the green headphone icon    
                    const chatbotButton = document.getElementById('chatbot-opener-button');  
                    if (chatbotButton) {  
                        triggerRefChatbot2.current = chatbotButton;  
                    }  
                }  
  
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
            <GuideCueContainer config={currentConfig} feature={feature} />  
  
  
                <div className='d-flex flex-row'>  
                    <div  
                        ref={  
                            feature === FEATURES.RECEIPTS ? triggerRefReceipts1 : null  
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
                        feature === FEATURES.RECEIPTS ? triggerRefReceipts2 :  
                            feature === FEATURES.AI_CHATBOT ? triggerRefChatbot1 : null  
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
                                    feature === FEATURES.RECEIPTS && index === 0  
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