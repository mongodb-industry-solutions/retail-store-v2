"use client"

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Icon from '@leafygreen-ui/icon';
import { Modal, Container, ModalHeader, ModalFooter, Tabs, Tab } from 'react-bootstrap';
import { H2, Subtitle, Description, H3 } from '@leafygreen-ui/typography';

import "./digitalReceiptComp.module.css";
import { setOpenedInvoice } from '@/redux/slices/InvoiceSlice';
import Image from 'next/image';


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
            size="lg"
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

            <Tabs setSelected={setSelected} selected={selected}>
                <Tab className={``} name="Receipt">
                    <Container className={` p-3 h-100`}>
                        HOLA
                    </Container>
                </Tab>
                <Tab className={``} name="Archi">
                    <Container className={` p-3 h-100`}>
                        HOLA
                    </Container>
                </Tab>
            </Tabs>

            <ModalFooter/>
        </Modal>
    )
}

export default DigitalReceiptComp;