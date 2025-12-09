"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/BrowseCars.module.css";
import { FaSlidersH, FaTimes } from "react-icons/fa";

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
  features: string | string[]; // backend may store JSON string or array
  images: string[]; // or pictures string; adjust if needed
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

  // Filter states
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [bodyTypeFilter, setBodyTypeFilter] = useState("");
  const [registeredInFilter, setRegisteredInFilter] = useState("");
  const [yearMin, setYearMin] = useState<number | "">("");
  const [yearMax, setYearMax] = useState<number | "">("");
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [mileageMin, setMileageMin] = useState<number | "">("");
  const [mileageMax, setMileageMax] = useState<number | "">("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/ads/get/ads`)
      .then((res) => res.json())
      .then((data) => setAds(data))
      .catch((err) => console.error("Error:", err));
  }, []);

  // Helpers to normalize features field (backend may store JSON string)
  function parseFeatures(raw: string | string[] | undefined): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: try splitting CSV-like string
      return raw
        .replace("[", "")
        .replace("]", "")
        .replaceAll('"', "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }

  // Build unique filter options from ads
  const {
    makes,
    modelsByMake,
    locations,
    fuels,
    transmissions,
    bodyTypes,
    registeredIns,
    years,
    featuresOptions,
    priceRange,
    mileageRange,
  } = useMemo(() => {
    const makesSet = new Set<string>();
    const modelsMap = new Map<string, Set<string>>();
    const locationsSet = new Set<string>();
    const fuelsSet = new Set<string>();
    const transSet = new Set<string>();
    const bodySet = new Set<string>();
    const regSet = new Set<string>();
    const yearsSet = new Set<number>();
    const featuresSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minMileage = Infinity;
    let maxMileage = -Infinity;

    ads.forEach((ad) => {
      if (ad.make) {
        makesSet.add(ad.make);
        if (!modelsMap.has(ad.make)) modelsMap.set(ad.make, new Set());
        if (ad.model) modelsMap.get(ad.make)!.add(ad.model);
      }
      if (ad.location) locationsSet.add(ad.location);
      if (ad.fuel_type) fuelsSet.add(ad.fuel_type);
      if (ad.transmission) transSet.add(ad.transmission);
      if (ad.body_type) bodySet.add(ad.body_type);
      if (ad.registered_in) regSet.add(ad.registered_in);
      if (ad.model_year) yearsSet.add(ad.model_year);
      const feats = parseFeatures(ad.features as any);
      feats.forEach((f) => featuresSet.add(f));
      if (typeof ad.price === "number") {
        minPrice = Math.min(minPrice, ad.price);
        maxPrice = Math.max(maxPrice, ad.price);
      }
      if (typeof ad.mileage === "number") {
        minMileage = Math.min(minMileage, ad.mileage);
        maxMileage = Math.max(maxMileage, ad.mileage);
      }
    });

    // Convert models map to plain object with arrays
    const modelsByMakeObj: Record<string, string[]> = {};
    modelsMap.forEach((set, mk) => {
      modelsByMakeObj[mk] = Array.from(set).sort();
    });

    return {
      makes: Array.from(makesSet).sort(),
      modelsByMake: modelsByMakeObj,
      locations: Array.from(locationsSet).sort(),
      fuels: Array.from(fuelsSet).sort(),
      transmissions: Array.from(transSet).sort(),
      bodyTypes: Array.from(bodySet).sort(),
      registeredIns: Array.from(regSet).sort(),
      years: Array.from(yearsSet).sort((a, b) => b - a), // descending
      featuresOptions: Array.from(featuresSet).sort(),
      priceRange:
        minPrice === Infinity ? { min: 0, max: 0 } : { min: minPrice, max: maxPrice },
      mileageRange:
        minMileage === Infinity ? { min: 0, max: 0 } : { min: minMileage, max: maxMileage },
    };
  }, [ads]);



  function resetFilters() {
    setMakeFilter("");
    setModelFilter("");
    setLocationFilter("");
    setFuelFilter("");
    setTransmissionFilter("");
    setBodyTypeFilter("");
    setRegisteredInFilter("");
    setYearMin("");
    setYearMax("");
    setPriceMin("");
    setPriceMax("");
    setMileageMin("");
    setMileageMax("");
    setSearch("");
  }

  // Main filtering logic
  const filteredAds = ads.filter((ad) => {
    // Search (make model variant or location)
    const car = `${ad.make} ${ad.model} ${ad.variant}`.toLowerCase();
    const searchTerm = search.trim().toLowerCase();
    if (searchTerm) {
      const matchesSearch =
        car.includes(searchTerm) || ad.location.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Make / Model / Location filters
    if (makeFilter && ad.make !== makeFilter) return false;
    if (modelFilter && ad.model !== modelFilter) return false;
    if (locationFilter && ad.location !== locationFilter) return false;

    // Fuel / Transmission / Body / Registered
    if (fuelFilter && ad.fuel_type !== fuelFilter) return false;
    if (transmissionFilter && ad.transmission !== transmissionFilter) return false;
    if (bodyTypeFilter && ad.body_type !== bodyTypeFilter) return false;
    if (registeredInFilter && ad.registered_in !== registeredInFilter) return false;

    // Year range
    if (yearMin !== "" && typeof ad.model_year === "number" && ad.model_year < Number(yearMin))
      return false;
    if (yearMax !== "" && typeof ad.model_year === "number" && ad.model_year > Number(yearMax))
      return false;

    // Price range
    if (priceMin !== "" && typeof ad.price === "number" && ad.price < Number(priceMin)) return false;
    if (priceMax !== "" && typeof ad.price === "number" && ad.price > Number(priceMax)) return false;

    // Mileage range
    if (mileageMin !== "" && typeof ad.mileage === "number" && ad.mileage < Number(mileageMin))
      return false;
    if (mileageMax !== "" && typeof ad.mileage === "number" && ad.mileage > Number(mileageMax))
      return false;

    return true;
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

      {/* FILTER BUTTON */}
      <div className={styles.filterButtonContainer}>
        <button className={styles.filterButton} onClick={() => setShowFilterModal(true)}>
          <FaSlidersH size={18} />
          Filters
        </button>
      </div>

      {/* FILTER MODAL */}
      {showFilterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowFilterModal(false)}>
          <div className={styles.filterModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Filter Cars</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowFilterModal(false)}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.filterGroup}>
                <label>Make</label>
                <select
                  value={makeFilter}
                  onChange={(e) => {
                    setMakeFilter(e.target.value);
                    setModelFilter("");
                  }}
                >
                  <option value="">All</option>
                  {makes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Model</label>
                <select
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  disabled={!makeFilter}
                >
                  <option value="">All</option>
                  {makeFilter &&
                    (modelsByMake[makeFilter] || []).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Location</label>
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="">All</option>
                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Fuel Type</label>
                <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
                  <option value="">All</option>
                  {fuels.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Transmission</label>
                <select value={transmissionFilter} onChange={(e) => setTransmissionFilter(e.target.value)}>
                  <option value="">All</option>
                  {transmissions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Body Type</label>
                <select value={bodyTypeFilter} onChange={(e) => setBodyTypeFilter(e.target.value)}>
                  <option value="">All</option>
                  {bodyTypes.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Registered In</label>
                <select value={registeredInFilter} onChange={(e) => setRegisteredInFilter(e.target.value)}>
                  <option value="">All</option>
                  {registeredIns.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Year (min)</label>
                  <input
                    type="number"
                    placeholder={`${years[years.length - 1] ?? ""}`}
                    value={yearMin}
                    onChange={(e) => setYearMin(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>Year (max)</label>
                  <input
                    type="number"
                    placeholder={`${years[0] ?? ""}`}
                    value={yearMax}
                    onChange={(e) => setYearMax(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Price (min)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.min ?? ""}`}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>Price (max)</label>
                  <input
                    type="number"
                    placeholder={`${priceRange.max ?? ""}`}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label>Mileage (min)</label>
                  <input
                    type="number"
                    placeholder={`${mileageRange.min ?? ""}`}
                    value={mileageMin}
                    onChange={(e) => setMileageMin(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label>Mileage (max)</label>
                  <input
                    type="number"
                    placeholder={`${mileageRange.max ?? ""}`}
                    value={mileageMax}
                    onChange={(e) => setMileageMax(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.resetButton} onClick={resetFilters}>
                Reset Filters
              </button>
              <button className={styles.applyButton} onClick={() => setShowFilterModal(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST OF ADS */}
      <div className={styles.list}>
        {filteredAds.length === 0 ? (
          <p className={styles.message}>No results found.</p>
        ) : (
          filteredAds.map((ad) => (
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
          ))
        )}
      </div>
    </div>
  );
}
