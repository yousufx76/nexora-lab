import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "../cloudinary";

const INDUSTRIES = ["Technology", "Education", "Healthcare", "Finance", "Retail", "Media", "Other"];

const emptyForm = {
  name: "", industry: "", description: "", website: "", featured: false, logo: "",
};

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "clients"));
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (client) => {
    setEditing(client.id);
    setForm({
      name: client.name || "",
      industry: client.industry || "",
      description: client.description || "",
      website: client.website || "",
      featured: client.featured || false,
      logo: client.logo || "",
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, logo: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, "clients", editing), { ...form });
        setClients((prev) =>
          prev.map((c) => (c.id === editing ? { ...c, ...form } : c))
        );
      } else {
        const ref = await addDoc(collection(db, "clients"), {
          ...form,
          createdAt: serverTimestamp(),
        });
        setClients((prev) => [...prev, { id: ref.id, ...form }]);
      }
      setModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteDoc(doc(db, "clients", id));
      setClients((prev) => prev.filter((c) => c.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  };

  const industryEmoji = {
    Technology: "💻", Education: "🎓", Healthcare: "🏥",
    Finance: "💰", Retail: "🛍️", Media: "📱", Other: "🌐",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl text-[#F5F3FF] mb-1"
            style={{ fontFamily: "Clash Display, sans-serif" }}
          >
            Clients
          </h1>
          <p className="text-[#7c6b9e] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#6D28D9] hover:bg-[#5b21b6] text-[#F5F3FF] px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
          style={{ fontFamily: "Satoshi, sans-serif" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-3 text-[#7c6b9e] mt-12 justify-center" style={{ fontFamily: "Satoshi, sans-serif" }}>
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          Loading clients...
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center mt-20 text-[#7c6b9e]" style={{ fontFamily: "Satoshi, sans-serif" }}>
          No clients yet. Add your first one!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-5"
            >
              {/* Logo + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#6D28D9]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {client.logo
                    ? <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                    : <span className="text-lg">{industryEmoji[client.industry] ?? "🌐"}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-[#F5F3FF] text-sm font-medium truncate" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    {client.name}
                  </p>
                  <p className="text-[#7c6b9e] text-xs" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    {client.industry || "—"}
                  </p>
                </div>
                {client.featured && (
                  <span className="ml-auto text-[10px] bg-[#6D28D9]/30 text-[#C4B5FD] px-2 py-0.5 rounded-full flex-shrink-0" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    Featured
                  </span>
                )}
              </div>

              {/* Description */}
              {client.description && (
                <p className="text-[#7c6b9e] text-xs leading-relaxed line-clamp-2 mb-4" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  {client.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(client)}
                  className="flex-1 bg-[#F5F3FF]/5 hover:bg-[#6D28D9]/20 text-[#C4B5FD] py-2 rounded-xl text-xs transition-all"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(client)}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-xl text-xs transition-all"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#130826] border border-[#C4B5FD]/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg text-[#F5F3FF]" style={{ fontFamily: "Clash Display, sans-serif" }}>
                    {editing ? "Edit Client" : "Add Client"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="text-[#7c6b9e] hover:text-[#F5F3FF]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Logo upload */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#6D28D9]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {form.logo
                          ? <img src={form.logo} alt="logo" className="w-full h-full object-cover" />
                          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#7c6b9e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        }
                      </div>
                      <label className="flex-1 cursor-pointer">
                        <div className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 hover:border-[#6D28D9] rounded-xl px-4 py-2.5 text-[#7c6b9e] text-xs text-center transition-all" style={{ fontFamily: "Satoshi, sans-serif" }}>
                          {uploading ? "Uploading..." : "Choose Image"}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      placeholder="Client name"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Industry</label>
                    <select
                      value={form.industry}
                      onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
                      className="w-full bg-[#130826] border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm resize-none"
                      placeholder="Short description..."
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Website</label>
                    <input
                      value={form.website}
                      onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                      className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      placeholder="https://..."
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    />
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center justify-between bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-[#F5F3FF] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>Featured</p>
                      <p className="text-[#7c6b9e] text-xs" style={{ fontFamily: "Satoshi, sans-serif" }}>Show on homepage</p>
                    </div>
                    <button
                      onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
                      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${form.featured ? "bg-[#6D28D9]" : "bg-[#F5F3FF]/10"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${form.featured ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 bg-[#F5F3FF]/5 hover:bg-[#F5F3FF]/10 text-[#7c6b9e] py-3 rounded-xl text-sm transition-all"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading || !form.name.trim()}
                    className="flex-1 bg-[#6D28D9] hover:bg-[#5b21b6] text-[#F5F3FF] py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {saving ? "Saving..." : editing ? "Save Changes" : "Add Client"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-[#130826] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm">
                <h2 className="text-lg text-[#F5F3FF] mb-2" style={{ fontFamily: "Clash Display, sans-serif" }}>
                  Delete Client?
                </h2>
                <p className="text-[#7c6b9e] text-sm mb-6" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  Are you sure you want to delete <span className="text-[#F5F3FF]">{confirmDelete.name}</span>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 bg-[#F5F3FF]/5 hover:bg-[#F5F3FF]/10 text-[#7c6b9e] py-2.5 rounded-xl text-sm transition-all"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete.id)}
                    disabled={deleteId === confirmDelete.id}
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {deleteId === confirmDelete.id ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}