
"use client"
import React, { useState, useEffect, useRef,useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { H1, H3, Disclaimer, Body } from '@leafygreen-ui/typography';
import Tooltip from "@leafygreen-ui/tooltip";
import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
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
import { GUIDE_CUE_MESSAGES, FEATURES } from '@/lib/constants';
import GuideCueContainer from '../_components/guideCueContainer/GuideCuecontainer';  


export default function CartPage() {  
    const router = useRouter();  
    const dispatch = useDispatch();  
    const selectedUser = useSelector(state => state.User.selectedUser);  
    const cart = useSelector(state => state.User.cart);  
    const feature = useSelector(state => state.Global.feature);  
    const isCartReady = !cart.loading;  

    const [open, setOpen] = useState(false);  
  
    // --- Receipts walkthrough refs ---  
    const triggerRefReceipts1 = useRef(null); // My Cart heading  
    const triggerRefReceipts2 = useRef(null); // Checkout button  
  
    // --- OmnichannelOrdering walkthrough refs ---  
    const triggerRefOmnichannel1 = useRef(null); // My Cart heading  
    const triggerRefOmnichannel2 = useRef(null); // Checkout button  
  
    // ✅ Define triggers mapping  
    const triggers = useMemo(() => ({  
        [FEATURES.RECEIPTS]: [  
            triggerRefReceipts1,  
            triggerRefReceipts2  
        ],  
        [FEATURES.OMNICHANNEL_ORDERING]: [  
            triggerRefOmnichannel1,  
            triggerRefOmnichannel2  
        ],  
    }), []);  
  
    // ✅ Build currentConfig using useMemo  
    const currentConfig = useMemo(  
        () =>  
            GUIDE_CUE_MESSAGES.cart[feature]  
                ? {  
                    ...GUIDE_CUE_MESSAGES.cart[feature],  
                    triggers: triggers[feature],  
                    steps: triggers[feature].length,  
                }  
                : null,  
        [feature, triggers]  
    );  
  
    console.log("🛠 Cart Page currentConfig:", currentConfig);  
  
    // ✅ Checkout handler  
    const onCheckout = () => {  
        if (!selectedUser || !selectedUser._id) {  
            alert("Please select a user before proceeding to checkout.");  
            return;  
        }  
  
        if (!cart.products || cart.products.length === 0) {  
            alert("Your cart is empty.");  
            return;  
        }  
  
        const checkoutUrl = feature  
            ? `/checkout?feature=${feature}`  
            : '/checkout';  
  
        console.log("Proceeding to:", checkoutUrl);  
        router.push(checkoutUrl);  
    };  
  
    // ✅ Fill cart handler  
    const onFillCart = async () => {  
        if (selectedUser !== null && (!cart.products || cart.products.length < 1)) {  
            try {  
                dispatch(setCartLoading(true));  
                const cartData = await fillCartRandomly(selectedUser._id);  
                console.log('Fill cart result:', cartData);  
                if (cartData) {  
                    dispatch(setCartProductsList(cartData));  
                }  
                dispatch(setCartLoading(false));  
            } catch (err) {  
                console.log(`Error filling cart: ${err}`);  
                dispatch(setCartLoading(false));  
            }  
        }  
    };  
  
    // ✅ Autofill cart if empty & feature matches  
    useEffect(() => {  
        const autoFillFeatures = [FEATURES.OMNICHANNEL_ORDERING, FEATURES.RECEIPTS];  
  
        if (  
            autoFillFeatures.includes(feature) &&  
            selectedUser !== null &&  
            (!cart.products || cart.products.length === 0)  
        ) {  
            console.log(`✅ Autofilling cart for feature: ${feature}`);  
            onFillCart();  
        }  
    }, [feature, cart.products, selectedUser]);  
  
    return (  
        <>  
            <Navbar />  
            <Container className=''>  
                {/* ✅ GuideCue component */}  
                <GuideCueContainer config={currentConfig} feature={feature} ready={isCartReady}  />  
  
                <div className='d-flex flex-row'>  
                    <div className='d-flex align-items-end w-100'>  
                        <H1>  
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
                         feature === FEATURES.OMNICHANNEL_ORDERING ? triggerRefOmnichannel1 
                         : feature === FEATURES.RECEIPTS ? triggerRefReceipts1 : null  }  
           
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
                                                feature === FEATURES.RECEIPTS ? triggerRefReceipts2:  
                                                feature === FEATURES.OMNICHANNEL_ORDERING ? triggerRefOmnichannel2 : null  
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
            <Footer />  
  
            <CartIndexModal  
                open={open}  
                setOpen={setOpen}  
            />  
        </>  
    );  
}  
