import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Reservation from "./pages/Reservation";
import About from "./pages/About";
import Contact from "./pages/Contact";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import Footer from "./components/Footer";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import "./style/App.css";

export default function App() {
  return (
    <div className="app">
      
      {/* Header global */}
      <Header />

      {/* Contenu des pages */}
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer global */}
      <Footer />
    </div>
  );
}