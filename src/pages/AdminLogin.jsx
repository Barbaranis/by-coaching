import { useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";


export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);


  const nav = useNavigate();


  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);


    try {
      await setPersistence(auth, browserLocalPersistence);


      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );


      nav("/admin");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          setErr("Adresse e-mail invalide.");
          break;
        case "auth/missing-password":
          setErr("Veuillez entrer votre mot de passe.");
          break;
        case "auth/invalid-credential":
          setErr("Identifiants incorrects.");
          break;
        case "auth/too-many-requests":
          setErr("Trop de tentatives. Réessaie plus tard.");
          break;
        default:
          setErr("Connexion impossible. Vérifie tes identifiants.");
      }
    } finally {
      setLoading(false);
    }
  }


  return (
    <section style={styles.page}>
      <div style={styles.card}>
        <div style={styles.top}>
          <p style={styles.badge}>BY Coaching</p>
          <h1 style={styles.title}>Connexion coach</h1>
          <p style={styles.subtitle}>
     
          </p>
        </div>


        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>
            Adresse e-mail
            <input
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@bycoaching.com"
              type="email"
              autoComplete="email"
              required
            />
          </label>


          <label style={styles.label}>
            Mot de passe
            <input
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>


          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>


          {err ? <p style={styles.error}>{err}</p> : null}
        </form>
      </div>
    </section>
  );
}


const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #111827 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "20px",
    padding: "32px 24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  top: {
    marginBottom: "24px",
    textAlign: "center",
  },
  badge: {
    margin: "0 0 10px",
    fontSize: "0.85rem",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#e11d48",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "1.9rem",
    lineHeight: 1.2,
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    color: "#4b5563",
    fontSize: "0.98rem",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: "600",
    color: "#111827",
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "6px",
    padding: "14px 16px",
    border: "none",
    borderRadius: "12px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  error: {
    margin: 0,
    color: "#b91c1c",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "0.95rem",
  },
};

