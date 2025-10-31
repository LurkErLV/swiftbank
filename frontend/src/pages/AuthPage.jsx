import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const [p] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const tab = p.get("tab") === "register" ? "register" : "login";
  
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      
      // Navigate to dashboard after successful auth
      navigate("/dashboard");
    } catch (err) {
      // Display user-friendly error message
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 text-center">
      <h1 className="text-3xl font-bold mb-6">
        {tab === "login" ? "Sign in" : "Create account"}
      </h1>
      
      {error && (
        <div className="max-w-sm mx-auto mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 text-left">
        {tab === "register" && (
          <>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition"
              placeholder="Name"
              required
            />
            <input
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition"
              placeholder="Surname"
              required
            />
          </>
        )}
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition"
          placeholder="Email"
          required
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-white/40 focus:outline-none transition"
          placeholder="Password"
          minLength={8}
          required
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-ui-surface font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : (tab === "login" ? "Sign in" : "Register")}
        </button>
      </form>
      
      <p className="mt-6 text-white/70">
        {tab === "login" ? "No account?" : "Already have one?"}{" "}
        <Link
          to={tab === "login" ? "/login?tab=register" : "/login"}
          className="text-white underline hover:no-underline transition"
        >
          {tab === "login" ? "Register" : "Sign in"}
        </Link>
      </p>
      
      <p className="mt-4">
        <Link to="/" className="text-white/50 hover:text-white/70 hover:underline transition">
          ← Back
        </Link>
      </p>
    </section>
  );
}