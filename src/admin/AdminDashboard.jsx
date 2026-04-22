import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients: 0, team: 0, portfolio: 0, pendingReviews: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [clientsSnap, teamSnap, portfolioSnap, reviewsSnap, contactSnap, serviceSnap] =
        await Promise.all([
          getDocs(collection(db, "clients")),
          getDocs(collection(db, "team")),
          getDocs(collection(db, "portfolio")),
          getDocs(query(collection(db, "reviews"), where("approved", "==", false))),
          getDocs(query(collection(db, "contact_messages"), orderBy("createdAt", "desc"), limit(3))),
          getDocs(query(collection(db, "service_requests"), orderBy("createdAt", "desc"), limit(3))),
        ]);

      setStats({
        clients: clientsSnap.size,
        team: teamSnap.size,
        portfolio: portfolioSnap.size,
        pendingReviews: reviewsSnap.size,
      });

      const contacts = contactSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: "Contact" }));
      const services = serviceSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: "Service Request" }));
      const all = [...contacts, ...services]
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        .slice(0, 4);
      setRecentMessages(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
  };

  const statCards = [
    {
      label: "Total Clients",
      value: stats.clients,
      path: "/admin/dashboard/clients",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Team Members",
      value: stats.team,
      path: "/admin/dashboard/team",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 20v-1a8 8 0 0116 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Portfolio Projects",
      value: stats.portfolio,
      path: "/admin/dashboard/portfolio",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews,
      path: "/admin/dashboard/reviews",
      highlight: stats.pendingReviews > 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    { label: "Add Client", path: "/admin/dashboard/clients", icon: "+" },
    { label: "Add Project", path: "/admin/dashboard/portfolio", icon: "+" },
    { label: "Add Member", path: "/admin/dashboard/team", icon: "+" },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-[#7c6b9e] mt-20 justify-center" style={{ fontFamily: "Satoshi, sans-serif" }}>
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
        </svg>
        Loading dashboard...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1
          className="text-2xl text-[#F5F3FF] mb-1"
          style={{ fontFamily: "Clash Display, sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="text-[#7c6b9e] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Welcome back. Here's what's going on with Nexora Lab.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(card.path)}
            className={`rounded-2xl p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
              card.highlight
                ? "bg-yellow-500/10 border-yellow-500/30 hover:shadow-yellow-500/10"
                : "bg-[#F5F3FF]/5 border-[#C4B5FD]/20 hover:shadow-[#6D28D9]/20"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
              card.highlight ? "bg-yellow-500/20 text-yellow-400" : "bg-[#6D28D9]/20 text-[#C4B5FD]"
            }`}>
              {card.icon}
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${card.highlight ? "text-yellow-400" : "text-[#F5F3FF]"}`}
              style={{ fontFamily: "Clash Display, sans-serif" }}
            >
              {card.value}
            </div>
            <div className="text-[#7c6b9e] text-xs" style={{ fontFamily: "Satoshi, sans-serif" }}>
              {card.label}
            </div>
            {card.highlight && card.value > 0 && (
              <div className="mt-2 text-yellow-400 text-[10px] font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Needs attention →
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pending Reviews Alert */}
      {stats.pendingReviews > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-yellow-300 text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
              <span className="font-semibold">{stats.pendingReviews} review{stats.pendingReviews > 1 ? "s" : ""}</span> waiting for your approval
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard/reviews")}
            className="flex-shrink-0 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl text-xs transition-all"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Review Now →
          </button>
        </motion.div>
      )}

      {/* Bottom grid — Recent Messages + Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* Recent Messages */}
        <div className="md:col-span-2 bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-[#F5F3FF] text-base"
              style={{ fontFamily: "Clash Display, sans-serif" }}
            >
              Recent Messages
            </h2>
            <button
              onClick={() => navigate("/admin/dashboard/messages")}
              className="text-[#7c6b9e] hover:text-[#C4B5FD] text-xs transition-colors"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              View all →
            </button>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-[#7c6b9e] text-sm text-center py-6" style={{ fontFamily: "Satoshi, sans-serif" }}>
              No messages yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => navigate("/admin/dashboard/messages")}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F3FF]/5 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#6D28D9]/20 flex items-center justify-center flex-shrink-0">
                    <span
                      className="text-[#C4B5FD] text-xs font-bold"
                      style={{ fontFamily: "Clash Display, sans-serif" }}
                    >
                      {msg.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[#F5F3FF] text-sm truncate group-hover:text-[#C4B5FD] transition-colors"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      {msg.name || "Unknown"}
                    </p>
                    <p className="text-[#7c6b9e] text-xs truncate" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      {msg.message || "No message"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        msg.type === "Contact"
                          ? "bg-[#C4B5FD]/10 text-[#C4B5FD]"
                          : "bg-[#6D28D9]/30 text-[#a78bfa]"
                      }`}
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      {msg.type}
                    </span>
                    <span className="text-[#7c6b9e] text-[10px]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-5">
          <h2
            className="text-[#F5F3FF] text-base mb-5"
            style={{ fontFamily: "Clash Display, sans-serif" }}
          >
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 bg-[#6D28D9]/10 hover:bg-[#6D28D9]/25 border border-[#6D28D9]/20 hover:border-[#6D28D9]/50 text-[#C4B5FD] px-4 py-3 rounded-xl text-sm transition-all duration-200 text-left"
                style={{ fontFamily: "Satoshi, sans-serif" }}
              >
                <span className="w-6 h-6 rounded-lg bg-[#6D28D9]/30 flex items-center justify-center text-[#C4B5FD] font-bold text-base flex-shrink-0">
                  +
                </span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}