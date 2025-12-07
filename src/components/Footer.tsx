import React from "react";
import styles from "../styles/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h2 className={styles.logo}>DriveDeals</h2>
          <p className={styles.tagline}>
            Buy & Sell Cars Easily with Trust and Transparency
          </p>
        </div>

        <div className={styles.center}>
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/browse">Browse Cars</a></li>
            <li><a href="/post-ad">Post an Ad</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className={styles.right}>
          <h3>Contact</h3>
          <p>Email: drive.deals.pk@gmail.com</p>
          <p>Phone: +92 307 2003111</p>
          <p>Address: Lahore, Pakistan</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} DriveDeals. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
