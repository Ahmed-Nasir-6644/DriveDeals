import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/HomePage.module.css";

interface Ad {
  id: number;
  make: string;
  model: string;
  variant: string;
  images: string[];
  created_at: string;
  price: number;
}

const HomePage: React.FC = () => {
  const [recentAds, setRecentAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/get/ads`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .sort(
            (a: Ad, b: Ad) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 10);
        setRecentAds(sorted);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  return (
    <main className={styles.container}>
      {/* HEADER */}
      <section className={styles.header}>
        <h1 className={styles.title}>Find Used Cars in Pakistan</h1>
        <p className={styles.subtitle}>Browse, explore, and get the best deals.</p>
      </section>

      {/* SLIDER */}
      <section className={styles.sliderWrapper}>
        <h2 className={styles.sectionTitle}>Recently Added Cars</h2>

        <div className={styles.slider}>
          {recentAds.map((ad) => (
            <Link to={`/ad/${ad.id}`} key={ad.id} className={styles.slideCard}>
              <img
                src={ad.images?.[0] || "/placeholder-car.jpg"}
                alt={ad.model}
                className={styles.slideImage}
              />
              <div className={styles.slideText}>
                <h3>{ad.make} {ad.model} {ad.variant}</h3>
                <p>PKR {ad.price} lacs</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BUTTON GRID */}
      <section className={styles.grid}>
        <Link to="/BrowseCars" className={styles.card}>
          <h2>Browse Cars</h2>
          <p>Explore all available listings</p>
        </Link>

        <Link to="/my-bids" className={styles.card}>
          <h2>My Bids</h2>
          <p>Track your current and past bids</p>
        </Link>

        <Link to="/AboutUs" className={styles.card}>
          <h2>About Us</h2>
          <p>Learn more about Drive Deals</p>
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
