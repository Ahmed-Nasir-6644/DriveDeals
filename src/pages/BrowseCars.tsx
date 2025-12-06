"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/BrowseCars.module.css";

interface Ad {
  id: number;
  make: string;
  model: string;
  variant: string;
  color: string;
  engine_capacity: number;
  fuel_type: string;
  transmission: string;
  mileage: number;
  body_type: string;
  features: string;
  images: string[];
  location: string;
  registered_in: string;
  model_year: number;
  description: string;
  price: number;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export default function BrowseCars() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/ads/get/ads")
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const filteredAds = ads.filter((ad) => {
    const car = `${ad.make} ${ad.model} ${ad.variant}`.toLowerCase();
    return (
      car.includes(search.toLowerCase()) ||
      ad.location.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Cars</h1>

        <input
          type="text"
          placeholder="Search by make, model, variant, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchBar}
        />
      </div>

      {/* LIST OF ADS */}
      <div className={styles.list}>
        {filteredAds.map((ad) => (
          <div key={ad.id} className={styles.card}>
            <img
              src={ad.images?.[0] || "/placeholder-car.jpg"}
              alt={`${ad.make} ${ad.model}`}
              className={styles.image}
            />

            <div className={styles.info}>
              <h2 className={styles.carTitle}>
                {ad.make} {ad.model} {ad.variant}
              </h2>

              <p className={styles.price}>PKR {ad.price} lacs</p>

              <p className={styles.details}>
                {ad.model_year} • {ad.mileage} km • {ad.color}
              </p>

              <p className={styles.location}>
                📍 {ad.location}, Registered in {ad.registered_in}
              </p>

              <p className={styles.desc}>{ad.description}</p>

              <Link to={`/ad/${ad.id}`} className={styles.button}>
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
