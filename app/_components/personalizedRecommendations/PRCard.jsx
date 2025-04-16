import React from 'react'
import { useDispatch } from 'react-redux';
import Image from 'next/image'
import { Subtitle } from '@leafygreen-ui/typography';
import { setOpenedProductDetails } from '@/redux/slices/ProductsSlice';
import Badge from '@leafygreen-ui/badge';
import Icon from '@leafygreen-ui/icon';

import './prCard.css'

const PRCard = (props) => {
    const { 
        id = 1234, 
        image = null, 
        name = 'Product Name', 
        brand = 'Brand Name', 
        price = 0.00, 
        vectorSearchScore = null
    } = props.product;
    const dispatch = useDispatch();

    const onProductClick = () => {
        dispatch(setOpenedProductDetails({
            id,
            photo: image,
            name,
            brand,
            price,
            items: [],
        }))
    }

    return (
        <div className='PRCard cursorPointer' onClick={() => onProductClick()}>
            <div className='d-flex flex-column'>
                <div className='scoreContainer'>
                    {
                        vectorSearchScore &&
                        <Badge className='scorebadge' variant="yellow">
                            <Icon glyph="Favorite" />
                            {Number(vectorSearchScore).toFixed(5)}
                        </Badge>
                    }
                </div>
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
                    <Subtitle className="text-secondary">${price}</Subtitle>
                </div>
            </div>
        </div>
    )
}

export default PRCard