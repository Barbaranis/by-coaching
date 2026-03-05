import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import logo from "../assets/logo.png";
import "../style/header.css";


export default function Header({
  brand = "BY Coaching",
  ctaLabel = "Réserver",
  ctaTo = "/reservation",
}) {


  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);


  const showBack = useMemo(() => location.pathname !== "/", [location.pathname]);


  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };


  const closeMenu = () => setMenuOpen(false);


  return (
    <header className="site-header" role="banner">


      <div className="header-container">


        {/* LEFT */}
        <div className="header-left">


          {showBack ? (
            <button
              type="button"
              className="header-back"
              onClick={handleBack}
              aria-label="Revenir à la page précédente"
            >
              <span className="header-backIcon" aria-hidden="true">←</span>
              <span className="header-backText">Retour</span>
            </button>
          ) : (
            <span className="header-back header-back--placeholder" aria-hidden="true" />
          )}


          <Link to="/" className="header-brand" aria-label="Retour à l'accueil">


            <span className="logo-wrap" aria-hidden="true">
              <img src={logo} alt="" className="header-logo" />
              <span className="logo-glow" aria-hidden="true" />
            </span>


            <span className="brand-text">
              <span className="brand-title">{brand}</span>
              <span className="brand-sub">Coaching premium · Paris</span>
            </span>


          </Link>
        </div>




        {/* NAV DESKTOP */}
        <nav className="header-nav" aria-label="Navigation principale">


          <NavLink className="header-link" to="/">
            Accueil
          </NavLink>


          <NavLink className="header-link" to="/reservation">
            Réservation
          </NavLink>


          <NavLink className="header-link" to="/contact">
            Contact
          </NavLink>


          <NavLink className="header-link" to="/a-propos">
            À propos
          </NavLink>


        </nav>




        {/* RIGHT */}
        <div className="header-right">


          <Link className="header-cta" to={ctaTo}>
            {ctaLabel}
          </Link>


          {/* BURGER MOBILE */}
          <button
            className="burger"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>


        </div>


      </div>




      {/* MENU MOBILE */}
      {menuOpen && (
        <nav className="mobile-menu" aria-label="Navigation mobile">


          <NavLink className="mobile-link" to="/" onClick={closeMenu}>
            Accueil
          </NavLink>


          <NavLink className="mobile-link" to="/reservation" onClick={closeMenu}>
            Réservation
          </NavLink>


          <NavLink className="mobile-link" to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>


          <NavLink className="mobile-link" to="/a-propos" onClick={closeMenu}>
            À propos
          </NavLink>


          <Link className="mobile-cta" to={ctaTo} onClick={closeMenu}>
            {ctaLabel}
          </Link>


        </nav>
      )}


    </header>
  );
}

