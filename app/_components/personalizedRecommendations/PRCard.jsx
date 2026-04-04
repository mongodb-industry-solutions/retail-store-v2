import React from 'react'
import { useDispatch } from 'react-redux';
import Image from 'next/image'
import { Subtitle } from '@leafygreen-ui/typography';
import { setOpenedProductDetails } from '@/redux/slices/ProductsSlice';
import { fetchproduct } from '@/lib/api';

import './prCard.css'

const PRCard = (props) => {
    const product = props.product;
    const { 
        _id = 1234, 
        image = null, 
        name = 'Product Name', 
        brand = 'Brand Name', 
        price = 0.00, 
    } = product;
    const {triggerRef} = props;
    const dispatch = useDispatch();

    const onProductClick = async () => {
        // Fetch full product document so the modal shows all details (description, specs, etc.)
        try {
            const fullProduct = await fetchproduct(_id);
            const merged = fullProduct 
                ? { ...fullProduct, id: fullProduct._id, photo: fullProduct.image?.url || fullProduct.image || image }
                : { ...product, id: _id, photo: image, name, brand, price };
            dispatch(setOpenedProductDetails(merged));
        } catch (err) {
            console.error('Error fetching full product:', err);
            // Fallback to partial data
            dispatch(setOpenedProductDetails({
                ...product,
                id: _id,
                photo: image,
                name,
                brand,
                price,
            }));
        }
    }

    return (
        <div className='PRCard cursorPointer' onClick={() => onProductClick()}>
            <div className='d-flex flex-column' ref={triggerRef}>
                <div className='imageContainer'>
                    {
                        image == null
                        ? <div style={{width: '200px', height: '200px', backgroundColor: 'grey'}}/>
                        : <Image
                            src={image}
                            alt={name}
                            fill
                            quality={50}
                            unoptimized
                            style={{ objectFit: "contain" }}
                        />
                    }
                </div>
                <div className='ms-3 me-3 mt-3'>
                    <Subtitle className="name" title={name}>{name}</Subtitle>
                    <Subtitle className="brand" title={brand}>{brand}</Subtitle>
                    <Subtitle className="text-secondary">
                        {typeof price === "object" && price?.amount != null
                            ? `${price.currency === "USD" ? "$" : price.currency + " "}${price.amount}`
                            : `$${price}`}
                    </Subtitle>
                </div>
            </div>
        </div>
    )
}

export default PRCard