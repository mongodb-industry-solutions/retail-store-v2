"use client"

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Body } from '@leafygreen-ui/typography';

import styles from "./chatbotComp.module.css";
import ChatbotModal from './ChatbotModal';
import Icon from '@leafygreen-ui/icon';
import { getMinimizedSchemaForDataworkz } from '@/lib/helpers';
import { setInitialMessage, setOrderData } from '@/redux/slices/ChatbotSlice';

const ChatbotOpener = () => {
    const dispatch = useDispatch();
    const ordersInitialLoad = useSelector(state => state.User.orders.initialLoad)
    const ordersList = useSelector(state => state.User.orders.list)
    const [isOpen, setIsOpen] = useState(false);  
  
    const handleClose = () => {
      setIsOpen(false);
    };

    useEffect(() => {
        const getOrderStatusForDataworkz = async () => {
            try {
                let result = await getMinimizedSchemaForDataworkz(ordersList);
                if(result){
                    dispatch(setOrderData(result))
                    let initialMessage = await calculateInitialMessage(result);
                    dispatch(setInitialMessage(initialMessage))
                }
            } catch (err) {
                console.log(`Error getting minimized schema for dataworkz, ${err}`)
            }
        };
        if(ordersInitialLoad === true){
            getOrderStatusForDataworkz()
        }
    }, [ordersInitialLoad]);

    return (
        <>
            <ChatbotModal isOpen={isOpen} handleClose={handleClose}/> 
            <div className={styles.chatbotButton} onClick={() => setIsOpen(true)}>
                {/* <Icon className={styles.chatIcon} glyph='Sparkle' ></Icon> */}
                <img src="/rsc/icons/chat_icon.png" alt="Chat Icon" className={styles.chatIcon} />
                <span><Body className={styles.chatbotText}><strong>How can I help?</strong></Body></span>
            </div>
        </>
    );
};

export default ChatbotOpener;