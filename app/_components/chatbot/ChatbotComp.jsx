"use client"

import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Body, Description } from '@leafygreen-ui/typography';
import Button from "@leafygreen-ui/button";

import styles from "./chatbotComp.module.css";
import { addMessage } from '@/redux/slices/ChatbotSlice';
import { ROLE } from '@/lib/constants';
import { fetchAssistantResponse } from '@/lib/api';
import Typewriter from '../typewriter/Typewriter';

const suggestions = [
    "Can I pickup my order in a physical store?",
    "How much time do I have to cancel my order?"
]

const ChatbotComp = () => {
    const dispatch = useDispatch();
    const selectedUserId = useSelector(state => state.User.selectedUser?._id)
    const initialMessage = useSelector(state => state.Chatbot.initialMessage)
    const messages = useSelector(state => state.Chatbot.messages)
    const askInputRef = useRef(null)
    const [isAsking, setIsAsking] = useState(false);

    console.log('messages', messages)

    const handleSuggestion = (index) => {
        askInputRef.current.value = suggestions[index];
    };
    const handleAsk = async () => {
        setIsAsking(true)
        // push user's message
        dispatch(addMessage({
            content: askInputRef.current.value,
            contentType: 'text',
            role: ROLE.user
        }))
        let result = await fetchAssistantResponse(
            selectedUserId, 
            askInputRef.current.value,
            messages
        );
        console.log(result)
        if(result){
            dispatch(addMessage({
                content: result,
                contentType: 'text',
                role: ROLE.assistant
            }))
        }
        setIsAsking(false)
    }
    
    return (
        <div className={`${styles.modalContentTab} d-flex flex-column`}>
            <div className={styles.chatbotBody}>
                <Body className={styles.introBubble}>{initialMessage}</Body>
                {
                    messages
                    .filter(msg => msg.contentType !== 'init')
                    .map((message, index) => (
                        <div key={`msg-${index}`} className={styles.chatMessage}>
                            <div
                                className={`${styles.speechBubble} ${message.role === ROLE.user ? styles.userBubble : styles.answerBubble}`}
                            >
                                {
                                    message.role === ROLE.user 
                                    ? <Body>
                                        {message.content}
                                    </Body>
                                    : <Body>
                                        <Typewriter text={message.content}></Typewriter>
                                    </Body>
                                }
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className={styles.suggestedQuestions}>
                <Body>Suggested Questions:</Body>
                {
                    suggestions.map((suggestion, index) =>
                        <button key={`sug-${index}`} className={styles.suggestion} onClick={() => handleSuggestion(index)}>
                            <Description>{suggestion}</Description>
                        </button>
                    )
                }
            </div>

            <div className={styles.chatbotInputArea}>
                <input
                    type="text"
                    ref={askInputRef}
                    placeholder="Type your question..."
                />
                <Button onClick={handleAsk} variant="baseGreen" disabled={!askInputRef.current?.value.length === 0 || isAsking}>
                    {isAsking ? "Asking..." : "Ask"}
                </Button>
            </div>
        </div>
    );
};

export default ChatbotComp;