

import Link from "next/link";
import styles from "./navbar.module.css";
import Image from "next/image";
import Profile from "../profile/Profile"
import SearchBar from "../searchBar/SearchBar";
import { Container } from "react-bootstrap";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <Container className='d-flex justify-content-between'>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/leafyLogo.png"
              alt="MongoDB logo"
              width={150}
              height={40}
            ></Image>
          </Link>
        </div>

        <div className={styles.links}>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
          {/* <Link href="/contact">Contact</Link> */}
        </div>

        <SearchBar></SearchBar>

        <div className={styles.iconButtons}>
          <Profile></Profile>
        </div>
      </Container>
    </nav>
  )
}

export default Navbar;
