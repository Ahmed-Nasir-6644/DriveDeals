import styles from "../styles/AboutUs.module.css";

export default function AboutUs() {
  return (
    <main className={styles.container}>
      {/* Header */}
      <section className={styles.header}>
        <h1>About Drive Deals</h1>
      </section>

      {/* Services */}
      <section className={styles.services}>
        <h2>Our Services</h2>
        <ul>
          <li>Browse thousands of car listings across Pakistan.</li>
          <li>
            Post your car for sale with detailed specifications and images.
          </li>
          <li>Get AI-powered recommended cars based on your preferences.</li>
          <li>Secure messaging between buyers and sellers.</li>
          <li>Track your ads and bids easily through your dashboard.</li>
        </ul>
      </section>

      {/* Location */}
      <section className={styles.location}>
        <h2>Visit Us</h2>
        <p>Our head office is located at FAST NUCES Lahore:</p>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13610.206625981898!2d74.29717394075784!3d31.481517229016166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391903f08ebc7e8b%3A0x47e934f4cd34790!2sFAST%20NUCES%20Lahore!5e0!3m2!1sen!2sus!4v1765091897280!5m2!1sen!2sus"
            width="100%"
            height="450"
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* Developers */}
      <section className={styles.team}>
        <h2>Meet Our Developers</h2>
        <div className={styles.teamGrid}>
          <div className={styles.teamMember}>
            <h3>Ahmed Nasir</h3>
            <p>ahmednasir1212a@gmail.com</p>
          </div>
          <div className={styles.teamMember}>
            <h3>Shahzaib Bukhari</h3>
            <p>shahzaibbukhari2004@gmail.com</p>
          </div>
          <div className={styles.teamMember}>
            <h3>Aanish Waseem</h3>
            <p>aanish.waseem116@gmail.com</p>
          </div>
        </div>
      </section>
    </main>
  );
}
