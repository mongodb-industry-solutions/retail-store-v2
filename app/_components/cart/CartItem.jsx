"use client";

import React from 'react';
import Card from '@leafygreen-ui/card';
import { Skeleton } from '@leafygreen-ui/skeleton-loader';
import { Subtitle, Body } from '@leafygreen-ui/typography';

import styles from "./cart.module.css";

const CartItem = ({ product = null }) => {

    return (
        <Card
            className={`${styles.cartProductCard}`}
        >
            {
                product === null
                ? <>
                    <Skeleton id="imageSkeleton" className={styles.responsiveImage}></Skeleton>
                    <div className={styles.productInfo}>
                        <Skeleton className='mb-2'></Skeleton>
                        <Skeleton className='mb-2'></Skeleton>
                        <Skeleton className='mb-2'></Skeleton>
                        <Skeleton className=''></Skeleton>
                    </div>
                </>
                : <>
                    <img src={`${product.image.url}`} className={styles.responsiveImage}/>
                    <div className={styles.productInfo}>
                        <Subtitle>{product.name}</Subtitle>
                        <Body className={`weightNormal mt-2 mb-2`}>{product.description}</Body>
                        <Subtitle className={`weightNormal mt-2 mb-2`}>${product.price.amount}</Subtitle>
                        <Subtitle className={`weightNormal`}>Amount: {product.amount || 1}</Subtitle>
                    </div>
                </>
            }

        </Card>
    );
};

export default CartItem;
