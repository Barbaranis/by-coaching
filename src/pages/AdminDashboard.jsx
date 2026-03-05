import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_CONFIG = {
  brandName: "BY Coaching",
  city: "Paris 16e",
  schedule: {
    sundayEnabled: true,
    sunday: { start: "10:00", end: "19:00" },
    saturdayEveningEnabled: true,
    saturdayEvening: { start: "18:00", end: "23:00" }
  },
  session: { defaultDurationMinutes: 90, maxGroupSize: 4, allowIndividual: true, allowGroup: true },
  pricing: { individual: 40, groupPerPerson: 20 },
  policies: { cancellationHours: 24, refundIfClientCancels: true, refundIfCoachCancels: true },
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("bookings"); // bookings | config
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  const [bookings, setBookings] = useState([]);

  // load config (create if missing)
  useEffect(() => {
    const ref = doc(db, "siteConfig", "main");
    (async () => {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { ...DEFAULT_CONFIG, updatedAt: serverTimestamp() });
        setConfig(DEFAULT_CONFIG);
      } else {
        setConfig(snap.data());
      }
    })();

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setConfig(snap.data());
    });

    return () => unsub();
  }, []);

  // listen bookings
  useEffect(() => {
    const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings]
  );

  const updateConfigLocal = (path, value) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  async function saveConfig() {
    if (!config) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "siteConfig", "main"), { ...config, updatedAt: serverTimestamp() });
    } finally {
      setSaving(false);
    }
  }

  async function setBookingStatus(id, status) {
    await updateDoc(doc(db, "bookings", id), { status, updatedAt: serverTimestamp() });
  }

  return (
    <div>
      <h1>Dashboard coach</h1>

      <div style={styles.tabs}>
        <button style={tab === "bookings" ? styles.tabActive : styles.tab} onClick={() => setTab("bookings")}>
          Réservations {pendingCount > 0 ? `(${pendingCount})` : ""}
        </button>
        <button style={tab === "config" ? styles.tabActive : styles.tab} onClick={() => setTab("config")}>
          Configuration (heures, prix…)
        </button>
      </div>

      {tab === "bookings" && (
        <div>
          <h2>Demandes</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {bookings.map((b) => (
              <div key={b.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <strong>{b.fullName}</strong>
                  <span style={styles.badge(b.status)}>{b.status}</span>
                </div>

                <div style={styles.meta}>
                  <div>Email: {b.email}</div>
                  <div>Tél: {b.phone}</div>
                  <div>
                    {b.requestedDay === "sunday" ? "Dimanche" : "Samedi soir"} — {b.requestedDate} à {b.requestedStartTime}
                  </div>
                  <div>Type: {b.sessionType} {b.sessionType === "group" ? `(${b.participants} pers.)` : ""}</div>
                  {b.message ? <div>Message: {b.message}</div> : null}
                </div>

                <div style={styles.actions}>
                  <button onClick={() => setBookingStatus(b.id, "accepted")} style={styles.ok}>Accepter</button>
                  <button onClick={() => setBookingStatus(b.id, "refused")} style={styles.no}>Refuser</button>
                  <button onClick={() => setBookingStatus(b.id, "cancelled")} style={styles.neutral}>Annuler</button>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <p>Aucune demande.</p>}
          </div>
        </div>
      )}

      {tab === "config" && config && (
        <div style={{ maxWidth: 620 }}>
          <h2>Heures & réglages</h2>

          <fieldset style={styles.fieldset}>
            <legend>Dimanche</legend>
            <label style={styles.row}>
              <span>Actif</span>
              <input
                type="checkbox"
                checked={config.schedule.sundayEnabled}
                onChange={(e) => updateConfigLocal("schedule.sundayEnabled", e.target.checked)}
              />
            </label>
            <label style={styles.row}>
              <span>Début</span>
              <input
                type="time"
                value={config.schedule.sunday.start}
                onChange={(e) => updateConfigLocal("schedule.sunday.start", e.target.value)}
              />
            </label>
            <label style={styles.row}>
              <span>Fin</span>
              <input
                type="time"
                value={config.schedule.sunday.end}
                onChange={(e) => updateConfigLocal("schedule.sunday.end", e.target.value)}
              />
            </label>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend>Samedi soir</legend>
            <label style={styles.row}>
              <span>Actif</span>
              <input
                type="checkbox"
                checked={config.schedule.saturdayEveningEnabled}
                onChange={(e) => updateConfigLocal("schedule.saturdayEveningEnabled", e.target.checked)}
              />
            </label>
            <label style={styles.row}>
              <span>Début</span>
              <input
                type="time"
                value={config.schedule.saturdayEvening.start}
                onChange={(e) => updateConfigLocal("schedule.saturdayEvening.start", e.target.value)}
              />
            </label>
            <label style={styles.row}>
              <span>Fin</span>
              <input
                type="time"
                value={config.schedule.saturdayEvening.end}
                onChange={(e) => updateConfigLocal("schedule.saturdayEvening.end", e.target.value)}
              />
            </label>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend>Prix</legend>
            <label style={styles.row}>
              <span>Individuel (€)</span>
              <input
                type="number"
                value={config.pricing.individual}
                onChange={(e) => updateConfigLocal("pricing.individual", Number(e.target.value))}
              />
            </label>
            <label style={styles.row}>
              <span>Groupe / pers (€)</span>
              <input
                type="number"
                value={config.pricing.groupPerPerson}
                onChange={(e) => updateConfigLocal("pricing.groupPerPerson", Number(e.target.value))}
              />
            </label>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend>Règles</legend>
            <label style={styles.row}>
              <span>Annulation (heures)</span>
              <input
                type="number"
                value={config.policies.cancellationHours}
                onChange={(e) => updateConfigLocal("policies.cancellationHours", Number(e.target.value))}
              />
            </label>
          </fieldset>

          <button onClick={saveConfig} disabled={saving} style={styles.saveBtn}>
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabs: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  tab: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" },
  tabActive: { padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "white", cursor: "pointer" },

  card: { padding: 14, borderRadius: 14, border: "1px solid #eee", background: "white" },
  meta: { marginTop: 8, display: "grid", gap: 4, opacity: 0.9 },
  actions: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  ok: { padding: "10px 12px", borderRadius: 10, border: "none", background: "#111", color: "white", cursor: "pointer" },
  no: { padding: "10px 12px", borderRadius: 10, border: "1px solid #111", background: "white", cursor: "pointer" },
  neutral: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" },

  badge: (status) => ({
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #eee",
    background:
      status === "pending" ? "#fff6d6" :
      status === "accepted" ? "#dafbe1" :
      status === "refused" ? "#ffe0e0" :
      "#eee",
  }),

  fieldset: { border: "1px solid #eee", borderRadius: 14, padding: 12, marginBottom: 12 },
  row: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginTop: 8 },
  saveBtn: { padding: 12, borderRadius: 12, border: "none", background: "#111", color: "white", cursor: "pointer", width: "100%" },
};