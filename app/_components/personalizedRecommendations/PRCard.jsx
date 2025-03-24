import React from 'react'
import Image from 'next/image'
import { H1, H2, H3, Subtitle, Description } from '@leafygreen-ui/typography';


const PRCard = () => {
    return (
        <div className='PRCard'>
            <div className='d-flex flex-column'>
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