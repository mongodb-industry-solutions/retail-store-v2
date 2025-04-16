"use client"

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '@leafygreen-ui/icon';
import Code from '@leafygreen-ui/code';
import { Modal, Container, ModalHeader, ModalFooter } from 'react-bootstrap';
import { H3 } from '@leafygreen-ui/typography';

import "./digitalReceiptComp.css";
import { setOpenedInvoice } from '@/redux/slices/InvoiceSlice';
import Image from 'next/image';
import { Tab, Tabs } from '@leafygreen-ui/tabs';
import DigitalReceiptData from './DigitalReceiptData';


const DigitalReceiptComp = () => {
    const [selected, setSelected] = useState(0)
    const openedInvoice = useSelector(state => state.Invoice.openedInvoice)
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(setOpenedInvoice(null))
    }
    console.log('openedInvoice: ', openedInvoice)
    return (
        <Modal
            show={openedInvoice !== null}
            onHide={handleClose}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            fullscreen={'md-down'}
            className='leafyFeel'
            backdrop="static"
        >
            <ModalHeader className="d-flex flex-row justify-content-between">
                <div />
                <H3><Image width={25} height={25} alt="Chat Icon" src="/rsc/icons/receipt-solid.svg" /> Digital receipt </H3>
                <Icon className='cursorPointer' onClick={() => handleClose()} glyph="X" />
            </ModalHeader>

            <Tabs aria-label="Invoice details tabs" className='tabsModal' setSelected={setSelected} selected={selected}>
                <Tab className={``} name="Receipt">
                    <Container className={` p-3 h-100`}>
                        <DigitalReceiptData/>
                    </Container>
                </Tab>
                <Tab className={``} name="Document">
                    <Container className={` p-3 h-100`}>
                        <H3 className='mb-2'>Invoice document</H3>
                        <Code language="javascript">{JSON.stringify(openedInvoice, null, 2)}</Code>
                    </Container>
                </Tab>
                <Tab className={``} name="Behind the scenes">
                    <Container className={` p-3 h-100`}>
                        Comming soon! This is a feature under development!
                    </Container>
                </Tab>
                <Tab className={``} name="Digital receipts">
                    <Container className={` p-3 h-100`}>
                        Comming soon! This is a feature under development!
                    </Container>
                </Tab>
            </Tabs>
            <ModalFooter/>
        </Modal>
    )
}

export default DigitalReceiptComp;