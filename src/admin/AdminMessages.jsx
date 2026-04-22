import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ["All", "Contact", "Service Requests"];

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contactSnap, serviceSnap] = await Promise.all([
        getDocs(query(collection(db, "contact_messages"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "service_requests"), orderBy("createdAt", "desc"))),
      ]);

      const contacts = contactSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        type: "Contact",
      }));
      const services = serviceSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        type: "Service Request",
      }));

      const all = [...contacts, ...services].sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });

      setMessages(all);
    } catch (e) {
      console.error("Error fetching messages:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (msg) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    setDeleting(msg.id);
    try {
      const colName = msg.type === "Contact" ? "contact_messages" : "service_requests";
      await deleteDoc(doc(db, colName, msg.id));
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      if (selected?.id === msg.id) setSelected(null);
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleting(null);
    }
  };

  // Optimization: Calculate counts once per message update
  const counts = useMemo(() => ({
    all: messages.length,
    contact: messages.filter(m => m.type === "Contact").length,
    service: messages.filter(m => m.type === "Service Request").length
  }), [messages]);

  const filtered = messages.filter((m) => {
    if (activeTab === "All") return true;
    if (activeTab === "Contact") return m.type === "Contact";
    return m.type === "Service Request";
  });

  const formatDate = (ts) => {
    if (!ts?.seconds) return "—";
    return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-[#F5F3FF] mb-1 font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
          Messages
        </h1>
        <p className="text-[#7c6b9e] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
          All incoming contact messages and service requests.
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
            {tab === "All" && ` (${counts.all})`}
            {tab === "Contact" && ` (${counts.contact})`}
            {tab === "Service Requests" && ` (${counts.service})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[#7c6b9e] mt-12 justify-center" style={{ fontFamily: "Satoshi, sans-serif" }}>
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          Loading messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center mt-20 text-[#7c6b9e]" style={{ fontFamily: "Satoshi, sans-serif" }}>
          No messages found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#F5F3FF]/5 border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-[#6D28D9]/50 ${
                  selected?.id === msg.id ? "border-[#6D28D9]" : "border-[#C4B5FD]/20"
                }`}
                onClick={() => setSelected(selected?.id === msg.id ? null : msg)}
              >
                {/* User Info Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#6D28D9]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C4B5FD] text-xs font-bold" style={{ fontFamily: "Clash Display, sans-serif" }}>
                        {msg.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#F5F3FF] text-sm font-medium" style={{ fontFamily: "Satoshi, sans-serif" }}>
                        {msg.name || "Unknown"}
                      </p>
                      <p className="text-[#7c6b9e] text-xs">{msg.email || "—"}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                    msg.type === "Contact" ? "bg-[#C4B5FD]/10 text-[#C4B5FD]" : "bg-[#6D28D9]/30 text-[#a78bfa]"
                  }`}>
                    {msg.type}
                  </span>
                </div>

                {msg.service && (
                  <p className="text-[#C4B5FD] text-xs mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Service: {msg.service}
                  </p>
                )}

                <p className="text-[#7c6b9e] text-xs leading-relaxed line-clamp-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  {msg.message || "No message provided."}
                </p>

                <p className="text-[#7c6b9e] text-[10px] mt-3" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  {formatDate(msg.createdAt)}
                </p>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selected?.id === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 pt-4 border-t border-[#C4B5FD]/10 space-y-3">
                        {msg.budget && (
                          <div>
                            <p className="text-[#7c6b9e] text-[10px] uppercase tracking-widest mb-0.5">Budget</p>
                            <p className="text-[#F5F3FF] text-sm">{msg.budget}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[#7c6b9e] text-[10px] uppercase tracking-widest mb-0.5">Full Message</p>
                          <p className="text-[#F5F3FF] text-sm leading-relaxed">{msg.message}</p>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          {/* FIXED ANCHOR TAG HERE */}
                          <a
                            href={`mailto:${msg.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-center bg-[#6D28D9] hover:bg-[#5b21b6] text-[#F5F3FF] py-2 rounded-xl text-xs transition-all no-underline"
                            style={{ fontFamily: "Satoshi, sans-serif" }}
                          >
                            Reply via Email
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(msg); }}
                            disabled={deleting === msg.id}
                            className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-xl text-xs transition-all disabled:opacity-50"
                            style={{ fontFamily: "Satoshi, sans-serif" }}
                          >
                            {deleting === msg.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}