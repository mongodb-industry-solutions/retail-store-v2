"use client"

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '@leafygreen-ui/icon';
import { Modal, Container, ModalHeader, ModalFooter } from 'react-bootstrap';
import { H2, H3, Subtitle, Body, Description } from '@leafygreen-ui/typography';
import Button from "@leafygreen-ui/button";
import { Tabs, Tab } from '@leafygreen-ui/tabs';

import styles from "./chatbotComp.module.css";
import ChatbotComp from './ChatbotComp';
import ArchitectureComp from './ArchitectureComp';


const ChatbotModal = ({ isOpen, handleClose }) => {
    const dispatch = useDispatch();
    const [selected, setSelected] = useState(0)

    useEffect(() => {

    }, [])

    return (
        <Modal
            show={isOpen}
            onHide={handleClose}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            fullscreen={'md-down'}
            className={styles.leafyFeel}
            backdrop="static"
        >
            <ModalHeader className="d-flex flex-row justify-content-between">
                <div></div>
                <H3>RAG Chatbot</H3>
                <Icon className='cursorPointer' onClick={() => handleClose()} glyph="X" />
            </ModalHeader>
            <Tabs setSelected={setSelected} selected={selected}>
                <Tab className={styles.backgroundGray}  name="Chatbot">
                    <Container className={`${styles.chatbotContainer} p-3 h-100`}>
                        <ChatbotComp />
                    </Container>
                </Tab>
                <Tab className={styles.backgroundGray}  name="Architecture">
                    <Container className={`${styles.chatbotContainer} p-3 h-100`}>
                       <ArchitectureComp/>
                    </Container>
                </Tab>
            </Tabs>

            <ModalFooter></ModalFooter>
        </Modal>
    );
};

export default ChatbotModal;