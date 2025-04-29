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
                        <DigitalReceiptData />
                    </Container>
                </Tab>
                <Tab className={``} name="Document">
                    <Container className={` p-3 h-100`}>
                        <H3 className='mb-2'>Invoice document</H3>
                        <Code language="javascript">{JSON.stringify(openedInvoice, null, 2)}</Code>
                    </Container>
                </Tab>
                <Tab className={``} name="Digital receipts">
                    <Container className={` p-3 h-100`}>
                        <H3>Digital Receipts</H3>
                        <p>Digital receipts are the electronic version of traditional paper receipts. They serve as official proof of payment containing relevant invoice details such as the transaction timestamp, total amount, items purchased, and more. They provide real-time and historical insight into customers' purchases.</p>
                        <p>The Global Digital Receipts in Retail Market size is expected to be worth around USD 5,214.9 million by 2034, growing at a CAGR of 21.4% during the forecast period from 2025 to 2034.</p>
                        <div style={{ width: '90%' }}>
                            <Image
                                src="/rsc/diagrams/digitalReceiptsChart.png"
                                alt="Dataworkz + MDB architecture"
                                layout="responsive"
                                width={100} // Arbitrary width for setting aspect ratio
                                height={60} // Arbitrary height to set the aspect ratio
                            />
                        </div>                    
                        <small><strong>Resource:</strong> https://market.us/report/digital-receipts-in-retail-market/</small>
                        <H3 className='mt-3'>Personalized recommendations </H3>
                        <p>B2B marketers who personalize web experiences see an average increase of <a 
                            href="https://instapage.com/blog/personalization-statistics/#:~:text=Website%20personalization%20statistics,-76%25%20of%20consumers&text=85%25%20of%20businesses%20say%20that,a%2019%25%20increase%20in%20sales." 
                            target="_blank">19% in sales</a>. Product recommendations generate <a 
                            href="https://www.mckinsey.com/industries/retail/our-insights/how-retailers-can-keep-up-with-consumers"
                            target="_blank">35% of Amazon sales and 75%</a> of what people watch on Netflix.</p>
                        <H3 className='mt-3'>Leverage digital receipts data to personalize recommendations</H3>
                        <p>Nearly <a href="https://www.pymnts.com/study/item-level-receipt-data-technology-merchant-innovation-strategy/" target="_blank">
                    9 out of 10 firms (88%)</a> believe the most important impact data can have is on personalization.
                    Retailers can leverage digital receipt data to enhance customers post-purchase experience 
                    by including personalized recommendations the receipt itself delivering relevant targeted marketing 
                    for customers.</p>
                    <Image
                        src="/rsc/diagrams/personalizationDiagram.png"
                        alt="Dataworkz + MDB architecture"
                        layout="responsive"
                        width={100} // Arbitrary width for setting aspect ratio
                        height={60} // Arbitrary height to set the aspect ratio
                    />
                    </Container>
                </Tab>
                <Tab className={``} name="Behind the scenes">
                    <Container className={` p-3 h-100`}>
                        <H3>Feature goal</H3>
                        <p>The main goal of this feature is to deliver real-time personalized recommendations using <mark>Atlas Vector Search, Voyage AI embeddings, and Azure components</mark></p>
                        <H3 className='mt-3'>Architecture Overview: Product recommendations </H3>
                        <Image
                            src="/rsc/diagrams/digital-receipts-high-level.png"
                            alt="Dataworkz + MDB architecture"
                            layout="responsive"
                            width={100} // Arbitrary width for setting aspect ratio
                            height={60} // Arbitrary height to set the aspect ratio
                            style={{maxWidth: '800px'}}
                        />
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr>
                            <th style={{border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2'}}>Component</th>
                            <th style={{border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2'}}>Cloud</th>
                            <th style={{border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2'}}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Frontend &amp; Order/User Management</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>GCP (Next.js)</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>User interface and order processing, hosted on GCP</td>
                            </tr>
                            <tr>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Invoice &amp; Recommendation Services</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Azure App Service (Python)</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Event-driven invoice creation and instant recommendations; microservices hosted on Azure App Service</td>
                            </tr>
                            <tr>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>MongoDB Atlas</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>MongoDB Atlas</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Centralized data layer for orders, invoices, users, and recommendations</td>
                            </tr>
                            <tr>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Azure Functions</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Azure (Python)</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Simulates external metadata service for invoices</td>
                            </tr>
                            <tr>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Azure Blob Storage</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Azure</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Secure, efficient storage of unstructured data</td>
                            </tr>
                            <tr>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Voyage AI</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>External AI Service</td>
                            <td style={{border: '1px solid #ddd', padding: '8px'}}>Provides product vector embeddings</td>
                            </tr>
                        </tbody>
                        </table>
                    </Container>
                </Tab>
            </Tabs>
            <ModalFooter />
        </Modal>
    )
}

export default DigitalReceiptComp;