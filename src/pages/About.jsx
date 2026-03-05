import "../style/about.css";


// 3 photos ici (dans src/assets/)
import fight1 from "../assets/yohan-1.jpg";
import fight2 from "../assets/yohan-2.jpg";
import fight3 from "../assets/yohan-3.jpg";


export default function About() {
  return (
    <main className="about">
      {/* HERO */}
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-container">
          <div className="about-heroInner">
            <div className="about-badge">
              <span className="about-dot" aria-hidden="true" />
              À propos du coach
            </div>


            <h1 className="about-title" id="about-title">
              Yohan Agro
            </h1>


            <p className="about-subtitle">
              25 ans · Sports de combat depuis <strong>2 ans et demi</strong> · MMA / Boxe ·
              Coaching sur-mesure axé sur les détails, la discipline et la confiance.
            </p>


            <div className="about-chips" aria-label="Points forts">
              <span className="chip">Discipline</span>
              <span className="chip">Rigueur</span>
              <span className="chip">Maîtrise de soi</span>
              <span className="chip">Loyauté</span>
            </div>


            {/* ✅ MINI GALLERY (3 PHOTOS) */}
            <div className="about-gallery" aria-label="Photos du coach en action">
              <figure className="about-shot">
                <img
                  src={fight1}
                  alt="Yohan Agro en combat (MMA), en action dans la cage"
                  loading="lazy"
                />
                <figcaption>En action · MMA</figcaption>
              </figure>


              <figure className="about-shot">
                <img
                  src={fight2}
                  alt="Yohan Agro en entraînement boxe, travail de frappe"
                  loading="lazy"
                />
                <figcaption>Entraînement · Boxe</figcaption>
              </figure>


              <figure className="about-shot">
                <img
                  src={fight3}
                  alt="Yohan Agro en grappling, travail au sol"
                  loading="lazy"
                />
                <figcaption>Technique · Grappling</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>


      {/* CONTENT */}
      <section className="about-section">
        <div className="about-container about-grid">
          {/* LEFT */}
          <article className="about-card">
            <h2 className="about-h2">Son identité</h2>
            <p className="about-hint">Un coach humain, simple, et direct.</p>


            <div className="list">
              <div className="row">
                <span className="key">Nom</span>
                <span className="val">Agro Yohan</span>
              </div>
              <div className="row">
                <span className="key">Âge</span>
                <span className="val">25 ans</span>
              </div>
              <div className="row">
                <span className="key">Discipline principale</span>
                <span className="val">MMA / Boxe</span>
              </div>
              <div className="row">
                <span className="key">Sports pratiqués</span>
                <span className="val">
                  Lutte · JJB · Grappling · Boxe · Muay Thai · Karaté contact
                </span>
              </div>
              <div className="row">
                <span className="key">Premier contact</span>
                <span className="val">Karaté contact</span>
              </div>
              <div className="row">
                <span className="key">Inspiration au début</span>
                <span className="val">Personne</span>
              </div>
            </div>


            <div className="callout">
              <p>
                <strong>Sa vibe :</strong> pas de blabla inutile — tu viens, tu t’entraînes,
                tu progresses. Le sérieux avant le reste.
              </p>
            </div>
          </article>


          {/* RIGHT */}
          <aside className="about-card about-aside" aria-label="Résumé du parcours">
            <h2 className="about-h2">Parcours sportif</h2>
            <p className="about-hint">Crédibilité + expérience réelle.</p>


            <div className="list">
              <div className="row">
                <span className="key">Début</span>
                <span className="val">16 ans (plus sérieusement 22 ans)</span>
              </div>
              <div className="row">
                <span className="key">Pourquoi</span>
                <span className="val">Pour se défendre (la peur au début)</span>
              </div>
              <div className="row">
                <span className="key">Compétitions</span>
                <span className="val">Oui</span>
              </div>
              <div className="row">
                <span className="key">Combats</span>
                <span className="val">5</span>
              </div>
              <div className="row">
                <span className="key">Victoires</span>
                <span className="val">2–3</span>
              </div>
              <div className="row">
                <span className="key">Défaite marquante</span>
                <span className="val">Renforcer le mental</span>
              </div>
              <div className="row">
                <span className="key">Il s’entraîne encore</span>
                <span className="val">Oui</span>
              </div>
            </div>


            <div className="infoBox">
              <h3 className="about-h3">Le moment le plus fier</h3>
              <p className="muted">
                “Un moment où j’ai été fier de moi.”  
                <br />
                <span className="tiny">
                  *Si tu veux, je te fais une version 100% pro en gardant son énergie.*
                </span>
              </p>
            </div>
          </aside>


          {/* FULL WIDTH */}
          <article className="about-card about-wide">
            <h2 className="about-h2">Mentalité & valeurs</h2>
            <p className="about-hint">
              Ce que le combat lui a appris (et ce qu’il transmet).
            </p>


            <div className="pillGrid" role="list" aria-label="Valeurs clés">
              <div className="pill" role="listitem">
                <span className="pillTitle">Philosophie</span>
                <span className="pillText">Stoïcienne</span>
              </div>
              <div className="pill" role="listitem">
                <span className="pillTitle">Priorité</span>
                <span className="pillText">Discipline (pas motivation)</span>
              </div>
              <div className="pill" role="listitem">
                <span className="pillTitle">Valeur #1</span>
                <span className="pillText">Loyauté</span>
              </div>
              <div className="pill" role="listitem">
                <span className="pillTitle">Transmission</span>
                <span className="pillText">Confiance en soi</span>
              </div>
            </div>


            <div className="callout">
              <p>
                <strong>Sa méthode :</strong> il prend le temps de corriger les détails.
                Posture, garde, timing, respiration : c’est là que tout se joue.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

