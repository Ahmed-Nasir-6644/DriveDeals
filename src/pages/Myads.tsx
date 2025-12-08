import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // react-router-dom
import styles from "../styles/MyAds.module.css"; // adjust path if needed
import { FaTimes } from "react-icons/fa";

// Enum placeholders
const FuelTypes = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
const BodyTypes = ["SEDAN", "SUV", "CROSSOVER", "HATCHBACK", "VAN", "MNIVAN", "COUPE", "DEFAULT"];
const RegisteredIn = ["LAHORE", "PUNJAB", "SINDH", "ISLAMABAD", "KPK", "BALOCHISTAN", "UNREGISTERED"];
const FeatureOptions = ["ABS","AM/FM Radio","Air Bags","Air Conditioning","Alloy Wheels","Immobilizer Key","Keyless Entry","Navigation System","Power Locks","Power Mirrors","Power Steering","Power Windows","Climate Control","Cruise Control","Front Camera","Speakers","Steering Switches","Sun Roof","Moon Roof","CoolBox"];
const Transmission = ["MANUAL", "AUTOMATIC"];

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
  features: string[];
  images: string[];
  location: string;
  registered_in: string;
  model_year: number;
  description: string;
  price: number;
  created_at: Date;
  updated_at: Date;
  owner: { id: number; first_name: string; last_name: string };
}

export default function MyAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [newAd, setNewAd] = useState({
    make: "",
    model: "",
    color: "",
    engine_capacity: 0,
    variant: "",
    fuel_type: FuelTypes[0],
    transmission: "",
    mileage: 0,
    body_type: BodyTypes[0],
    features: [] as string[],
    location: "",
    registered_in: RegisteredIn[0],
    model_year: new Date().getFullYear(),
    price: 0,
    description: "",
    files: [] as File[],
  });

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Fetch ads
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/ads/get/adsByOwner", {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredAds = ads.filter((ad) => {
    const car = `${ad.make}${ad.model} ${ad.variant}`;
    return car.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setDeleteError("You must be logged in to delete an ad");
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError("");
      const res = await fetch(`http://localhost:3000/ads/delete/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete ad");
      }

      setAds((prev) => prev.filter((ad) => ad.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete ad");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in to create an ad");

    try {
      const formData = new FormData();
      Object.entries(newAd).forEach(([key, value]) => {
        if (key !== "files") formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      });
      newAd.files.forEach((file) => formData.append("files", file));

      const res = await fetch("http://localhost:3000/ads/post-ad", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error creating ad:", errorData);
        return;
      }

      const createdAd = await res.json();
      setAds((prev) => [...prev, createdAd]);
      setShowPopup(false);
      setNewAd({
        make: "",
        model: "",
        color: "",
        engine_capacity: 0,
        variant: "",
        fuel_type: FuelTypes[0],
        transmission: "",
        mileage: 0,
        body_type: BodyTypes[0],
        features: [],
        location: "",
        registered_in: RegisteredIn[0],
        model_year: new Date().getFullYear(),
        price: 0,
        description: "",
        files: [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeature = (feature: string) => {
    setNewAd((prev) => ({
      ...prev,
      features: prev.features.includes(feature) ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
    }));
  };

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <h1 className={styles.title}>My Ads</h1>
        <p className={styles.subtitle}>Manage your posted ads</p>

        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search by make, model..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {isLoggedIn && (
            <button
              className={styles.createButton}
              onClick={() => setShowPopup(true)}
            >
              ➕ Create Ad
            </button>
          )}
        </div>
      </section>

      <section className={styles.grid}>
        {filteredAds.length === 0 ? (
          <p className={styles.noAds}>No ads found.</p>
        ) : (
          filteredAds.map((ad) => (
            <div key={ad.id} className={styles.card}>
              <div className={styles.left}>
                <Link to = {`/ad/${ad.id}`} ><img
                  src={ad.images?.[0] || "/placeholder-car.png"}
                  alt={`${ad.make} ${ad.model}`}
                  className={styles.thumbnail}
                />
                </Link>
                <div className={styles.details}>
                  <h2>
                    {ad.make} {ad.model} {ad.variant} 
                  </h2>
                  <p className={styles.location}>📍 {ad.location} | {ad.model_year} | {ad.mileage} km</p>
                </div>
              </div>

              <div className={styles.right}>
                <p className={styles.price}>PKR {ad.price} lac</p>
                <Link to={`/ad/${ad.id}`} className={styles.viewButton}>
                  View Details
                </Link>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    setDeleteTarget(ad);
                    setDeleteError("");
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {deleteTarget && (
        <div className={styles.deleteOverlay}>
          <div className={styles.deleteModal}>
            <h3>Delete this ad?</h3>
            <p>
              Are you sure you want to delete {deleteTarget.make} {deleteTarget.model} {deleteTarget.variant}?
            </p>
            {deleteError && <div className={styles.deleteError}>{deleteError}</div>}
            <div className={styles.deleteActions}>
              <button
                className={styles.cancelDeleteButton}
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Form */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button
              className={styles.closeButton}
              onClick={() => setShowPopup(false)}
            >
              <FaTimes />
            </button>
            <h2>Create New Ad</h2>
            <form onSubmit={handleSubmit} className={styles.adForm}>
              <div className={styles.formGroup}>
                <label>Make</label>
                <input
                  type="text"
                  placeholder="Make"
                  value={newAd.make}
                  onChange={(e) => setNewAd({ ...newAd, make: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Model</label>
                <input
                  type="text"
                  placeholder="Model"
                  value={newAd.model}
                  onChange={(e) =>
                    setNewAd({ ...newAd, model: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Model Year</label>
                <input
                  type="number"
                  placeholder="Model Year"
                  value={newAd.model_year}
                  onChange={(e) =>
                    setNewAd({ ...newAd, model_year: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Color</label>
                <input
                  type="text"
                  placeholder="Color"
                  value={newAd.color}
                  onChange={(e) =>
                    setNewAd({ ...newAd, color: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Engine Capacity(cc)</label>
                <input
                  type="number"
                  placeholder="Engine Capacity"
                  value={newAd.engine_capacity}
                  onChange={(e) =>
                    setNewAd({
                      ...newAd,
                      engine_capacity: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Variant</label>
                <input
                  type="text"
                  placeholder="Variant"
                  value={newAd.variant}
                  onChange={(e) =>
                    setNewAd({ ...newAd, variant: e.target.value })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Transmission</label>
                <select
                  value={newAd.transmission}
                  onChange={(e) =>
                    setNewAd({ ...newAd, transmission: e.target.value })
                  }
                >
                  {Transmission.map((tr) => (
                    <option key={tr} value={tr}>
                      {tr}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Mileage</label>
                <input
                  type="number"
                  placeholder="Mileage"
                  value={newAd.mileage}
                  onChange={(e) =>
                    setNewAd({ ...newAd, mileage: Number(e.target.value) })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fuel Type</label>
                <select
                  value={newAd.fuel_type}
                  onChange={(e) =>
                    setNewAd({ ...newAd, fuel_type: e.target.value })
                  }
                >
                  {FuelTypes.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Body Type</label>
                <select
                  value={newAd.body_type}
                  onChange={(e) =>
                    setNewAd({ ...newAd, body_type: e.target.value })
                  }
                >
                  {BodyTypes.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Registered In</label>
                <select
                  value={newAd.registered_in}
                  onChange={(e) =>
                    setNewAd({ ...newAd, registered_in: e.target.value })
                  }
                >
                  {RegisteredIn.map((ri) => (
                    <option key={ri} value={ri}>
                      {ri}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Location"
                  value={newAd.location}
                  onChange={(e) =>
                    setNewAd({ ...newAd, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Upload Car Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setNewAd((prev) => ({
                        ...prev,
                        files: Array.from(e.target.files!),
                      }));
                    }
                  }}
                ></input>
              </div>
              <div className={styles.formGroup}>
                <label>Price</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={newAd.price}
                  onChange={(e) =>
                    setNewAd({ ...newAd, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  className={styles.fullWidth}
                  placeholder="Description"
                  value={newAd.description}
                  onChange={(e) =>
                    setNewAd({ ...newAd, description: e.target.value })
                  }
                  required
                />
              </div>

              {/* Features checkboxes */}
              <div></div>
              <div className={styles.formGroup}>
                <label>Select Features:</label>
              </div>
              <div className={styles.features}>
                {FeatureOptions.map((f) => (
                  <label key={f}>
                    <input
                      type="checkbox"
                      checked={newAd.features.includes(f)}
                      onChange={() => toggleFeature(f)}
                    />
                    {f}
                  </label>
                ))}
              </div>

              <button type="submit" className={styles.submitButton}>
                Create Ad
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
