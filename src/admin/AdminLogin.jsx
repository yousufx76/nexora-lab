import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ADMIN_PASSWORD = "nexora@admin2025";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("nexora_admin", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid password. Access denied.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a0a3d] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6D28D9] opacity-10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-10 backdrop-blur-sm">
          {/* Logo area */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#6D28D9] mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7v10l10 5 10-5V7L12 2z"
                  stroke="#F5F3FF"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12L2 7M12 12l10-5M12 12v10"
                  stroke="#C4B5FD"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <h1
              className="text-2xl text-[#F5F3FF]"
              style={{ fontFamily: "Clash Display, sans-serif" }}
            >
              NEXORA LAB
            </h1>
            <p className="text-[#7c6b9e] text-sm mt-1" style={{ fontFamily: "Satoshi, sans-serif" }}>
              Admin Access Only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] transition-all"
                style={{ fontFamily: "Satoshi, sans-serif" }}
                autoFocus
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-[#F5F3FF] py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Enter Dashboard"
              )}
            </button>
          </form>

          <p
            className="text-center text-[#7c6b9e] text-xs mt-6"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Xanin XZ. — Internal Use Only
          </p>
        </div>
      </motion.div>
    </div>
  );
}