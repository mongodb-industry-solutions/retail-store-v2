
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { H1, H3, Disclaimer, Body } from '@leafygreen-ui/typography';
import Tooltip from "@leafygreen-ui/tooltip";
import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import FeatureListener from '../_components/featureListener/FeatureListener';
import Footer from "../_components/footer/Footer";
import Navbar from "../_components/navbar/Navbar";
import { Container } from 'react-bootstrap';
import Button from "@leafygreen-ui/button";
import { fillCartRandomly } from '@/lib/api';
import CartItem from '../_components/cart/CartItem';
import { setCartLoading, setCartProductsList } from '@/redux/slices/UserSlice';
import CartIndexModal from '../_components/whereMDB_cartIndex/CartIndexModal';
import TalkTrackContainer from '../_components/talkTrackContainer/talkTrackContainer';
import { cartPage } from '@/lib/talkTrack';
import { GuideCue } from '@leafygreen-ui/guide-cue';
import { GUIDE_CUE_MESSAGES } from '@/lib/constants';  
  
export default function CartPage() {  
    const router = useRouter();  
    const dispatch = useDispatch();  
    const selectedUser = useSelector(state => state.User.selectedUser);  
    const cart = useSelector(state => state.User.cart);  
    const feature = useSelector(state => state.Global.feature);  
      
    const [open, setOpen] = useState(false);  
    const [currentStep, setCurrentStep] = useState(1);  
    const [guideCueOpen, setGuideCueOpen] = useState(false);  
  
    // --- Receipts walkthrough refs ---  
    const triggerRefReceipts1 = useRef(null); // My Cart heading  
    const triggerRefReceipts2 = useRef(null); // Products section  
    const triggerRefReceipts3 = useRef(null); // Checkout button  
  
    // --- OmnichannelOrdering walkthrough refs ---  
    const triggerRefOmnichannel1 = useRef(null); // My Cart heading  
    const triggerRefOmnichannel2 = useRef(null); // Fill Cart button  
    const triggerRefOmnichannel3 = useRef(null); // Checkout button  
  
    // ✅ Guide configs using constants  
    const guideConfigs = {  
        receipts: {  
            messages: GUIDE_CUE_MESSAGES.cart.receipts.messages,  
            triggers: [triggerRefReceipts1, triggerRefReceipts2, triggerRefReceipts3]  
        },  
        omnichannelOrdering: {  
            messages: GUIDE_CUE_MESSAGES.cart.omnichannelOrdering.messages,  
            triggers: [triggerRefOmnichannel1, triggerRefOmnichannel2, triggerRefOmnichannel3]  
        }  
    };  
  
    const currentConfig = guideConfigs[feature] || { messages: [], triggers: [] };  
    const messages = currentConfig.messages;  
    const triggers = currentConfig.triggers;  
    const steps = triggers.length;  
  
    const onCheckout = () => {  
        if (!selectedUser || !selectedUser._id) {  
            alert("Please select a user before proceeding to checkout.");  
            return;  
        }  
  
        if (!cart.products || cart.products.length === 0) {  
            alert("Your cart is empty.");  
            return;  
        }  
  
        // Close any guide cues first  
        setGuideCueOpen(false);  
  
        const checkoutUrl = feature  
            ? `/checkout?feature=${feature}`  
            : '/checkout';  
  
        console.log("Proceeding to:", checkoutUrl);  
        console.log("selectedUser:", selectedUser?._id);  
        console.log("cart products:", cart?.products?.length);  
        router.push(checkoutUrl);  
    };  
  
    const onFillCart = async () => {  
        if (selectedUser !== null && cart.products?.length < 1) {  
            try {  
                dispatch(setCartLoading(true))  
                const cart = await fillCartRandomly(selectedUser._id);  
                console.log('result', cart)  
                if (cart)  
                    dispatch(setCartProductsList(cart))  
                dispatch(setCartLoading(false))  
            } catch (err) {  
                console.log(`Error filling cart ${err}`)  
            }  
        }  
    };  
  
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
  
    return (  
        <>  
            <FeatureListener />  
            <Navbar></Navbar>  
            <Container className=''>  
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
                            className=''  
                        >  
                            My cart  
                        </H1>  
                        <Tooltip  
                            trigger={  
                                <IconButton className='mb-2 ms-2' aria-label="Info" onClick={() => setOpen((prev) => !prev)}>  
                                    <Icon glyph="Wizard" />  
                                </IconButton>  
                            }  
                        >  
                            Learn more  
                        </Tooltip>  
                        <Button  
                            ref={  
                                feature === 'omnichannelOrdering' ? triggerRefOmnichannel2 : null  
                            }  
                            size='small'  
                            className='ms-3 mb-2'  
                            disabled={cart.loading || cart.error || cart.products?.length > 0}  
                            onClick={() => onFillCart()}  
                        >  
                            Fill cart  
                        </Button>  
                    </div>  
                    <TalkTrackContainer sections={cartPage} />  
                </div>  
  
                <div  
                    className='mt-3'  
                    ref={  
                        feature === 'receipts' ? triggerRefReceipts2 : null  
                    }  
                >  
                    <H3 className="mb-2">Products</H3>  
                    {  
                        cart.loading === true  
                            ? [0, 1, 2].map((item) => (  
                                <CartItem  
                                    key={`loading-product-${item}`}  
                                    product={null}  
                                />  
                            ))  
                            : cart.products?.length > 0  
                                ? <div>  
                                    {cart.products.map((product, index) => (  
                                        <CartItem  
                                            key={`cart-product-${index}`}  
                                            product={product}  
                                        />  
                                    ))}  
                                    <div className='d-flex flex-row-reverse mt-3'>  
                                        <Body>Subtotal ({cart.totalAmount} product{cart.totalAmount > 1 ? 's' : ''}): <strong>${cart.totalPrice}</strong></Body>  
                                    </div>  
                                    <div className='d-flex flex-row-reverse mt-3'>  
                                        <Button  
                                            ref={  
                                                feature === 'receipts' ? triggerRefReceipts3 :  
                                                feature === 'omnichannelOrdering' ? triggerRefOmnichannel3 : null  
                                            }  
                                            variant='primary'  
                                            onClick={() => onCheckout()}  
                                        >  
                                            Proceed to checkout  
                                        </Button>  
                                    </div>  
                                </div>  
                                : <Disclaimer className='mt-5'>No products found, click on the button above to fill the cart with products</Disclaimer>  
                    }  
                </div>  
            </Container>  
            <Footer></Footer>  
  
            <CartIndexModal  
                open={open}  
                setOpen={setOpen}  
            />  
        </>  
    );  
}  