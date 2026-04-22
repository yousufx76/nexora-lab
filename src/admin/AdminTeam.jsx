import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "../cloudinary";

const DEPARTMENTS = ["Design", "Development", "Marketing", "Security", "Management", "Other"];

const emptyForm = {
  name: "", role: "", department: "", bio: "", email: "",
  whatsapp: "", skills: [], image: "", order: 0, featured: false,
};

export default function AdminTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [skillInput, setSkillInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "team"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setSkillInput("");
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member.id);
    setForm({
      name: member.name || "",
      role: member.role || "",
      department: member.department || "",
      bio: member.bio || "",
      email: member.email || "",
      whatsapp: member.whatsapp || "",
      skills: member.skills || [],
      image: member.image || "",
      order: member.order ?? 0,
      featured: member.featured || false,
    });
    setSkillInput("");
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      if (editing) {
        await updateDoc(doc(db, "team", editing), payload);
        setMembers((prev) =>
          prev.map((m) => (m.id === editing ? { ...m, ...payload } : m))
        );
      } else {
        const ref = await addDoc(collection(db, "team"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setMembers((prev) => [...prev, { id: ref.id, ...payload }]);
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
      await deleteDoc(doc(db, "team", id));
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  };

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = ["#6D28D9", "#a855f7", "#7c3aed", "#1a0a3d"];

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
            Team
          </h1>
          <p className="text-[#7c6b9e] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>
            {members.length} member{members.length !== 1 ? "s" : ""} total
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
          Add Member
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-3 text-[#7c6b9e] mt-12 justify-center" style={{ fontFamily: "Satoshi, sans-serif" }}>
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          Loading team...
        </div>
      ) : members.length === 0 ? (
        <div className="text-center mt-20 text-[#7c6b9e]" style={{ fontFamily: "Satoshi, sans-serif" }}>
          No team members yet. Add your first one!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl p-5"
            >
              {/* Avatar + info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  {member.image
                    ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    : <div
                        className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: avatarColors[i % avatarColors.length], fontFamily: "Clash Display, sans-serif" }}
                      >
                        {getInitials(member.name)}
                      </div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#F5F3FF] text-sm font-medium truncate" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    {member.name}
                  </p>
                  <p className="text-[#7c6b9e] text-xs truncate" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    {member.role || "—"}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  {member.featured && (
                    <span className="text-[10px] bg-[#6D28D9]/30 text-[#C4B5FD] px-2 py-0.5 rounded-full" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      Featured
                    </span>
                  )}
                  <span className="text-[10px] bg-[#F5F3FF]/5 text-[#7c6b9e] px-2 py-0.5 rounded-full" style={{ fontFamily: "Satoshi, sans-serif" }}>
                    #{member.order ?? 0}
                  </span>
                </div>
              </div>

              {/* Department */}
              {member.department && (
                <p className="text-[#C4B5FD] text-xs mb-3" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  {member.department}
                </p>
              )}

              {/* Skills */}
              {member.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[10px] bg-[#6D28D9]/10 text-[#C4B5FD] px-2 py-0.5 rounded-full" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && (
                    <span className="text-[10px] text-[#7c6b9e]" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      +{member.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(member)}
                  className="flex-1 bg-[#F5F3FF]/5 hover:bg-[#6D28D9]/20 text-[#C4B5FD] py-2 rounded-xl text-xs transition-all"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(member)}
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
              <div className="bg-[#130826] border border-[#C4B5FD]/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg text-[#F5F3FF]" style={{ fontFamily: "Clash Display, sans-serif" }}>
                    {editing ? "Edit Member" : "Add Member"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="text-[#7c6b9e] hover:text-[#F5F3FF]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Image upload */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#6D28D9]/20 flex items-center justify-center">
                        {form.image
                          ? <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#7c6b9e" strokeWidth="1.8" /><path d="M4 20v-1a8 8 0 0116 0v1" stroke="#7c6b9e" strokeWidth="1.8" strokeLinecap="round" /></svg>
                        }
                      </div>
                      <label className="flex-1 cursor-pointer">
                        <div className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 hover:border-[#6D28D9] rounded-xl px-4 py-2.5 text-[#7c6b9e] text-xs text-center transition-all" style={{ fontFamily: "Satoshi, sans-serif" }}>
                          {uploading ? "Uploading..." : "Choose Image"}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>

                  {/* Name + Role */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Name *</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-3 py-2.5 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                        placeholder="Full name"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Role</label>
                      <input
                        value={form.role}
                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                        className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-3 py-2.5 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                        placeholder="e.g. Designer"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                      className="w-full bg-[#130826] border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm resize-none"
                      placeholder="Short bio..."
                      style={{ fontFamily: "Satoshi, sans-serif" }}
                    />
                  </div>

                  {/* Email + WhatsApp */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Email</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-3 py-2.5 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                        placeholder="email@..."
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      />
                    </div>
                    <div>
                      <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>WhatsApp</label>
                      <input
                        value={form.whatsapp}
                        onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
                        className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-3 py-2.5 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                        placeholder="01..."
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Skills</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        className="flex-1 bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-3 py-2.5 text-[#F5F3FF] placeholder-[#7c6b9e] outline-none focus:border-[#6D28D9] transition-all text-sm"
                        placeholder="Type skill + Enter"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      />
                      <button
                        onClick={addSkill}
                        className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-4 rounded-xl text-sm transition-all"
                      >
                        Add
                      </button>
                    </div>
                    {form.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.skills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1.5 text-xs bg-[#6D28D9]/20 text-[#C4B5FD] px-3 py-1 rounded-full"
                            style={{ fontFamily: "Satoshi, sans-serif" }}
                          >
                            {skill}
                            <button onClick={() => removeSkill(skill)} className="text-[#7c6b9e] hover:text-red-400 transition-colors">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order + Featured */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#C4B5FD] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>Order</label>
                      <input
                        type="number"
                        min="0"
                        value={form.order}
                        onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                        className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-3 py-2.5 text-[#F5F3FF] outline-none focus:border-[#6D28D9] transition-all text-sm"
                        style={{ fontFamily: "Satoshi, sans-serif" }}
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="flex items-center justify-between bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-2.5">
                        <p className="text-[#F5F3FF] text-sm" style={{ fontFamily: "Satoshi, sans-serif" }}>Featured</p>
                        <button
                          onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
                          className={`w-11 h-6 rounded-full transition-all duration-200 relative ${form.featured ? "bg-[#6D28D9]" : "bg-[#F5F3FF]/10"}`}
                        >
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${form.featured ? "left-5" : "left-0.5"}`} />
                        </button>
                      </div>
                    </div>
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
                    {saving ? "Saving..." : editing ? "Save Changes" : "Add Member"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
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
                  Remove Member?
                </h2>
                <p className="text-[#7c6b9e] text-sm mb-6" style={{ fontFamily: "Satoshi, sans-serif" }}>
                  Are you sure you want to remove <span className="text-[#F5F3FF]">{confirmDelete.name}</span>? This cannot be undone.
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
                    {deleteId === confirmDelete.id ? "Removing..." : "Yes, Remove"}
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