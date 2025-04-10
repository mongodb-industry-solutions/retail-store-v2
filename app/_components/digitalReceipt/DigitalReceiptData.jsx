import Image from 'next/image'
import React from 'react'

const DigitalReceiptData = () => {
    return (
        <div className='DigitalReceiptData w-100 d-flex flex-column align-items-center'>
            <div className='w-100 d-flex justify-content-center'>
                <Image
                    src="/leafyLogo.png"
                    alt="Logo"
                    width={208}
                    height={54}
                />
            </div>
            <div className='products-container mt-3'>
                {
                    [0, 1, 2, 3].map((prod, index) => (
                        <div className='product-price-list' key={index}>
                            <p>Product Name {prod}</p>
                            <p>${(index + 1) * 2.1}</p>
                        </div>
                    ))
                }
            </div>
            <div className='recommendations-container'>
                <strong>Based on this order you might also like</strong>
                <div className='recommendations-list mt-3'>
                    {
                        [0, 1, 2, 3].map((prod, index) => (
                            <div className='product-price-list' key={index}>
                                <p>Product Name {prod}</p>
                                <p>${(index + 1) * 2.1}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default DigitalReceiptData