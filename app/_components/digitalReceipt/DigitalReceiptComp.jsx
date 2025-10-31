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
import { GuideCue } from '@leafygreen-ui/guide-cue';  
import { useEffect, useRef } from 'react';  
  
import { GUIDE_CUE_MESSAGES, FEATURES } from '@/lib/constants';  
  
const DigitalReceiptComp = () => {  
    const [selected, setSelected] = useState(0);  
    const openedInvoice = useSelector(state => state.Invoice.openedInvoice);  
    const dispatch = useDispatch();  
    const feature = useSelector(state => state.Global.feature);  
    const [guideCueOpen, setGuideCueOpen] = useState(false);  
    const [currentStep, setCurrentStep] = useState(1);  
      
    // ✅ State for portal container to avoid SSR issues  
    const [portalContainer, setPortalContainer] = useState(null);  
  
    // Create refs for each step  
    const triggerRef1 = useRef(null); // Digital receipt header  
    const triggerRef2 = useRef(null); // Items section      
    const triggerRef3 = useRef(null); // Recommendations section  
    const triggerRef4 = useRef(null); // Download button  
  
    // ✅ Guide configs using constants  
    const guideConfigs = {  
        [FEATURES.RECEIPTS]: {  
          messages: GUIDE_CUE_MESSAGES.digitalReceipt.receipts.messages,  
          triggers: [triggerRef1, triggerRef2, triggerRef3, triggerRef4]  
        }  
      };  
  
    const currentConfig = guideConfigs[feature] || { messages: [], triggers: [] };  
    const messages = currentConfig.messages;  
    const triggers = currentConfig.triggers;  
    const steps = triggers.length;  
  
    // Handler functions  
    const handleNext = () => {  
        if (currentStep < steps) {  
            setCurrentStep(n => n + 1);  
            setGuideCueOpen(true);  
        } else {  
            setGuideCueOpen(false);  
        }  
    };  
  
    const handleDismiss = () => {  
        console.log("Guide dismissed");  
        setGuideCueOpen(false);  
    };  
  
    const handleReset = () => {  
        setCurrentStep(1);  
        setGuideCueOpen(true);  
    };  
  
    // ✅ Set portal container only on client side  
    useEffect(() => {  
        if (typeof window !== 'undefined') {  
            setPortalContainer(document.activeElement || document.body);  
        }  
    }, []);  
  
    // ✅ Start walkthrough when feature is active and update portal container  
    useEffect(() => {  
        if (openedInvoice !== null && (feature === 'digitalReceipts' || feature === 'receipts')) {  
            setTimeout(() => {  
                // Update portal container  
                if (typeof window !== 'undefined') {  
                    setPortalContainer(document.activeElement || document.body);  
                }  
                  
                handleReset();  
                console.log('🚀 Starting digital receipt walkthrough for feature:', feature);  
            }, 500);  
        }  
    }, [openedInvoice, feature]);  
  
    const handleClose = () => {  
        dispatch(setOpenedInvoice(null));  
    };  
  
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
            {/* ✅ Only render GuideCue when portalContainer is available */}  
            {portalContainer && (  
                <GuideCue  
                    open={guideCueOpen}  
                    setOpen={setGuideCueOpen}  
                    refEl={triggers[currentStep - 1]}  
                    numberOfSteps={steps}  
                    currentStep={currentStep}  
                    onPrimaryButtonClick={handleNext}  
                    onDismiss={handleDismiss}  
                    title={messages[currentStep - 1]}  
                    portalContainer={portalContainer} // ✅ Use state instead of direct document access  
                >  
                    {messages[currentStep - 1]}  
                </GuideCue>  
            )}  
  
            <ModalHeader className="d-flex flex-row justify-content-between">  
                <div />  
                <div ref={triggerRef1}>  
                    <H3>  
                        <Image width={25} height={25} alt="Chat Icon" src="/rsc/icons/receipt-solid.svg" />  
                        Digital receipt  
                    </H3>  
                </div>  
                <Icon className='cursorPointer' onClick={() => handleClose()} glyph="X" />  
            </ModalHeader>  
  
            <Tabs aria-label="Invoice details tabs" className='tabsModal' setSelected={setSelected} selected={selected}>  
                <Tab className={``} name="Receipt">  
                    <Container className={` p-3 h-100`}>  
                        <DigitalReceiptData  
                            feature={feature}  
                            currentStep={currentStep}  
                            triggerRefs={{  
                                step2: triggerRef2,  
                                step3: triggerRef3,  
                                step4: triggerRef4  
                            }}  
                        />  
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
                                width={100}  
                                height={60}  
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
                        width={100}  
                        height={60}  
                    />    
                    </Container>  
                </Tab>  
                <Tab className={``} name="Behind the scenes">  
                    <Container className={` p-3 h-100`}>  
                        <H3>What's the Value of Digital Receipts — and How Do We Capture It in This Demo?</H3>  
                        <p>This demo shows how retailers can leverage digital receipt data to spark a personalized customer journey — and how MongoDB enables that journey to happen in real time, across both online and physical channels</p>  
                        <Image    
                            src="/rsc/diagrams/digital-receipts-high-level.png"    
                            layout="responsive"    
                            width={100}  
                            height={60}  
                            style={{maxWidth: '650px'}}    
                        />    
                        <p>  </p>  
                        <p>This solution showcases an event-driven architecture where:    
                            <ul>    
                                <li>🧾 An <strong>invoice microservice</strong> captures order data and stores rich, flexible receipts in MongoDB Atlas</li>    
                                <li>⚡ A <strong>recommendation microservice</strong> reacts to each new purchase, generating personalized product suggestions using Vector Search</li>    
                                <li>👤 These recommendations are automatically written into both the invoice and the user profile, enabling a real-time experience that connects in-store and online activity</li>    
                            </ul>    
                        </p>    
                        <Image    
                            src="/rsc/diagrams/components-digital-receipts.png"    
                            layout="responsive"    
                            width={100}  
                            height={60}  
                            style={{maxWidth: '850px'}}    
                        />    
                        <p>Although the demo uses e-commerce, the architecture is designed to reflect real-world retail systems. The <strong>invoice microservice</strong> could easily ingest data from physical stores — using <strong>MongoDB</strong> as a single source of truth to centralize and activate all transaction data.</p>    
                        <p>In this demo, we deploy our microservices on <strong>Azure</strong> and simulate common external integrations involved in digital receipt generation — such as <em>tax calculation</em> and <em>loyalty programs</em> — using <strong>Azure Functions</strong>. When the customer downloads the invoice, it's rendered as a PDF and stored in <strong>Azure Blob Storage</strong>, providing a scalable and easily linkable solution for unstructured files.</p>    
                        <H3>Build AI-powered recommendations using flexible data and easy vector search</H3>    
                        <p>  </p>    
                        <p>In this demo, our products collection stores not only traditional product attributes — like name, price, and category — but also AI-generated vector embeddings that capture the semantic meaning of each item.</p>    
                        <Image    
                            src="/rsc/diagrams/embeddings-and-vector-search.png"    
                            layout="responsive"    
                            width={100}  
                            height={60}  
                            style={{maxWidth: '750px'}}    
                        />    
                        <p>This allows us to use MongoDB Vector Search to find similar items based on meaning. The result: personalized product recommendations in real time, powered by the same flexible data model that stores your catalog.</p>    
                        <H3>Event-Driven Architecture and Seamless Integration with MongoDB</H3>    
                        <p>  </p>    
                        <p> Modern retailers need systems that react instantly, stay decoupled, and scale effectively. That's the strength of event-driven architectures—where services communicate by producing and reacting to events that signal meaningful changes in the system.</p>    
                        <p> In this solution, MongoDB plays a central role in enabling that reactivity. With built-in Change Streams and Atlas Triggers, applications can respond to data changes as they happen, directly within the data layer.</p>    
                        <Image    
                            src="/rsc/diagrams/workflow-architecture.png"    
                            layout="responsive"    
                            width={100}  
                            height={60}  
                            style={{maxWidth: '800px'}}    
                        />    
                        <p>  </p>    
                        <p>    
                         🛒 <strong>A customer places an order</strong>, and the invoice microservice immediately creates a new invoice, storing it in <strong>MongoDB</strong>. As soon as that happens, the recommendation microservice detects the event in real time using <strong>MongoDB Change Streams</strong>. It responds instantly by generating <strong>personalized product suggestions</strong> based on the most expensive item in the purchase.    
                        </p>    
                        <p>    
                         🔁 These <strong>AI-powered recommendations</strong> are saved in a dedicated collection. Then, <strong>Atlas Triggers</strong> automatically propagate them into the invoice document—so the customer receives a <strong>digital receipt with smart suggestions</strong>—and into the user profile, ensuring their homepage reflects their updated preferences right after the purchase.    
                        </p>    
                        <p>    
                         📊 At the same time, MongoDB retains the <strong>full history of purchases and recommendations</strong> across collections. This enables teams to run <strong>analytics</strong> or train smarter <strong>AI models</strong> based on real data.    
                        </p>    
                        <p>    
                        The result is a <strong>seamless, real-time personalization experience</strong> that delights customers and <strong>scales effortlessly</strong>—powered by MongoDB.    
                        </p>    
                    </Container>    
                </Tab>    
                <Tab className={``} name=" Why MongoDB">    
                    <Container className={` p-3 h-100`}>    
                    <h3>🧾 Why MongoDB for Digital Receipts?</h3>    
                        <h4>⚠️ The Challenge</h4>    
                            <p><strong>Retailers face several real-world challenges when managing receipt data:</strong></p>    
                            <ul className="list-disc pl-5 space-y-2">    
                            <li><strong>Fragmented data:</strong> Sales data is duplicated across disconnected tools and legacy systems.</li>    
                            <li><strong>Rigid schemas:</strong> Traditional databases spread complex XML receipt data across many tables—too inflexible for evolving needs.</li>    
                            <li><strong>Slow innovation:</strong> Without a unified view of operational data, real-time insights and AI use cases are hard to implement.</li>    
                            <li><strong>Scalability pressure:</strong> Growing volumes of receipt data can slow down performance, analytics, and customer-facing applications.</li>    
                            <li><strong>Compliance complexity:</strong> Sensitive customer information must meet privacy laws like GDPR—especially for global businesses operating across regions.</li>    
                            </ul>    
                        <h4>✅ How MongoDB Solves It</h4>    
                            <p><strong>MongoDB's developer data platform is built to solve these exact challenges:</strong></p>    
                            <ul className="list-disc pl-5 space-y-2">    
                            <li><strong>Schema flexibility:</strong> Its document model fits the data, not the other way around. You can store receipts as-is and add fields (like recommendations) anytime—without downtime.</li>    
                            <li><strong>Centralized operational layer:</strong> Consolidates data from multiple sources into a single source of truth—breaking silos and simplifying integration.</li>    
                            <li><strong>Real-time activation:</strong> Supports Change Streams and Triggers to instantly react to purchases and personalize the customer experience.</li>    
                            <li><strong>Scalability & performance:</strong> Uses sharding for horizontal scaling and replica sets for high availability, while enabling workload isolation for analytics, AI, or reporting.</li>    
                            <li><strong>Security & compliance:</strong> Built-in features like encryption, auditing, and zone sharding help meet GDPR requirements and ensure data stays close to where it's generated.</li>    
                            </ul>    
                    </Container>    
                </Tab>    
            </Tabs>  
            <ModalFooter />  
        </Modal>  
    )  
}  
  
export default DigitalReceiptComp;  
