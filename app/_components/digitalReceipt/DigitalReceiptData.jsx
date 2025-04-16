import { useSelector } from 'react-redux';
import { Subtitle, Description } from '@leafygreen-ui/typography';

import Image from 'next/image'
import React from 'react'
import PRCard from '../personalizedRecommendations/PRCard';
import { prettifyDateFormat } from '@/lib/helpers';
import Icon from '@leafygreen-ui/icon';

const DigitalReceiptData = () => {
    const openedInvoice = useSelector(state => state.Invoice.openedInvoice)

    const onDownloadInvoice = () => {
        console.log('onDownloadInvoice')
    }

    return (
        <div className='DigitalReceiptData w-100 d-flex flex-column align-items-center'>
            <div className='w-100 d-flex justify-content-center mb-2'>
                <Image
                    src="/leafyLogo.png"
                    alt="Logo"
                    width={208}
                    height={54}
                />
            </div>
            <Description>Created in {prettifyDateFormat(openedInvoice?.createdAt)}</Description>
            <Description>Order Id #{openedInvoice?.orderId}</Description>
            <div className='products-container mt-3'>
                <strong className='m-0'>Items</strong>
                <hr className='mt-0'></hr>
                <div className='product-price-list'>
                    <p className='mt-0'>#</p>
                    <p className='ms-4'>Product</p>
                    <p className='ms-4'>Price</p>
                </div>
                {
                    openedInvoice?.items.map((prod, index) => (
                        <div className='product-price-list' key={index}>
                            <p >{index + 1}</p>
                            <p className='ms-4 w-100'>{prod.name}</p>
                            <p className='ms-4'>${prod?.price.amount}</p>
                        </div>
                    ))
                }
                <strong className='m-0'>Details</strong>
                <hr className='mt-0'></hr>
                <div className='product-price-list'>
                    <p >Total</p>
                    <p className='ms-4'></p>
                    <p className='ms-4'>${openedInvoice?.metadata?.erpDetails?.totalAmount?.toFixed(2)}</p>
                </div>
                <div className='product-price-list'>
                    <p >Tax</p>
                    <p className='ms-4'></p>
                    <p className='ms-4'>${openedInvoice?.metadata?.erpDetails?.totalTax}</p>
                </div>
                <div className='product-price-list'>
                    <p >SUBTOTAL</p>
                    <p className='ms-4'></p>
                    <strong className='ms-4' style={{color: 'green'}}>${openedInvoice?.metadata?.erpDetails?.subtotal}</strong>
                </div>
                <strong className='m-0'>Loyalty</strong>
                <hr className='mt-0'></hr>
                <div className='product-price-list'>
                    <p >Points earned</p>
                    <p className='ms-4'></p>
                    <p className='ms-4'>+{openedInvoice?.metadata?.loyaltyRewards?.pointsEarned}</p>
                </div>
                <div className='product-price-list'>
                    <p >Tier</p>
                    <p className='ms-4'></p>
                    <p className='ms-4'>{openedInvoice?.metadata?.loyaltyRewards?.tier}</p>
                </div>
                <hr className='mt-0'></hr>
                <div className='d-flex justify-content-center mb-3 w-100'>
                    <p className='fake-link' onClick={() => onDownloadInvoice()}>Download receipt as PDF <Icon glyph='Download' /></p>
                </div>
            </div>
            <div className='products-container'>
                <Subtitle className="ms-0">Based on this order you might also like</Subtitle>
                <div className='recommendations-list mt-3'>
                    {
                        openedInvoice?.recommendations.length > 0
                        ? openedInvoice?.recommendations.map((prod, index) => (
                            <PRCard key={index} product={prod} />
                        ))
                        : [0, 1, 2, 3, 4, 5].map((prod, index) => (
                            <PRCard key={index} product={prod} />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default DigitalReceiptData