import React from 'react'
import { useDispatch } from 'react-redux';
import Image from 'next/image'
import { H1, H2, H3, Subtitle, Description } from '@leafygreen-ui/typography';
import { setOpenedProductDetails } from '@/redux/slices/ProductsSlice';
import Badge from '@leafygreen-ui/badge';
import Icon from '@leafygreen-ui/icon';


const PRCard = (props) => {
    const { id = 1234, photo, name = 'name', brand, price, pred_price, items } = props;
    const dispatch = useDispatch();

    const onProductClick = () => {
        dispatch(setOpenedProductDetails({
            id,
            photo,
            name,
            brand,
            price,
            pred_price,
            items,
        }))
    }

    return (
        <div className='PRCard cursorPointer' onClick={() => onProductClick()}>
            <div className='d-flex flex-column'>
                <div className='scoreContainer'>
                    {
                        //score &&
                        <Badge className='scorebadge' variant="yellow">
                            <Icon glyph="Favorite" />
                            3.5678
                            {
                            //Number(3.4567).toFixed(5)
                            }
                        </Badge>
                    }
                </div>
                <Image
                    src={'https://m.media-amazon.com/images/I/91dLVqp9bAL.jpg'}
                    alt={'name'}
                    width={200}
                    height={200}
                    quality={50}
                    unoptimized
                />
                <Subtitle className="name">AmazonBasics Linen Style Shower Curtain</Subtitle>
                <Subtitle className="brand">AmazonBasics</Subtitle>
                <Subtitle className="text-secondary">$24.00</Subtitle>
                {/* AmazonBasics */}


            </div>
        </div>
    )
}

export default PRCard