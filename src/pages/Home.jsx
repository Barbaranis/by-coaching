import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import "../style/home.css";
import logo from "../assets/logo.png";
import yohan4 from "../assets/yohan-4.jpg";
import yohan5 from "../assets/yohan-5.jpg";



/* -------------------------
   Helpers “safe” (anti crash)
------------------------- */
function safeJoin(arr, sep = " · ") {
  if (!Array.isArray(arr)) return "";
  return arr.filter(Boolean).join(sep);
}


function safeText(v, fallback = "—") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}


function safeImageUrl(v, fallback) {
  if (!v) return fallback;
  const s = String(v).trim();
  return s.startsWith("http") ? s : fallback;
}


export default function Home() {
  // undefined = loading initial
  const [cfg, setCfg] = useState(undefined);


  useEffect(() => {
    const ref = doc(db, "siteConfig", "main");


    const unsub = onSnapshot(
      ref,
      (snap) => setCfg(snap.exists() ? snap.data() : {}),
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setCfg({});
      }
    );


    return () => unsub();
  }, []);


  const data = useMemo(() => {
    const offer = cfg?.offer || {};
    const coach = cfg?.coach || {};
    const pricing = cfg?.pricing || {};
    const location = cfg?.location || {};
    const contact = cfg?.contact || {};
    const media = cfg?.media || {};


    const fallbackHero =yohan5;


      const fallbackCoachPic = yohan4;


    return {
      // branding
      brand: safeText(offer?.title, "BY Coaching"),
      frequency: safeText(offer?.frequency, "Séances personnalisées"),
      cityArea: safeText(offer?.cityArea, "Paris & alentours"),
      audience: safeText(offer?.audience, "Débutant · Intermédiaire · Avancé"),
      description: safeText(
        offer?.description,
        "Coaching sur-mesure : objectifs clairs, méthode, progression, confiance et résultats visibles."
      ),


      // hero image
      heroImage: safeImageUrl(media?.heroImage, fallbackHero),


      // coach
      coachName: safeText(coach?.name, "Coach Yohan"),
      coachRecord: safeText(coach?.record, "5 combats · 2–3 victoires"),
      coachGrade: safeText(coach?.grade, "MMA / Boxe"),
      coachBio: safeText(
        coach?.bio,
        "Discipline, rigueur, maîtrise de soi. Un coaching axé sur les détails : posture, garde, timing, respiration."
      ),
      coachPhoto: safeImageUrl(media?.coachPhoto, fallbackCoachPic),


      // pricing
      pricePerPerson: safeText(pricing?.pricePerPerson, "—"),
      durationMinutes: safeText(pricing?.durationMinutes, "90"),
      deposit: safeText(pricing?.deposit, "—"),
      depositMethods: safeJoin(pricing?.depositMethods),


      // location
      venueName: safeText(location?.venueName, "Salle / Extérieur"),
      addressLine: safeText(location?.addressLine, "Adresse communiquée après réservation"),


      // contact
      phone: safeText(contact?.phone, "—"),
      instagram: safeText(contact?.instagram, "—"),
      snapchat: safeText(contact?.snapchat, "—"),


      // disciplines (optionnel depuis Firestore)
      disciplines: safeJoin(offer?.disciplines || ["MMA", "Boxe", "Grappling", "Self-défense"]),
    };
  }, [cfg]);


  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });


  if (cfg === undefined) {
    return (
      <main className="home">
        <section className="home-loading" aria-label="Chargement">
          <div className="home-spinner" aria-hidden="true" />
          <p>Chargement…</p>
        </section>
      </main>
    );
  }


  return (
    <main className="home" id="top">
      {/* =========================
          HERO
      ========================== */}
      <header className="home-hero" style={{ backgroundImage: `url("${data.heroImage}")` }}>
        <div className="home-heroOverlay" />


        <div className="home-container home-heroInner">
          <div className="home-heroBadge">
            <img src={logo} alt="" aria-hidden="true" className="home-heroLogo" />
            <span className="home-dot" aria-hidden="true" />
            Coaching privé
          </div>


          <h1 className="home-title">{data.brand}</h1>


          <p className="home-subtitle">
            <strong>{data.frequency}</strong> · <strong>{data.cityArea}</strong>
          </p>


          <p className="home-audience">{data.audience}</p>
          <p className="home-desc">{data.description}</p>


          <div className="home-heroActions">
            <Link className="btn btn-primary" to="/reservation">
              Demander une séance
            </Link>
            <a className="btn btn-ghost" href="#infos">
              Voir les infos
            </a>
          </div>


          {/* Quick stats */}
          <div className="home-stats" aria-label="Infos rapides">
            <div className="home-stat">
              <div className="home-statLabel">Durée</div>
              <div className="home-statValue">{data.durationMinutes} min</div>
            </div>
            <div className="home-stat">
              <div className="home-statLabel">Disciplines</div>
              <div className="home-statValue">{data.disciplines}</div>
            </div>
            <div className="home-stat">
              <div className="home-statLabel">Acompte</div>
              <div className="home-statValue">
                {data.deposit !== "—" ? `${data.deposit}€` : "—"}
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* =========================
          INFO GRID
      ========================== */}
      <section id="infos" className="home-section">
        <div className="home-container">
          <div className="home-grid">
            {/* Coach */}
            <article className="home-card">
              <div className="home-cardHead">
                <h2 className="home-h2">Le coach</h2>
                <p className="home-hint">Profil & parcours</p>
              </div>


              <div className="home-coach">
                <img className="home-coachImg" src={data.coachPhoto} alt="" />
                <div className="home-coachText">
                  <p className="home-coachName">{data.coachName}</p>
                  <p className="home-muted">{data.coachGrade}</p>
                </div>
              </div>


              <div className="home-list">
                <div className="home-row">
                  <span className="home-key">Palmarès</span>
                  <span className="home-val">{data.coachRecord}</span>
                </div>
                <div className="home-row">
                  <span className="home-key">Approche</span>
                  <span className="home-val">{data.coachBio}</span>
                </div>
              </div>


              <div className="home-cardFooter">
                <Link className="btn btn-soft" to="/about">
                  Découvrir son parcours
                </Link>
              </div>
            </article>


            {/* Tarifs */}
            <article className="home-card">
              <div className="home-cardHead">
                <h2 className="home-h2">Tarifs & réservation</h2>
                <p className="home-hint">Simple, clair, rapide</p>
              </div>


              <div className="home-list">
                <div className="home-row">
                  <span className="home-key">Prix</span>
                  <span className="home-val">
                    {data.pricePerPerson !== "—" ? `${data.pricePerPerson}€ / pers.` : "—"}
                  </span>
                </div>
                <div className="home-row">
                  <span className="home-key">Durée</span>
                  <span className="home-val">{data.durationMinutes} min</span>
                </div>
                <div className="home-row">
                  <span className="home-key">Acompte</span>
                  <span className="home-val">
                    {data.deposit !== "—" ? `${data.deposit}€` : "—"}
                    {data.depositMethods ? <span className="home-muted"> · {data.depositMethods}</span> : null}
                  </span>
                </div>
              </div>


              <div className="home-cardFooter">
                <Link className="btn btn-primary" to="/reservation">
                  Réserver maintenant
                </Link>
              </div>
            </article>


            {/* Lieu */}
            <article className="home-card">
              <div className="home-cardHead">
                <h2 className="home-h2">Lieu</h2>
                <p className="home-hint">Où se déroule la séance</p>
              </div>


              <div className="home-list">
                <div className="home-row">
                  <span className="home-key">Lieu</span>
                  <span className="home-val">{data.venueName}</span>
                </div>
                <div className="home-row">
                  <span className="home-key">Adresse</span>
                  <span className="home-val">{data.addressLine}</span>
                </div>
              </div>


              <div className="home-callout">
                <p>
                  <strong>Conseil :</strong> indique ton objectif + ton niveau dans la demande
                  pour une séance ultra adaptée.
                </p>
              </div>
            </article>


            {/* Contact */}
            <article className="home-card">
              <div className="home-cardHead">
                <h2 className="home-h2">Contact</h2>
                <p className="home-hint">Réponse rapide</p>
              </div>


              <div className="home-list">
                <div className="home-row">
                  <span className="home-key">Téléphone</span>
                  <span className="home-val">{data.phone}</span>
                </div>
                <div className="home-row">
                  <span className="home-key">Instagram</span>
                  <span className="home-val">{data.instagram}</span>
                </div>
                <div className="home-row">
                  <span className="home-key">Snap</span>
                  <span className="home-val">{data.snapchat}</span>
                </div>
              </div>


              <div className="home-cardFooter">
                <Link className="btn btn-soft" to="/contact">
                  Envoyer un message
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>


      {/* =========================
          WHY SECTION
      ========================== */}
      <section className="home-section home-sectionAlt">
        <div className="home-container">
          <div className="home-why">
            <div className="home-whyHead">
              <h2 className="home-h2XL">Pourquoi BY Coaching ?</h2>
              <p className="home-muted">
                Une méthode claire : discipline, détails, progression. Pas de blabla.
              </p>
            </div>


            <div className="home-whyGrid">
              <div className="home-whyCard">
                <h3 className="home-h3">Coaching sur-mesure</h3>
                <p className="home-muted">
                  Objectif + niveau = plan adapté. Technique, cardio, confiance, self-défense.
                </p>
              </div>
              <div className="home-whyCard">
                <h3 className="home-h3">Détails qui changent tout</h3>
                <p className="home-muted">
                  Posture, garde, timing, respiration : on corrige ce qui fait vraiment progresser.
                </p>
              </div>
              <div className="home-whyCard">
                <h3 className="home-h3">Progression mesurable</h3>
                <p className="home-muted">
                  Une séance = un cap. Tu repars avec des repères concrets et un plan clair.
                </p>
              </div>
            </div>


            <div className="home-whyCta">
              <Link className="btn btn-primary btn-big" to="/reservation">
                Demander une séance
              </Link>
              <button className="btn btn-ghost btn-big" type="button" onClick={scrollTop}>
                Retour en haut
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Bottom spacing */}
      <div className="home-bottomSpace" />
    </main>
  );
}

