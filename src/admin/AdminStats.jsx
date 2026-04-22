import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";

export default function AdminStats() {
  const [activeProjects, setActiveProjects] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = doc(db, "agency_stats", "main");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setActiveProjects(snap.data().activeProjects ?? "");
        }
      } catch (e) {
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const ref = doc(db, "agency_stats", "main");
      
      // Replaced updateDoc with setDoc + merge
      await setDoc(ref, { activeProjects: Number(activeProjects) }, { merge: true });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-md"
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl text-[#F5F3FF] mb-1"
          style={{ fontFamily: "Clash Display, sans-serif" }}
        >
          Agency Stats
        </h1>
        <p className="text-[#7c6b9e] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Update the live numbers shown on the homepage.
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-6">
        {loading ? (
          <div className="flex items-center gap-3 text-[#7c6b9e]" style={{ fontFamily: "Satoshi, sans-serif" }}>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
            Loading...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Input */}
            <div>
              <label
                className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                Active Projects
              </label>
              <input
                type="number"
                min="0"
                value={activeProjects}
                onChange={(e) => setActiveProjects(e.target.value)}
                className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] focus:ring-1 focus:ring-[#6D28D9] transition-all text-lg"
                style={{ fontFamily: "Satoshi, sans-serif" }}
                placeholder="e.g. 25"
              />
              <p className="text-[#7c6b9e] text-xs mt-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                This number shows on the homepage hero card in real time.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
                {error}
              </p>
            )}

            {/* Success */}
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-emerald-400 text-sm"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                ✓ Saved successfully.
              </motion.p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-[#F5F3FF] py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#C4B5FD" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}