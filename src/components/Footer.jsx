import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../style/footer.css";

export default function Footer() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Erreur déconnexion:", e);
    }
  };

  const handleScrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div className="footer-container">
        {/* Top */}
        <div className="footer-top">
          <div className="footer-brand">
            <h2 id="footer-title" className="footer-title">
              BY Coaching
            </h2>
            <p className="footer-sub">
              Coaching sportif premium · Séances personnalisées · Paris & alentours
            </p>

            <div className="footer-badges" aria-label="Points forts">
              <span className="badge">Sur-mesure</span>
              <span className="badge">Progression</span>
              <span className="badge">Confiance</span>
            </div>
          </div>

          <div className="footer-cta">
          
            <a className="footer-btn footer-btn--ghost" href="#top" onClick={handleScrollTop}>
              Revenir en haut
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="footer-grid">
          {/* Contact */}
          <section className="footer-col" aria-labelledby="footer-contact">
            <h3 id="footer-contact" className="footer-h3">Contact</h3>
            <ul className="footer-list">
              <li>
                <span className="footer-label">Téléphone</span>
                <a className="footer-link" href="tel:+33600000000">+33 6 00 00 00 00</a>
              </li>
              <li>
                <span className="footer-label">Email</span>
                <a className="footer-link" href="mailto:contact@bycoaching.fr">contact@bycoaching.fr</a>
              </li>
              <li>
                <span className="footer-label">Zone</span>
                <span className="footer-text">Paris · 16e · Extérieur / Salle</span>
              </li>
            </ul>
          </section>

          {/* Horaires */}
          <section className="footer-col" aria-labelledby="footer-hours">
            <h3 id="footer-hours" className="footer-h3">Horaires</h3>
            <ul className="footer-list">
      
              <li><span className="footer-label">Dimanche</span><span className="footer-text">Sur demande</span></li>
            </ul>
            <p className="footer-note">
              Réponse rapide après une demande de séance (confirmation par message).
            </p>
          </section>

          {/* Navigation */}
          <nav className="footer-col" aria-labelledby="footer-nav">
            <h3 id="footer-nav" className="footer-h3">Navigation</h3>
            <ul className="footer-links">
              <li><Link className="footer-link" to="/">Accueil</Link></li>
              <li><a className="footer-link" href="#infos">Infos</a></li>
              <li><Link className="footer-link" to="/reservation">Réservation</Link></li>
              <li><Link className="footer-link" to="/contact">Contact</Link></li>
            </ul>
          </nav>

          {/* Réseaux + Admin */}
          <section className="footer-col" aria-labelledby="footer-social">
            <h3 id="footer-social" className="footer-h3">Réseaux</h3>

            <div className="socials" role="list" aria-label="Réseaux sociaux">
              <a className="social" role="listitem" href="#" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a className="social" role="listitem" href="#" target="_blank" rel="noreferrer">
                Snapchat
              </a>
              <a className="social" role="listitem" href="#" target="_blank" rel="noreferrer">
                TikTok
              </a>
            </div>

            <div className="coach-zone" aria-label="Espace coach">
              {!user ? (
                <Link to="/admin/login" className="coach-link">
                  Espace coach
                </Link>
              ) : (
                <>
                  <Link to="/admin" className="coach-link">Dashboard</Link>
                  <button className="coach-btn" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <span>© {new Date().getFullYear()} BY Coaching</span>
            <span className="dot-sep" aria-hidden="true">•</span>
            <span>Paris</span>
          </div>

          <div className="footer-legal-links" aria-label="Liens légaux">
            <Link className="footer-mini" to="/mentions-legales">Mentions légales</Link>
            <Link className="footer-mini" to="/politique-confidentialite">Confidentialité</Link>
            <Link className="footer-mini" to="/cgu">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}