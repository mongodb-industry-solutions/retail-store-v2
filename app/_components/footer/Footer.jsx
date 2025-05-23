import styles from './footer.module.css'; 
import Image from "next/image";

const Footer = () => {
  return (
    <footer className={styles.footer}>

      <div className={styles.footerBottom}>
        <p>&copy; 2025 .local Pop-Up. All rights reserved</p>
      </div>

      <div className={styles.footerLogo}>
        <Image src="/MongoDB_footer.svg" alt="MongoDB Logo" width={100} height={22}></Image>
      </div>

    </footer>

  )
}

export default Footer;
