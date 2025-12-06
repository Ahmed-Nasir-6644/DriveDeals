import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // <-- React Router
import styles from "../styles/AdDetail.module.css";
import ImageSlider from "../components/ImageSlider";

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

export default function AdDetailPage() {
  const { id } = useParams(); // <-- Works in React now
  const [ad, setAd] = useState<Ad | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAd() {
      try {
        console.log(`${id}`);
        const res = await fetch(`http://localhost:3000/ads/get/adById/${id}`, {
          method: "GET",
        });

        if (!res.ok) throw new Error("Failed to fetch ad");

        const data = await res.json();

        let parsedFeatures: string[] = [];

        // Parse features properly
        if (typeof data.features === "string") {
          try {
            parsedFeatures = JSON.parse(data.features);
          } catch {
            parsedFeatures = data.features
              .replace("[", "")
              .replace("]", "")
              .replaceAll('"', "")
              .split(",")
              .map((f: string) => f.trim());
          }
        } else if (Array.isArray(data.features)) {
          parsedFeatures = data.features;
        }

        setAd(data);
        setFeatures(parsedFeatures);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAd();
  }, [id]);

  if (loading) return <p className={styles.message}>Loading...</p>;
  if (!ad) return <p className={styles.message}>Ad not found.</p>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <section className={styles.header}>
        <h1 className={styles.title}>
          {ad.make} {ad.model} {ad.variant}
        </h1>
        <p className={styles.price}>Price: PKR {ad.price} lacs</p>
      </section>

      {/* Image slider */}
      {ad.images && ad.images.length > 0 && (
        <ImageSlider images={ad.images} />
      )}

      {/* Details Table */}
      <div className={styles.details}>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>
                <strong>Mileage: </strong> {ad.mileage} km
              </td>
              <td>
                <strong>Model year: </strong> {ad.model_year}
              </td>
              <td>
                <strong>Transmission: </strong> {ad.transmission}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Details */}
      <div className={styles.details2}>
        <strong>Additional Details:</strong>
        <ul>
          <li>Location:</li>
          <li>{ad.location}</li>

          <li>Color:</li>
          <li>{ad.color}</li>

          <li>Fuel Type:</li>
          <li>{ad.fuel_type}</li>

          <li>Last Updated:</li>
          <li>{new Date(ad.updated_at).toDateString()}</li>

          <li>Ad Id:</li>
          <li>#{ad.id}</li>
        </ul>
      </div>

      {/* Features */}
      <div className={styles.details3}>
        <strong>Features:</strong>
        {Array.isArray(features) && features.length > 0 ? (
          <ul>
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        ) : (
          <p>No features available</p>
        )}
      </div>

      {/* Description */}
      <p className={styles.description}>
        <strong>
          Seller Comments:
          <br />
        </strong>
        {ad.description}
      </p>

      {/* User Info */}
      <div className={styles.userBox}>
        <h2 className={styles.subtitle}>Posted By</h2>
        <p>
          Owner: {ad.owner?.first_name ?? "Unknown"} {ad.owner?.last_name}
        </p>
        <p className={styles.date}>
          Posted on {new Date(ad.created_at).toDateString()}
        </p>
      </div>
    </div>
  );
}
