import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "../style/admin-dashboard.css";


const DEFAULT_CONFIG = {
  brandName: "BY Coaching",
  city: "Paris 16e",
  schedule: {
    sundayEnabled: true,
    sunday: { start: "10:00", end: "19:00" },
    saturdayEveningEnabled: true,
    saturdayEvening: { start: "18:00", end: "23:00" },
  },
  session: {
    defaultDurationMinutes: 90,
    maxGroupSize: 4,
    allowIndividual: true,
    allowGroup: true,
  },
  pricing: {
    individual: 40,
    groupPerPerson: 20,
  },
  policies: {
    cancellationHours: 24,
    refundIfClientCancels: true,
    refundIfCoachCancels: true,
  },
};


function formatStatus(status) {
  switch (status) {
    case "accepted":
      return "Acceptée";
    case "refused":
      return "Refusée";
    case "cancelled":
      return "Annulée";
    case "reschedule_requested":
      return "Autre créneau demandé";
    default:
      return "En attente";
  }
}


function getStatusClass(status) {
  switch (status) {
    case "accepted":
      return "accepted";
    case "refused":
      return "refused";
    case "cancelled":
      return "cancelled";
    case "reschedule_requested":
      return "reschedule";
    default:
      return "pending";
  }
}


function formatDay(day) {
  if (day === "sunday") return "Dimanche";
  if (day === "saturdayEvening") return "Samedi soir";
  return day || "Non précisé";
}


function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}


function sortByDateTimeAsc(a, b) {
  const aValue = `${a.requestedDate || ""} ${a.requestedStartTime || ""}`;
  const bValue = `${b.requestedDate || ""} ${b.requestedStartTime || ""}`;
  return aValue.localeCompare(bValue);
}


export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [config, setConfig] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  useEffect(() => {
    const configRef = doc(db, "siteConfig", "main");


    (async () => {
      const snap = await getDoc(configRef);
      if (!snap.exists()) {
        await setDoc(configRef, {
          ...DEFAULT_CONFIG,
          updatedAt: serverTimestamp(),
        });
        setConfig(DEFAULT_CONFIG);
      } else {
        setConfig(snap.data());
      }
    })();


    const unsub = onSnapshot(configRef, (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });


    return () => unsub();
  }, []);


  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setBookings(data);
    });


    return () => unsub();
  }, []);


  const stats = useMemo(() => {
    const pending = bookings.filter((b) => (b.status || "pending") === "pending").length;
    const accepted = bookings.filter((b) => b.status === "accepted").length;
    const refused = bookings.filter((b) => b.status === "refused").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;


    const estimatedRevenue = bookings
      .filter((b) => b.status === "accepted")
      .reduce((sum, b) => {
        if (b.sessionType === "group") {
          return (
            sum +
            safeNumber(config?.pricing?.groupPerPerson, 20) *
              safeNumber(b.participants, 1)
          );
        }
        return sum + safeNumber(config?.pricing?.individual, 40);
      }, 0);


    return {
      pending,
      accepted,
      refused,
      cancelled,
      total: bookings.length,
      estimatedRevenue,
    };
  }, [bookings, config]);


  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();


    return bookings.filter((b) => {
      const currentStatus = b.status || "pending";
      const matchStatus = statusFilter === "all" ? true : currentStatus === statusFilter;


      const matchSearch =
        !q ||
        (b.fullName || "").toLowerCase().includes(q) ||
        (b.email || "").toLowerCase().includes(q) ||
        (b.phone || "").toLowerCase().includes(q) ||
        (b.requestedDate || "").toLowerCase().includes(q) ||
        (b.requestedStartTime || "").toLowerCase().includes(q) ||
        (b.sessionType || "").toLowerCase().includes(q);


      return matchStatus && matchSearch;
    });
  }, [bookings, search, statusFilter]);


  const upcomingAccepted = useMemo(() => {
    return [...bookings]
      .filter((b) => b.status === "accepted")
      .sort(sortByDateTimeAsc)
      .slice(0, 6);
  }, [bookings]);


  const calendarItems = useMemo(() => {
    return [...bookings]
      .filter((b) => b.requestedDate)
      .sort(sortByDateTimeAsc)
      .slice(0, 20);
  }, [bookings]);


  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookings.filter((b) => b.requestedDate === today);
  }, [bookings]);


  const updateConfigLocal = (path, value) => {
    setConfig((prev) => {
      if (!prev) return prev;


      const next = structuredClone(prev);
      const keys = path.split(".");
      let current = next;


      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }


      current[keys[keys.length - 1]] = value;
      return next;
    });
  };


  async function saveConfig() {
    if (!config) return;


    setSavingConfig(true);
    try {
      await updateDoc(doc(db, "siteConfig", "main"), {
        ...config,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSavingConfig(false);
    }
  }


  async function setBookingStatus(id, status) {
    await updateDoc(doc(db, "bookings", id), {
      status,
      updatedAt: serverTimestamp(),
    });
  }


  async function saveCoachReply(id, coachReply) {
    await updateDoc(doc(db, "bookings", id), {
      coachReply,
      updatedAt: serverTimestamp(),
    });
  }


  async function saveCoachNote(id, coachNote) {
    await updateDoc(doc(db, "bookings", id), {
      coachNote,
      updatedAt: serverTimestamp(),
    });
  }


  function buildMailTo(booking) {
    const subject = encodeURIComponent(
      `Réponse à votre demande - ${config?.brandName || "BY Coaching"}`
    );


    const body = encodeURIComponent(
      `Bonjour ${booking.fullName || ""},


Merci pour votre demande de réservation.


Date demandée : ${booking.requestedDate || "-"}
Heure demandée : ${booking.requestedStartTime || "-"}
Type de séance : ${
        booking.sessionType === "group" ? "Groupe" : "Individuelle"
      }


${booking.coachReply || "Je reviens vers vous rapidement pour confirmer."}


Cordialement,
${config?.brandName || "BY Coaching"}`
    );


    return `mailto:${booking.email || ""}?subject=${subject}&body=${body}`;
  }


  function buildTel(phone) {
    if (!phone) return "#";
    return `tel:${String(phone).replace(/\s+/g, "")}`;
  }


  return (
    <section className="coach-dashboard">
      <div className="coach-dashboard__container">
        <header className="coach-dashboard__hero">
          <div>
            <p className="coach-dashboard__eyebrow">BY Coaching — espace coach</p>
            <h1 className="coach-dashboard__title">Dashboard premium</h1>
            <p className="coach-dashboard__subtitle">
              Gère les réservations, les réponses clients, la configuration du site
              et l’organisation du planning coach.
            </p>
          </div>


          <div className="coach-dashboard__hero-badges">
            <span className="coach-pill coach-pill--pending">
              En attente : {stats.pending}
            </span>
            <span className="coach-pill coach-pill--accepted">
              Acceptées : {stats.accepted}
            </span>
          </div>
        </header>


        <section className="coach-stats-grid">
          <article className="coach-stat-card">
            <span className="coach-stat-card__label">Demandes en attente</span>
            <strong className="coach-stat-card__value">{stats.pending}</strong>
          </article>


          <article className="coach-stat-card">
            <span className="coach-stat-card__label">Réservations acceptées</span>
            <strong className="coach-stat-card__value">{stats.accepted}</strong>
          </article>


          <article className="coach-stat-card">
            <span className="coach-stat-card__label">Refusées / annulées</span>
            <strong className="coach-stat-card__value">
              {stats.refused + stats.cancelled}
            </strong>
          </article>


          <article className="coach-stat-card">
            <span className="coach-stat-card__label">Revenus estimés</span>
            <strong className="coach-stat-card__value">
              {stats.estimatedRevenue} €
            </strong>
          </article>
        </section>


        <nav className="coach-tabs">
          <button
            type="button"
            className={tab === "overview" ? "coach-tab coach-tab--active" : "coach-tab"}
            onClick={() => setTab("overview")}
          >
            Vue d’ensemble
          </button>


          <button
            type="button"
            className={tab === "bookings" ? "coach-tab coach-tab--active" : "coach-tab"}
            onClick={() => setTab("bookings")}
          >
            Réservations
          </button>


          <button
            type="button"
            className={tab === "calendar" ? "coach-tab coach-tab--active" : "coach-tab"}
            onClick={() => setTab("calendar")}
          >
            Calendrier
          </button>


          <button
            type="button"
            className={tab === "config" ? "coach-tab coach-tab--active" : "coach-tab"}
            onClick={() => setTab("config")}
          >
            Configuration
          </button>
        </nav>


        {tab === "overview" && (
          <div className="coach-overview-grid">
            <section className="coach-panel">
              <div className="coach-panel__header">
                <div>
                  <h2>Réservations du jour</h2>
                  <p>Vue rapide sur les demandes prévues aujourd’hui.</p>
                </div>
              </div>


              <div className="coach-list">
                {todayBookings.length > 0 ? (
                  todayBookings.map((b) => (
                    <article className="coach-list-item" key={b.id}>
                      <div>
                        <strong>{b.fullName || "Client"}</strong>
                        <p>
                          {b.requestedStartTime || "-"} •{" "}
                          {b.sessionType === "group" ? "Groupe" : "Individuelle"}
                        </p>
                      </div>


                      <span
                        className={`coach-status-badge coach-status-badge--${getStatusClass(
                          b.status
                        )}`}
                      >
                        {formatStatus(b.status)}
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="coach-empty">Aucune réservation aujourd’hui.</p>
                )}
              </div>
            </section>


            <section className="coach-panel">
              <div className="coach-panel__header">
                <div>
                  <h2>Prochains cours acceptés</h2>
                  <p>Les prochaines séances validées par le coach.</p>
                </div>
              </div>


              <div className="coach-list">
                {upcomingAccepted.length > 0 ? (
                  upcomingAccepted.map((b) => (
                    <article className="coach-list-item" key={b.id}>
                      <div>
                        <strong>{b.fullName || "Client"}</strong>
                        <p>
                          {b.requestedDate || "-"} à {b.requestedStartTime || "-"}
                        </p>
                      </div>


                      <span className="coach-status-badge coach-status-badge--accepted">
                        Acceptée
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="coach-empty">
                    Aucune réservation acceptée pour le moment.
                  </p>
                )}
              </div>
            </section>


            <section className="coach-panel">
              <div className="coach-panel__header">
                <div>
                  <h2>Réglages rapides</h2>
                  <p>Récapitulatif actuel des paramètres du coach.</p>
                </div>
              </div>


              <div className="coach-quick-info">
                <div className="coach-quick-info__row">
                  <span>Marque</span>
                  <strong>{config?.brandName || "BY Coaching"}</strong>
                </div>
                <div className="coach-quick-info__row">
                  <span>Ville</span>
                  <strong>{config?.city || "-"}</strong>
                </div>
                <div className="coach-quick-info__row">
                  <span>Durée standard</span>
                  <strong>{config?.session?.defaultDurationMinutes || 90} min</strong>
                </div>
                <div className="coach-quick-info__row">
                  <span>Tarif individuel</span>
                  <strong>{config?.pricing?.individual || 40} €</strong>
                </div>
                <div className="coach-quick-info__row">
                  <span>Tarif groupe / pers.</span>
                  <strong>{config?.pricing?.groupPerPerson || 20} €</strong>
                </div>
              </div>
            </section>


            <section className="coach-panel">
              <div className="coach-panel__header">
                <div>
                  <h2>Raccourcis</h2>
                  <p>Accès rapide aux actions les plus utiles.</p>
                </div>
              </div>


              <div className="coach-shortcuts">
                <button type="button" className="coach-btn coach-btn--dark" onClick={() => setTab("bookings")}>
                  Voir les réservations
                </button>
                <button type="button" className="coach-btn coach-btn--accent" onClick={() => setTab("calendar")}>
                  Ouvrir le calendrier
                </button>
                <button type="button" className="coach-btn coach-btn--outline" onClick={() => setTab("config")}>
                  Modifier la configuration
                </button>
              </div>
            </section>
          </div>
        )}


        {tab === "bookings" && (
          <section className="coach-panel">
            <div className="coach-panel__header coach-panel__header--stack">
              <div>
                <h2>Gestion des réservations</h2>
                <p>Filtre, consulte, accepte, refuse ou reprogramme les demandes.</p>
              </div>


              <div className="coach-filters">
                <input
                  className="coach-input"
                  type="text"
                  placeholder="Rechercher un nom, email, téléphone, date..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />


                <select
                  className="coach-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="accepted">Acceptées</option>
                  <option value="refused">Refusées</option>
                  <option value="cancelled">Annulées</option>
                  <option value="reschedule_requested">Autre créneau</option>
                </select>
              </div>
            </div>


            <div className="coach-bookings-grid">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onSetStatus={setBookingStatus}
                    onSaveCoachReply={saveCoachReply}
                    onSaveCoachNote={saveCoachNote}
                    buildMailTo={buildMailTo}
                    buildTel={buildTel}
                  />
                ))
              ) : (
                <p className="coach-empty">Aucune réservation trouvée.</p>
              )}
            </div>
          </section>
        )}


        {tab === "calendar" && (
          <section className="coach-panel">
            <div className="coach-panel__header">
              <div>
                <h2>Calendrier simplifié</h2>
                <p>
                  Bleu = accepté, orange = en attente, rouge = refusé ou annulé,
                  violet = autre créneau proposé.
                </p>
              </div>
            </div>


            <div className="coach-calendar-legend">
              <span className="coach-legend">
                <span className="coach-legend__dot coach-legend__dot--blue"></span>
                Réservé
              </span>
              <span className="coach-legend">
                <span className="coach-legend__dot coach-legend__dot--orange"></span>
                En attente
              </span>
              <span className="coach-legend">
                <span className="coach-legend__dot coach-legend__dot--red"></span>
                Refusé / annulé
              </span>
              <span className="coach-legend">
                <span className="coach-legend__dot coach-legend__dot--violet"></span>
                Autre créneau
              </span>
            </div>


            <div className="coach-calendar-list">
              {calendarItems.length > 0 ? (
                calendarItems.map((b) => (
                  <article
                    key={b.id}
                    className={`coach-calendar-item coach-calendar-item--${b.status || "pending"}`}
                  >
                    <div className="coach-calendar-item__main">
                      <strong>{b.requestedDate || "-"}</strong>
                      <span>
                        {b.requestedStartTime || "-"} • {b.fullName || "Client"}
                      </span>
                    </div>


                    <div className="coach-calendar-item__side">
                      <span>
                        {b.sessionType === "group" ? "Groupe" : "Individuelle"}
                      </span>
                      <span>{formatStatus(b.status)}</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="coach-empty">Aucun créneau enregistré.</p>
              )}
            </div>
          </section>
        )}


        {tab === "config" && config && (
          <section className="coach-panel">
            <div className="coach-panel__header">
              <div>
                <h2>Configuration coach</h2>
                <p>Gère les horaires, prix, règles et paramètres généraux.</p>
              </div>
            </div>


            <div className="coach-config-grid">
              <fieldset className="coach-fieldset">
                <legend>Identité</legend>


                <label className="coach-form-row coach-form-row--column">
                  <span>Nom de la marque</span>
                  <input
                    className="coach-input"
                    type="text"
                    value={config.brandName || ""}
                    onChange={(e) => updateConfigLocal("brandName", e.target.value)}
                  />
                </label>


                <label className="coach-form-row coach-form-row--column">
                  <span>Ville</span>
                  <input
                    className="coach-input"
                    type="text"
                    value={config.city || ""}
                    onChange={(e) => updateConfigLocal("city", e.target.value)}
                  />
                </label>
              </fieldset>


              <fieldset className="coach-fieldset">
                <legend>Dimanche</legend>


                <label className="coach-form-row">
                  <span>Actif</span>
                  <input
                    type="checkbox"
                    checked={!!config.schedule?.sundayEnabled}
                    onChange={(e) =>
                      updateConfigLocal("schedule.sundayEnabled", e.target.checked)
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Début</span>
                  <input
                    className="coach-input"
                    type="time"
                    value={config.schedule?.sunday?.start || "10:00"}
                    onChange={(e) =>
                      updateConfigLocal("schedule.sunday.start", e.target.value)
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Fin</span>
                  <input
                    className="coach-input"
                    type="time"
                    value={config.schedule?.sunday?.end || "19:00"}
                    onChange={(e) =>
                      updateConfigLocal("schedule.sunday.end", e.target.value)
                    }
                  />
                </label>
              </fieldset>


              <fieldset className="coach-fieldset">
                <legend>Samedi soir</legend>


                <label className="coach-form-row">
                  <span>Actif</span>
                  <input
                    type="checkbox"
                    checked={!!config.schedule?.saturdayEveningEnabled}
                    onChange={(e) =>
                      updateConfigLocal(
                        "schedule.saturdayEveningEnabled",
                        e.target.checked
                      )
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Début</span>
                  <input
                    className="coach-input"
                    type="time"
                    value={config.schedule?.saturdayEvening?.start || "18:00"}
                    onChange={(e) =>
                      updateConfigLocal(
                        "schedule.saturdayEvening.start",
                        e.target.value
                      )
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Fin</span>
                  <input
                    className="coach-input"
                    type="time"
                    value={config.schedule?.saturdayEvening?.end || "23:00"}
                    onChange={(e) =>
                      updateConfigLocal("schedule.saturdayEvening.end", e.target.value)
                    }
                  />
                </label>
              </fieldset>


              <fieldset className="coach-fieldset">
                <legend>Session</legend>


                <label className="coach-form-row">
                  <span>Durée par défaut (min)</span>
                  <input
                    className="coach-input"
                    type="number"
                    value={config.session?.defaultDurationMinutes || 90}
                    onChange={(e) =>
                      updateConfigLocal(
                        "session.defaultDurationMinutes",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Taille max groupe</span>
                  <input
                    className="coach-input"
                    type="number"
                    value={config.session?.maxGroupSize || 4}
                    onChange={(e) =>
                      updateConfigLocal("session.maxGroupSize", Number(e.target.value))
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Individuel autorisé</span>
                  <input
                    type="checkbox"
                    checked={!!config.session?.allowIndividual}
                    onChange={(e) =>
                      updateConfigLocal("session.allowIndividual", e.target.checked)
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Groupe autorisé</span>
                  <input
                    type="checkbox"
                    checked={!!config.session?.allowGroup}
                    onChange={(e) =>
                      updateConfigLocal("session.allowGroup", e.target.checked)
                    }
                  />
                </label>
              </fieldset>


              <fieldset className="coach-fieldset">
                <legend>Tarifs</legend>


                <label className="coach-form-row">
                  <span>Individuel (€)</span>
                  <input
                    className="coach-input"
                    type="number"
                    value={config.pricing?.individual || 40}
                    onChange={(e) =>
                      updateConfigLocal("pricing.individual", Number(e.target.value))
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Groupe / pers (€)</span>
                  <input
                    className="coach-input"
                    type="number"
                    value={config.pricing?.groupPerPerson || 20}
                    onChange={(e) =>
                      updateConfigLocal("pricing.groupPerPerson", Number(e.target.value))
                    }
                  />
                </label>
              </fieldset>


              <fieldset className="coach-fieldset">
                <legend>Règles</legend>


                <label className="coach-form-row">
                  <span>Annulation (heures)</span>
                  <input
                    className="coach-input"
                    type="number"
                    value={config.policies?.cancellationHours || 24}
                    onChange={(e) =>
                      updateConfigLocal(
                        "policies.cancellationHours",
                        Number(e.target.value)
                      )
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Remboursement si client annule</span>
                  <input
                    type="checkbox"
                    checked={!!config.policies?.refundIfClientCancels}
                    onChange={(e) =>
                      updateConfigLocal(
                        "policies.refundIfClientCancels",
                        e.target.checked
                      )
                    }
                  />
                </label>


                <label className="coach-form-row">
                  <span>Remboursement si coach annule</span>
                  <input
                    type="checkbox"
                    checked={!!config.policies?.refundIfCoachCancels}
                    onChange={(e) =>
                      updateConfigLocal(
                        "policies.refundIfCoachCancels",
                        e.target.checked
                      )
                    }
                  />
                </label>
              </fieldset>
            </div>


            <button
              type="button"
              className="coach-save-btn"
              onClick={saveConfig}
              disabled={savingConfig}
            >
              {savingConfig ? "Sauvegarde..." : "Sauvegarder la configuration"}
            </button>
          </section>
        )}
      </div>
    </section>
  );
}


function BookingCard({
  booking,
  onSetStatus,
  onSaveCoachReply,
  onSaveCoachNote,
  buildMailTo,
  buildTel,
}) {
  const [coachReply, setCoachReply] = useState(booking.coachReply || "");
  const [coachNote, setCoachNote] = useState(booking.coachNote || "");
  const [savingReply, setSavingReply] = useState(false);
  const [savingNote, setSavingNote] = useState(false);


  useEffect(() => {
    setCoachReply(booking.coachReply || "");
    setCoachNote(booking.coachNote || "");
  }, [booking.coachReply, booking.coachNote]);


  async function handleSaveReply() {
    setSavingReply(true);
    try {
      await onSaveCoachReply(booking.id, coachReply);
    } finally {
      setSavingReply(false);
    }
  }


  async function handleSaveNote() {
    setSavingNote(true);
    try {
      await onSaveCoachNote(booking.id, coachNote);
    } finally {
      setSavingNote(false);
    }
  }


  return (
    <article className="coach-booking-card">
      <div className="coach-booking-card__head">
        <div>
          <h3>{booking.fullName || "Client"}</h3>
          <p>
            {booking.requestedDate || "-"} • {booking.requestedStartTime || "-"} •{" "}
            {booking.durationMinutes || 90} min
          </p>
        </div>


        <span
          className={`coach-status-badge coach-status-badge--${getStatusClass(
            booking.status
          )}`}
        >
          {formatStatus(booking.status)}
        </span>
      </div>


      <div className="coach-booking-meta">
        <div>
          <strong>Email :</strong> {booking.email || "-"}
        </div>
        <div>
          <strong>Téléphone :</strong> {booking.phone || "-"}
        </div>
        <div>
          <strong>Jour :</strong> {formatDay(booking.requestedDay)}
        </div>
        <div>
          <strong>Séance :</strong>{" "}
          {booking.sessionType === "group"
            ? `Groupe${booking.participants ? ` (${booking.participants} pers.)` : ""}`
            : "Individuelle"}
        </div>
        <div>
          <strong>Participants :</strong> {booking.participants || 1}
        </div>
        <div>
          <strong>Discipline :</strong>{" "}
          {Array.isArray(booking.disciplines) && booking.disciplines.length > 0
            ? booking.disciplines.join(", ")
            : booking.discipline || "-"}
        </div>
      </div>


      {booking.message ? (
        <div className="coach-message-box">
          <strong>Message du client</strong>
          <p>{booking.message}</p>
        </div>
      ) : null}


      <div className="coach-booking-actions">
        <button
          type="button"
          className="coach-btn coach-btn--dark"
          onClick={() => onSetStatus(booking.id, "accepted")}
        >
          Accepter
        </button>


        <button
          type="button"
          className="coach-btn coach-btn--outline"
          onClick={() => onSetStatus(booking.id, "refused")}
        >
          Refuser
        </button>


        <button
          type="button"
          className="coach-btn coach-btn--muted"
          onClick={() => onSetStatus(booking.id, "cancelled")}
        >
          Annuler
        </button>


        <button
          type="button"
          className="coach-btn coach-btn--accent"
          onClick={() => onSetStatus(booking.id, "reschedule_requested")}
        >
          Proposer un autre créneau
        </button>
      </div>


      <div className="coach-textareas-grid">
        <div className="coach-editor-card">
          <label className="coach-editor-card__label">Réponse coach</label>
          <textarea
            className="coach-textarea"
            rows="4"
            value={coachReply}
            onChange={(e) => setCoachReply(e.target.value)}
            placeholder="Ex. Bonjour, votre créneau est disponible. Je vous confirme la séance..."
          />
          <div className="coach-inline-actions">
            <button
              type="button"
              className="coach-btn coach-btn--dark"
              onClick={handleSaveReply}
              disabled={savingReply}
            >
              {savingReply ? "Sauvegarde..." : "Sauvegarder"}
            </button>


            <a className="coach-btn coach-btn--outline" href={buildMailTo(booking)}>
              Envoyer par email
            </a>
          </div>
        </div>


        <div className="coach-editor-card">
          <label className="coach-editor-card__label">Note interne coach</label>
          <textarea
            className="coach-textarea"
            rows="4"
            value={coachNote}
            onChange={(e) => setCoachNote(e.target.value)}
            placeholder="Ex. Client motivé, préfère le soir, à recontacter..."
          />
          <div className="coach-inline-actions">
            <button
              type="button"
              className="coach-btn coach-btn--dark"
              onClick={handleSaveNote}
              disabled={savingNote}
            >
              {savingNote ? "Sauvegarde..." : "Sauvegarder"}
            </button>


            <a className="coach-btn coach-btn--outline" href={buildTel(booking.phone)}>
              Appeler
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

