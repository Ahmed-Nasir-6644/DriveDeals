import { Link } from "react-router-dom";
import styles from "../styles/HomePage.module.css";

const HomePage: React.FC = () => {
  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>Find Used Cars in Pakistan</h1>
        <p className={styles.subtitle}>Browse, bid, and win your dream car.</p>

        <div>
          <input
            type="text"
            placeholder="Search by make, model..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>Search</button>
        </div>
      </section>

      {/* Links to Other Pages */}
      <section className={styles.grid}>
        <Link to="/BrowseCars" className={styles.card}>
          <h2>Browse Cars</h2>
          <p>See all available cars for bidding.</p>
        </Link>

        <Link to="/my-bids" className={styles.card}>
          <h2>My Bids</h2>
          <p>Track your active and past bids.</p>
        </Link>

        <Link to="/contact" className={styles.card}>
          <h2>Contact Us</h2>
          <p>Need help? Reach out to our support team.</p>
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
