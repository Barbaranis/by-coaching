import { useId, useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../style/reservation.css";


/* -------------------------
   Options (tu peux modifier)
------------------------- */
const DAYS = [
  { value: "sunday", label: "Dimanche" },
  { value: "saturday_evening", label: "Samedi soir" },
];


const TYPES = [
  { value: "individual", label: "Individuel" },
  { value: "group", label: "Petit groupe (2–4 pers.)" },
];


/* ✅ Disciplines disponibles (checkbox multi-choix) */
const DISCIPLINES = [
  { value: "mma", label: "MMA" },
  { value: "boxing", label: "Boxe anglaise" },
  { value: "grappling", label: "Grappling" },
  { value: "self_defense", label: "Self-défense" },
];


export default function Reservation() {
  const formId = useId();


  /* -------------------------
     Form state
  ------------------------- */
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    requestedDay: "sunday",
    requestedDate: "",
    requestedStartTime: "",
    sessionType: "individual",
    participants: 2,
    message: "",


    /* ✅ NEW: choix disciplines (liste de valeurs) */
    disciplines: ["mma"], // valeur par défaut
  });


  /* -------------------------
     Consent (RGPD) + Confirm
  ------------------------- */
  const [consent, setConsent] = useState(false); // obligatoire
  const [confirmStep, setConfirmStep] = useState(false); // “2e clic”
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });


  const showParticipants = form.sessionType === "group";


  /* -------------------------
     Reset confirm when edit
  ------------------------- */
  function resetConfirmIfNeeded(nextForm) {
    setConfirmStep(false);
    return nextForm;
  }


  /* -------------------------
     Helpers disciplines
  ------------------------- */
  const disciplineLabels = useMemo(() => {
    const map = new Map(DISCIPLINES.map((d) => [d.value, d.label]));
    return (form.disciplines || []).map((v) => map.get(v) || v);
  }, [form.disciplines]);


  const toggleDiscipline = (value) => {
    setForm((p) => {
      const has = p.disciplines.includes(value);
      const next = has
        ? p.disciplines.filter((x) => x !== value)
        : [...p.disciplines, value];


      // Petite règle UX: au moins 1 discipline sélectionnée
      const safeNext = next.length ? next : ["mma"];


      return resetConfirmIfNeeded({ ...p, disciplines: safeNext });
    });
  };


  /* -------------------------
     Summary box
  ------------------------- */
  const summary = useMemo(() => {
    const dayLabel = DAYS.find((d) => d.value === form.requestedDay)?.label || "—";
    const typeLabel = TYPES.find((t) => t.value === form.sessionType)?.label || "—";
    const people =
      form.sessionType === "group" ? `${form.participants || 2} pers.` : "1 pers.";


    return {
      dayLabel,
      typeLabel,
      people,
      disciplinesText: disciplineLabels.length ? disciplineLabels.join(" · ") : "—",
    };
  }, [form.requestedDay, form.sessionType, form.participants, disciplineLabels]);


  /* -------------------------
     Small validation
  ------------------------- */
  const disciplinesOk = (form.disciplines || []).length > 0;


  const canSubmitBase =
    form.fullName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.requestedDate &&
    form.requestedStartTime &&
    disciplinesOk &&
    consent &&
    !status.loading;


  const canConfirmSend = canSubmitBase && confirmStep;


  /* -------------------------
     Submit
  ------------------------- */
  async function submit(e) {
    e.preventDefault();
    setStatus({ loading: true, ok: false, error: "" });


    try {
      // Cohérence participants
      const participants =
        form.sessionType === "group"
          ? Math.min(4, Math.max(2, Number(form.participants || 2)))
          : 1;


      // On transforme les valeurs (mma/boxing/...) en labels humains
      const disciplinesHuman = disciplineLabels;


      await addDoc(collection(db, "bookings"), {
        createdAt: serverTimestamp(),
        status: "pending",


        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),


        requestedDay: form.requestedDay,
        requestedDate: form.requestedDate,
        requestedStartTime: form.requestedStartTime,


        sessionType: form.sessionType,
        participants,


        // ✅ NEW: disciplines choisies
        disciplines: disciplinesHuman,


        message: (form.message || "").trim(),


        // Infos internes
        durationMinutes: 90,
        coachNote: "",


        // Consent RGPD (preuve de choix utilisateur)
        consent: {
          accepted: true,
          textVersion: "v1",
          acceptedAt: serverTimestamp(),
        },
      });


      setStatus({ loading: false, ok: true, error: "" });


      // Reset
      setForm({
        fullName: "",
        email: "",
        phone: "",
        requestedDay: "sunday",
        requestedDate: "",
        requestedStartTime: "",
        sessionType: "individual",
        participants: 2,
        message: "",
        disciplines: ["mma"],
      });


      setConsent(false);
      setConfirmStep(false);
    } catch (err) {
      setStatus({
        loading: false,
        ok: false,
        error: err?.code ? `${err.code} — ${err.message}` : err?.message || "Erreur lors de l’envoi",
      });
    }
  }


  return (
    <main className="reservation">
      {/* HERO */}
      <section className="reservation-hero" aria-labelledby={`${formId}-title`}>
        <div className="reservation-container">
          <div className="reservation-heroInner">
            <div className="reservation-badge">
              <span className="reservation-dot" aria-hidden="true" />
              Réservation
            </div>


            <h1 className="reservation-title" id={`${formId}-title`}>
              Demander un coaching
            </h1>


            <p className="reservation-subtitle">
              Remplis le formulaire. On te répond rapidement pour confirmer le créneau.
            </p>
          </div>
        </div>
      </section>


      {/* CONTENT */}
      <section className="reservation-section">
        <div className="reservation-container reservation-grid">
          {/* FORM CARD */}
          <div className="reservation-card">
            <h2 className="reservation-h2">Tes informations</h2>
            <p className="reservation-hint">Champs obligatoires marqués *</p>


            <form className="reservation-form" onSubmit={submit} noValidate>
              {/* Full name */}
              <div className="field">
                <label className="label" htmlFor={`${formId}-fullName`}>
                  Nom & prénom <span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${formId}-fullName`}
                  className="input"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm((p) => resetConfirmIfNeeded({ ...p, fullName: e.target.value }))
                  }
                  placeholder="Nom Prénom"
                  required
                />
              </div>


              {/* Email + Phone */}
              <div className="field field-2">
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
                    onChange={(e) =>
                      setForm((p) => resetConfirmIfNeeded({ ...p, email: e.target.value }))
                    }
                    placeholder="ex: yohan@email.com"
                    required
                  />
                </div>


                <div className="field">
                  <label className="label" htmlFor={`${formId}-phone`}>
                    Téléphone <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${formId}-phone`}
                    className="input"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => resetConfirmIfNeeded({ ...p, phone: e.target.value }))
                    }
                    placeholder="06…"
                    required
                  />
                </div>
              </div>


              <hr className="sep" aria-hidden="true" />


              {/* ✅ DISCIPLINES */}
              <h2 className="reservation-h2">Discipline(s)</h2>
              <p className="reservation-hint">Choisis au moins 1 discipline *</p>


              <div className="disciplines" role="group" aria-label="Choix des disciplines">
                {DISCIPLINES.map((d) => {
                  const checked = form.disciplines.includes(d.value);
                  return (
                    <label key={d.value} className={`disc-chip ${checked ? "is-on" : ""}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDiscipline(d.value)}
                      />
                      <span>{d.label}</span>
                    </label>
                  );
                })}
              </div>


              {!disciplinesOk && (
                <p className="status-error" role="alert">
                  Choisis au moins une discipline.
                </p>
              )}


              <hr className="sep" aria-hidden="true" />


              <h2 className="reservation-h2">Créneau souhaité</h2>


              {/* Day + Date */}
              <div className="field field-2">
                <div className="field">
                  <label className="label" htmlFor={`${formId}-day`}>
                    Jour <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${formId}-day`}
                    className="input"
                    value={form.requestedDay}
                    onChange={(e) =>
                      setForm((p) => resetConfirmIfNeeded({ ...p, requestedDay: e.target.value }))
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="field">
                  <label className="label" htmlFor={`${formId}-date`}>
                    Date <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${formId}-date`}
                    className="input"
                    type="date"
                    value={form.requestedDate}
                    onChange={(e) =>
                      setForm((p) => resetConfirmIfNeeded({ ...p, requestedDate: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>


              {/* Time + Type */}
              <div className="field field-2">
                <div className="field">
                  <label className="label" htmlFor={`${formId}-time`}>
                    Heure de début <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${formId}-time`}
                    className="input"
                    type="time"
                    value={form.requestedStartTime}
                    onChange={(e) =>
                      setForm((p) =>
                        resetConfirmIfNeeded({ ...p, requestedStartTime: e.target.value })
                      )
                    }
                    required
                  />
                </div>


                <div className="field">
                  <label className="label" htmlFor={`${formId}-type`}>
                    Type de séance <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id={`${formId}-type`}
                    className="input"
                    value={form.sessionType}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((p) =>
                        resetConfirmIfNeeded({
                          ...p,
                          sessionType: v,
                          participants: v === "group" ? 2 : 1,
                        })
                      );
                    }}
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Participants */}
              {showParticipants && (
                <div className="field">
                  <label className="label" htmlFor={`${formId}-participants`}>
                    Nombre de participants (2–4) <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={`${formId}-participants`}
                    className="input"
                    type="number"
                    min={2}
                    max={4}
                    value={form.participants}
                    onChange={(e) =>
                      setForm((p) =>
                        resetConfirmIfNeeded({ ...p, participants: Number(e.target.value) })
                      )
                    }
                    required
                  />
                  <p className="help">Petit groupe = 2 à 4 personnes maximum.</p>
                </div>
              )}


              {/* Message */}
              <div className="field">
                <label className="label" htmlFor={`${formId}-message`}>
                  Message (optionnel)
                </label>
                <textarea
                  id={`${formId}-message`}
                  className="textarea"
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => resetConfirmIfNeeded({ ...p, message: e.target.value }))
                  }
                  placeholder="Objectif, niveau, contraintes, blessures, préférences..."
                />
              </div>


              {/* RGPD CONSENT */}
              <div className="consent">
                <label className="consent-row">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setConfirmStep(false);
                    }}
                    required
                  />
                  <span>
                    J’accepte que BY Coaching conserve mes informations{" "}
                    <strong>uniquement</strong> pour traiter ma demande et me recontacter.
                  </span>
                </label>


                <p className="consent-help">
                  Tes données sont utilisées pour gérer ta réservation. Tu peux demander l’accès,
                  la modification ou la suppression de tes données via la page Contact.
                  Conservation maximale recommandée : <strong>12 mois</strong> (à adapter).
                </p>
              </div>


              {/* DOUBLE STEP */}
              {!confirmStep ? (
                <button
                  type="button"
                  className="btn btn-soft"
                  disabled={!canSubmitBase}
                  onClick={() => {
                    setStatus((s) => ({ ...s, ok: false, error: "" }));
                    setConfirmStep(true);
                  }}
                >
                  Vérifier & confirmer
                </button>
              ) : (
                <div className="confirmBox" role="region" aria-label="Confirmation d’envoi">
                  <p className="confirmText">
                    Tu es sur le point d’envoyer tes informations. Confirme pour finaliser.
                  </p>


                  <div className="confirmActions">
                    <button type="submit" className="btn" disabled={!canConfirmSend}>
                      {status.loading ? "Envoi..." : "Confirmer l’envoi"}
                    </button>


                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setConfirmStep(false)}
                      disabled={status.loading}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}


              {/* Status */}
              <div className="status" aria-live="polite">
                {status.ok && (
                  <p className="status-ok">Demande envoyée ✅ On te répond rapidement.</p>
                )}
                {status.error && <p className="status-error">{status.error}</p>}
              </div>


              <p className="legal">
                En envoyant, tu confirmes avoir lu et accepté le traitement de tes données pour la
                gestion de ta demande (RGPD).
              </p>
            </form>
          </div>


          {/* SUMMARY CARD */}
          <aside className="reservation-card reservation-aside" aria-label="Résumé">
            <h2 className="reservation-h2">Résumé</h2>


            <div className="summary">
              <div className="summary-row">
                <span className="summary-key">Discipline(s)</span>
                <span className="summary-val">{summary.disciplinesText}</span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Jour</span>
                <span className="summary-val">{summary.dayLabel}</span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Date</span>
                <span className="summary-val">{form.requestedDate || "—"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Heure</span>
                <span className="summary-val">{form.requestedStartTime || "—"}</span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Type</span>
                <span className="summary-val">{summary.typeLabel}</span>
              </div>
              <div className="summary-row">
                <span className="summary-key">Participants</span>
                <span className="summary-val">{summary.people}</span>
              </div>
            </div>


            <div className="infoBox">
              <h3 className="reservation-h3">Ce que tu obtiens</h3>
              <ul className="bullets">
                <li>Coaching personnalisé (objectif + niveau)</li>
                <li>
                  Durée standard : <strong>90 minutes</strong>
                </li>
                <li>Discipline(s) selon ton choix</li>
                <li>
                  Statut initial : <strong>En attente</strong>
                </li>
              </ul>
            </div>


            <div className="infoBox">
              <h3 className="reservation-h3">Conseil</h3>
              <p className="muted">
                Écris ton objectif (perte de poids, confiance, technique, cardio…) + ton niveau
                pour une séance ultra adaptée.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

