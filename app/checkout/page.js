"use client";  
import React, { useEffect, useState, useRef } from 'react';  
import { useRouter } from 'next/navigation';  
import { useSelector, useDispatch } from 'react-redux';  
import { H1, H3, Body } from '@leafygreen-ui/typography';  
import Icon from '@leafygreen-ui/icon';  
import { RadioBox, RadioBoxGroup } from '@leafygreen-ui/radio-box-group';  
import { GuideCue } from '@leafygreen-ui/guide-cue';  
  
import FeatureListener from '../_components/featureListener/FeatureListener';  
import Footer from "../_components/footer/Footer";  
import Navbar from "../_components/navbar/Navbar";  
import { Container } from 'react-bootstrap';  
import Button from "@leafygreen-ui/button";  
import { clearCart, createNewOrder, fetchCart, fetchStoreLocations } from '@/lib/api';  
import styles from './checkout.module.css';  
import Card from '@leafygreen-ui/card';  
import HomeAddressComp from '../_components/homeAddressComp/homeAddressComp';  
import BopisComp from '../_components/bopisComp/BopisComp';  
import ProductsModalComp from '../_components/productsModalComp/ProductsModalComp';  
import { CardSkeleton } from '@leafygreen-ui/skeleton-loader';  
import { shippingMethods } from '@/lib/constants';  
import Modal from '@leafygreen-ui/modal';  
import { clearOrder } from '@/redux/slices/OrderSlice';  
import { setCartProductsList, setCartLoading, clearCartProductsList } from '@/redux/slices/UserSlice';  
import { handleCreateNewOrder } from '@/lib/helpers';  
import TalkTrackContainer from '../_components/talkTrackContainer/talkTrackContainer';  
import { checkoutPage } from '@/lib/talkTrack';  
import { GUIDE_CUE_MESSAGES } from '@/lib/constants';  
  
export default function Page() {  
    const router = useRouter();  
    const dispatch = useDispatch();  
    const cart = useSelector(state => state.User.cart);  
    const selectedUser = useSelector(state => state.User.selectedUser);  
    const feature = useSelector(state => state.Global.feature);  
      
    const [shippingMethod, setShippingMethod] = useState(shippingMethods.bopis);  
    const [storeLocations, setStoreLocations] = useState([]);  
    const [selectedStoreLocation, setSelectedStoreLocation] = useState(null);  
    const [productDetailsOpened, setProductDetailsOpened] = useState(false);  
    const [processingNewOrder, setProcessingNewOrder] = useState(false);  
      
    // GuideCue state  
    const [guideCueOpen, setGuideCueOpen] = useState(false);  
    const [currentStep, setCurrentStep] = useState(1);  
  
    // --- Receipts walkthrough refs ---  
    const triggerRefReceipts1 = useRef(null); // Checkout heading  
    const triggerRefReceipts2 = useRef(null); // Payment details section  
    const triggerRefReceipts3 = useRef(null); // Confirm button  
  
    // --- OmnichannelOrdering walkthrough refs ---  
    const triggerRefOmnichannel1 = useRef(null); // Checkout heading  
    const triggerRefOmnichannel2 = useRef(null); // Shipping method selector  
    const triggerRefOmnichannel3 = useRef(null); // Confirm button  
  
    // ✅ Guide configs using constants  
    const guideConfigs = {  
        receipts: {  
            messages: GUIDE_CUE_MESSAGES.checkout.receipts.messages,  
            triggers: [triggerRefReceipts1, triggerRefReceipts2, triggerRefReceipts3]  
        },  
        omnichannelOrdering: {  
            messages: GUIDE_CUE_MESSAGES.checkout.omnichannelOrdering.messages,  
            triggers: [triggerRefOmnichannel1, triggerRefOmnichannel2, triggerRefOmnichannel3]  
        }  
    };  
  
    const currentConfig = guideConfigs[feature] || { messages: [], triggers: [] };  
    const messages = currentConfig.messages;  
    const triggers = currentConfig.triggers;  
    const steps = triggers.length;  
  
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
  
    // Auto-start guide cue if feature matches  
    useEffect(() => {  
        console.log('🛠 Feature from Redux:', feature);  
        if (feature && guideConfigs[feature]) {  
            setTimeout(() => {  
                handleReset();  
                console.log('🚀 Starting walkthrough for feature:', feature);  
            }, 500);  
        }  
    }, [feature]);  
  
    const onConfirmOrder = async () => {  
        setProcessingNewOrder(true);  
        let order = await createNewOrder(  
            selectedUser._id,  
            selectedUser.address,  
            cart.products,  
            shippingMethod,  
            selectedStoreLocation,  
        );  
        setProcessingNewOrder(false);  
        if (order) {  
            dispatch(clearOrder());  
            dispatch(clearCartProductsList());  
            handleCreateNewOrder(order);  
            router.push(`/orderDetails/${order._id}?feature=${feature}`);  
            await clearCart(selectedUser._id);  
        }  
    };  
  
    const onShippingMethodChange = (e) => {  
        setShippingMethod(shippingMethods[e.target.value]);  
        setSelectedStoreLocation(null);  
    };  
  
    useEffect(() => {  
        const getCart = async () => {  
            try {  
                const result = await fetchCart(selectedUser._id);  
                if (result !== null) {  
                    dispatch(setCartProductsList(result));  
                }  
                dispatch(setCartLoading(false));  
            } catch (err) {  
                console.log(`Error fetching cart ${err}`);  
            }  
        };  
        if (cart.loading === true && selectedUser !== null)  
            getCart();  
    }, [selectedUser, cart.loading]);  
  
    useEffect(() => {  
        const getStoreLocations = async () => {  
            try {  
                const result = await fetchStoreLocations();  
                if (result !== null) {  
                    setStoreLocations(result);  
                }  
            } catch (err) {  
                console.log(`Error fetching cart ${err}`);  
            }  
        };  
  
        getStoreLocations();  
    }, []);  
  
    return (  
        <>  
            <FeatureListener />  
            <Navbar />  
            <Container>  
                {/* GuideCue component */}  
                <GuideCue  
                    open={guideCueOpen}  
                    setOpen={setGuideCueOpen}  
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
                    <div className='d-flex align-items-end w-100'>  
                        <H1  
                            ref={  
                                feature === 'receipts' ? triggerRefReceipts1 :  
                                feature === 'omnichannelOrdering' ? triggerRefOmnichannel1 : null  
                            }  
                        >  
                            Checkout  
                        </H1>  
                    </div>  
                    <TalkTrackContainer sections={checkoutPage} />  
                </div>  
  
                <Modal open={processingNewOrder} setOpen={setProcessingNewOrder}>  
                    <H3>Processing order</H3>  
                </Modal>  
  
                {cart.loading ? (  
                    <div className='mt-3'>  
                        <H3 className="mb-2">Payment details</H3>  
                        <CardSkeleton />  
                    </div>  
                ) : cart.products?.length < 1 ? (  
                    <div>Fill cart randomly</div>  
                ) : (  
                    <div className='mt-3'>  
                        <H3 className="mb-2">Payment details</H3>  
                        <Card  
                            className={styles.cardInfo}  
                            ref={  
                                feature === 'receipts' ? triggerRefReceipts2 : null  
                            }  
                        >  
                            <Body><strong>Order: </strong>${cart.totalPrice}</Body>  
                            <Body><strong>Shipping: </strong>$0</Body>  
                            <Body><strong>Total: </strong>${cart.totalPrice}</Body>  
                        </Card>  
  
                        <H3 className="mb-2 mt-3">Shipping address</H3>  
                        <Card  
                            className={styles.cardInfo}  
                            ref={  
                                feature === 'omnichannelOrdering' ? triggerRefOmnichannel2 : null  
                            }  
                        >  
                                <RadioBoxGroup onChange={(e) => onShippingMethodChange(e)} className="radio-box-group-style mb-3">  
                                {Object.keys(shippingMethods).map((methodKey, index) => (  
                                    <RadioBox  
                                        key={methodKey}  
                                        checked={shippingMethod.id === shippingMethods[methodKey].id}  
                                        value={methodKey}  
                                    >  
                                        {shippingMethods[methodKey].label}  
                                    </RadioBox>  
                                ))}  
                            </RadioBoxGroup>  
                            
                            {shippingMethod.id === shippingMethods.bopis.id && (  
                                <BopisComp  
                                    storeLocations={storeLocations}  
                                    setSelectedStoreLocation={setSelectedStoreLocation}    
                                />  
                            )}  
                            
                            {shippingMethod.id === shippingMethods.home.id && (  
                                <HomeAddressComp  
                                address={selectedUser?.address} 
                                containerStyle={styles.cardInfo}  
                                />  
                            )}  


                        </Card>  
  
                        <div className='d-flex flex-row-reverse mt-3'>  
                            <Button  
                                ref={  
                                    feature === 'receipts' ? triggerRefReceipts3 :  
                                    feature === 'omnichannelOrdering' ? triggerRefOmnichannel3 : null  
                                }  
                                variant='primary'  
                                disabled={cart.products?.length === 0 ||  
                                    (shippingMethod.id === shippingMethods.bopis && selectedStoreLocation === null)}  
                                onClick={onConfirmOrder}  
                            >  
                                Confirm & order  
                            </Button>  
                        </div>  
                    </div>  
                )}  
            </Container>  
            <Footer />  
            <ProductsModalComp  
                open={productDetailsOpened}  
                handleClose={() => setProductDetailsOpened(false)}  
                products={cart.products}  
            />  
        </>  
    );  
}  