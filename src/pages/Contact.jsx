import { useId, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../style/contact.css";

export default function Contact() {
  const formId = useId();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "Demande d'information",
    message: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    ok: false,
    error: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setStatus({ loading: true, ok: false, error: "" });

    try {
      await addDoc(collection(db, "messages"), {
        createdAt: serverTimestamp(),
        status: "unread",
        ...form,
        handledBy: "",
        replyNote: "",
      });

      setStatus({ loading: false, ok: true, error: "" });
      setForm({
        fullName: "",
        email: "",
        subject: "Demande d'information",
        message: "",
      });
    } catch (err) {
      setStatus({
        loading: false,
        ok: false,
        error: err?.message || "Erreur lors de l’envoi",
      });
    }
  }

  return (
    <main className="contact">
      <section className="contact-hero" aria-labelledby={`${formId}-title`}>
        <div className="contact-container">
          <div className="contact-heroInner">
            <div className="contact-badge">
              <span className="contact-dot" aria-hidden="true" />
              Contact
            </div>

            <h1 className="contact-title" id={`${formId}-title`}>
              Écris-nous
            </h1>

            <p className="contact-subtitle">
              Une question, une précision, un besoin particulier ? Envoie un message.
              Sinon, passe par la page Réservation pour demander un créneau.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-container contact-grid">
          {/* FORM */}
          <div className="contact-card">
            <h2 className="contact-h2">Formulaire</h2>
            <p className="contact-hint">Champs obligatoires marqués *</p>

            <form className="contact-form" onSubmit={submit} noValidate>
              <div className="field">
                <label className="label" htmlFor={`${formId}-fullName`}>
                  Nom & prénom <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${formId}-fullName`}
                  className="input"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder=" Nom Prénom"
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`${formId}-email`}>
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${formId}-email`}
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="by-coaching@email.com"
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`${formId}-subject`}>
                  Sujet <span aria-hidden="true">*</span>
                </label>
                <select
                  id={`${formId}-subject`}
                  className="input"
                  value={form.subject}
                  onChange={(e) => update("subject", e.target.value)}
                >
                  <option>Demande d'information</option>
                  <option>Tarifs</option>
                  <option>Disponibilités</option>
                  <option>Coaching groupe</option>
                  <option>Autre</option>
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor={`${formId}-message`}>
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id={`${formId}-message`}
                  className="textarea"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Explique ton besoin, ton niveau, tes objectifs..."
                  required
                />
              </div>

              <button className="btn" disabled={status.loading}>
                {status.loading ? "Envoi..." : "Envoyer le message"}
              </button>

              <div className="status" aria-live="polite">
                {status.ok && (
                  <p className="status-ok">
                    Message envoyé ✅ On te répond rapidement.
                  </p>
                )}
                {status.error && <p className="status-error">{status.error}</p>}
              </div>

              <p className="legal">
                En envoyant, tu acceptes d’être contactée pour répondre à ta demande.
              </p>
            </form>
          </div>

          {/* INFOS */}
          <aside className="contact-card contact-aside" aria-label="Informations">
            <h2 className="contact-h2">Infos rapides</h2>

            <div className="infoList">
              <div className="infoRow">
                <span className="infoKey">Zone</span>
                <span className="infoVal">Paris · 16e · Extérieur / Salle</span>
              </div>
              <div className="infoRow">
                <span className="infoKey">Horaires</span>
                <span className="infoVal">Dim 08:00–23:00</span>
              </div>
              <div className="infoRow">
                <span className="infoKey">Réservation</span>
                <span className="infoVal">Réponse rapide après envoi</span>
              </div>
            </div>

            <div className="infoBox">
              <h3 className="contact-h3">Conseil</h3>
              <p className="muted">
                Pour réserver un créneau, utilise la page “Réservation”.
                Ici c’est parfait pour une question ou une précision.
              </p>
            </div>

            
          </aside>
        </div>
      </section>
    </main>
  );
}