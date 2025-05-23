"use client";
import styles from "./banner.module.css";
import Link from "next/link";
import "../../fonts.css";
import Image from "next/image";
import { H1, Body } from '@leafygreen-ui/typography';
import Button from "@leafygreen-ui/button";
import { Container } from "react-bootstrap";

const Banner = () => {

    return (
        <div className={styles.bannerContainer}>
            <Container className="d-flex">
                <div className={styles.bannerText}>

                    <H1 className={styles.title}>Welcome to the Pop-Up Store!</H1>

                    <Body className={styles.body}> 
                        Feel free to explore the website, add items to your cart, and navigate through the various pages
                        and enjoy exploring the capabilities of MongoDB!
                    </Body>

                    <Button className={styles.shopButton}>
                        <Link href="/shop">Shop Now</Link>
                    </Button>
                </div>
                <div className={styles.imgContainer}>
                    <Image 
                        src="/placeholder.png" 
                        alt="Cart" 
                        // width={550} 
                        // height={auto}
                        layout="responsive"
                        width={80} // Arbitrary width for setting aspect ratio
                        height={40} // Arbitrary height to set the aspect ratio
                    />
                </div>
            </Container>
        </div>
    )
}

export default Banner;
