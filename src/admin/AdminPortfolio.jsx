import { useEffect, useState } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { uploadImage } from "../cloudinary";

const CATEGORIES = ["Web Design", "Graphic Design", "UI/UX", "Branding", "Development", "Marketing", "Other"];

const emptyForm = {
  title: "", category: "", description: "", tags: [],
  thumbnail: "", liveUrl: "", featured: false, order: 0,
};

export default function AdminPortfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "portfolio"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sortedData = data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setProjects(sortedData);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setTagInput("");
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project.id);
    setForm({
      title: project.title || "",
      category: project.category || "",
      description: project.description || "",
      tags: project.tags || [],
      thumbnail: project.thumbnail || "",
      liveUrl: project.liveUrl || "",
      featured: project.featured || false,
      order: project.order ?? 0,
    });
    setTagInput("");
    setModalOpen(true);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
    } catch (e) {
      console.error("Upload Error:", e);
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  };

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) };
      
      if (editing) {
        await updateDoc(doc(db, "portfolio", editing), payload);
        setProjects((prev) =>
          prev.map((p) => (p.id === editing ? { ...p, ...payload } : p))
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      } else {
        const newProject = { ...payload, createdAt: serverTimestamp() };
        const ref = await addDoc(collection(db, "portfolio"), newProject);
        setProjects((prev) => 
          [...prev, { id: ref.id, ...payload }]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      }
      setModalOpen(false);
    } catch (e) {
      console.error("Save Error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await deleteDoc(doc(db, "portfolio", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch (e) {
      console.error("Delete Error:", e);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-[#F5F3FF] mb-1 font-bold">Portfolio</h1>
          <p className="text-[#7c6b9e] text-sm">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#6D28D9] hover:bg-[#5b21b6] text-[#F5F3FF] px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Project
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-3 text-[#7c6b9e] mt-12 justify-center">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="#6D28D9" strokeWidth="3" fill="none" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center mt-20 text-[#7c6b9e]">
          No projects yet. Add your first one!
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="w-full h-36 bg-[#6D28D9]/10 flex items-center justify-center overflow-hidden">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c6b9e" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-[#F5F3FF] text-sm font-medium">{project.title}</p>
                  {project.featured && (
                    <span className="text-[10px] bg-[#6D28D9]/30 text-[#C4B5FD] px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </div>

                <p className="text-[#C4B5FD] text-xs mb-3">{project.category || "No Category"}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-[#6D28D9]/10 text-[#C4B5FD] px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {project.tags?.length > 3 && (
                    <span className="text-[10px] text-[#7c6b9e]">+{project.tags.length - 3}</span>
                  )}
                </div>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => openEdit(project)}
                    className="flex-1 bg-[#F5F3FF]/5 hover:bg-[#6D28D9]/20 text-[#C4B5FD] py-2 rounded-xl text-xs transition-all"
                  >
                    Edit
                  </button>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#F5F3FF]/5 hover:bg-[#6D28D9]/20 text-[#7c6b9e] hover:text-[#C4B5FD] px-3 py-2 rounded-xl text-xs transition-all"
                    >
                      ↗
                    </a>
                  )}
                  <button
                    onClick={() => setConfirmDelete(project)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-xl text-xs transition-all"
                  >
                    Delete
                  </button>
                </div>
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
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-[#130826] border border-[#C4B5FD]/20 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg text-[#F5F3FF] font-semibold">
                    {editing ? "Edit Project" : "Add Project"}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="text-[#7c6b9e] hover:text-[#F5F3FF]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Thumbnail Section */}
                  <div>
                    <label className="block text-[#C4B5FD] text-[10px] uppercase tracking-widest mb-2 font-bold">Thumbnail</label>
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-[#6D28D9]/10 flex items-center justify-center mb-2 border border-dashed border-[#C4B5FD]/20">
                      {form.thumbnail ? (
                        <img src={form.thumbnail} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <p className="text-[#7c6b9e] text-xs">No image selected</p>
                      )}
                    </div>
                    <label className="cursor-pointer block">
                      <div className="bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 hover:border-[#6D28D9] rounded-xl px-4 py-2.5 text-[#7c6b9e] text-xs text-center transition-all">
                        {uploading ? "Uploading..." : "Upload New Image"}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} disabled={uploading} />
                    </label>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[#C4B5FD] text-[10px] uppercase tracking-widest mb-2 font-bold">Title *</label>
                    <input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      placeholder="Enter project title"
                    />
                  </div>

                  {/* Category & Order */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#C4B5FD] text-[10px] uppercase tracking-widest mb-2 font-bold">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full bg-[#130826] border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#C4B5FD] text-[10px] uppercase tracking-widest mb-2 font-bold">Order</label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                        className="w-full bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3 text-[#F5F3FF] outline-none focus:border-[#6D28D9] transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[#C4B5FD] text-[10px] uppercase tracking-widest mb-2 font-bold">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                        className="flex-1 bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-2.5 text-[#F5F3FF] text-sm outline-none focus:border-[#6D28D9]"
                        placeholder="Add tag..."
                      />
                      <button onClick={addTag} className="bg-[#6D28D9] px-4 rounded-xl text-xs text-white">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-2 text-[10px] bg-[#6D28D9]/20 text-[#C4B5FD] px-3 py-1 rounded-full">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-400">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#F5F3FF]/5 border border-[#C4B5FD]/20 rounded-xl px-4 py-3">
                    <span className="text-[#F5F3FF] text-sm">Mark as Featured</span>
                    <button
                      onClick={() => setForm((p) => ({ ...p, featured: !p.featured }))}
                      className={`w-10 h-5 rounded-full relative transition-colors ${form.featured ? "bg-[#6D28D9]" : "bg-gray-700"}`}
                    >
                      <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${form.featured ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setModalOpen(false)} className="flex-1 text-[#7c6b9e] py-3 text-sm">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={saving || uploading || !form.title.trim()}
                    className="flex-1 bg-[#6D28D9] text-white py-3 rounded-xl text-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Project"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation remains similar but with fixed Z-index and backdrop */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-[#130826] border border-red-500/20 rounded-2xl p-6 w-full max-w-sm pointer-events-auto">
                <h2 className="text-lg text-[#F5F3FF] mb-2 font-bold">Delete Project?</h2>
                <p className="text-[#7c6b9e] text-sm mb-6">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(null)} className="flex-1 text-[#7c6b9e] text-sm">Cancel</button>
                  <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 bg-red-500/20 text-red-400 py-2.5 rounded-xl text-sm">
                    {deleteId ? "Deleting..." : "Delete"}
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