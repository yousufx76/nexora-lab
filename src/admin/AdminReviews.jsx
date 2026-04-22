import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ["All", "Pending", "Approved"];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "reviews"), orderBy("createdAt", "desc"))
      );
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await updateDoc(doc(db, "reviews", id), { approved: true });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved: true } : r))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await updateDoc(doc(db, "reviews", id), { approved: false });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, approved: false } : r))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    setActionId(id);
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const filtered = reviews.filter((r) => {
    if (activeTab === "Pending") return !r.approved;
    if (activeTab === "Approved") return r.approved;
    return true;
  });

  const Stars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={s <= rating ? "#6D28D9" : "none"}
          stroke="#6D28D9"
          strokeWidth="1.8"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl text-[#F5F3FF] mb-1"
          style={{ fontFamily: "Clash Display, sans-serif" }}
        >
          Reviews
        </h1>
        <p className="text-[#7c6b9e] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Approve or reject client reviews before they appear publicly.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-[#6D28D9] text-[#F5F3FF]"
                : "bg-[#F5F3FF]/5 text-[#7c6b9e] hover:text-[#C4B5FD]"
            }`}
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            {tab}
            {tab === "All" && ` (${reviews.length})`}
            {tab === "Pending" && ` (${reviews.filter((r) => !r.approved).length})`}
            {tab === "Approved" && ` (${reviews.filter((r) => r.approved).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          className="flex items-center gap-3 text-[#7c6b9e] mt-12 justify-center"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          Loading reviews...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center mt-20 text-[#7c6b9e]"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          No reviews found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-5"
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6D28D9]/20 flex items-center justify-center flex-shrink-0">
                      <span
                        className="text-[#C4B5FD] text-xs font-bold"
                        style={{ fontFamily: "Clash Display, sans-serif" }}
                      >
                        {review.clientName?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <p
                        className="text-[#F5F3FF] text-sm font-medium"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      >
                        {review.clientName || "Anonymous"}
                      </p>
                      <p
                        className="text-[#7c6b9e] text-xs"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      >
                        {review.company || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                      review.approved
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {review.approved ? "Approved" : "Pending"}
                  </span>
                </div>

                {/* Stars */}
                <div className="mb-3">
                  <Stars rating={review.rating ?? 0} />
                </div>

                {/* Comment */}
                <p
                  className="text-[#7c6b9e] text-sm leading-relaxed mb-4"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {review.comment || "No comment provided."}
                </p>

                <p
                  className="text-[#7c6b9e] text-[10px] mb-4"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {formatDate(review.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  {!review.approved ? (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actionId === review.id}
                      className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-xl text-xs transition-all disabled:opacity-50"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      {actionId === review.id ? "..." : "✓ Approve"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={actionId === review.id}
                      className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 py-2 rounded-xl text-xs transition-all disabled:opacity-50"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      {actionId === review.id ? "..." : "↩ Unapprove"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={actionId === review.id}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-xl text-xs transition-all disabled:opacity-50"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {actionId === review.id ? "..." : "Delete"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}