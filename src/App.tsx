import "./App.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BrowseCars from "./pages/BrowseCars";
import AdDetailPage from "./pages/Ad";
import VerifiedSuccess from "./pages/verify-success";
import VerifyFailed from "./pages/verify-failed";
import MyAdsPage from "./pages/Myads";
import AboutUs from "./pages/AboutUS";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="BrowseCars" element={<BrowseCars />} />
        <Route path="/ad/:id" element={<AdDetailPage />} />
        <Route path="/verify-success" element={<VerifiedSuccess />} />
        <Route path="/verify-failed" element={<VerifyFailed />} />
        <Route path="/myAds" element={<MyAdsPage />} />
        <Route path="/AboutUs" element={<AboutUs />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
