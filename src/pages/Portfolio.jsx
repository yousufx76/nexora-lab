import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const categories = ['All', 'Web Development', 'Graphic Design', 'UI / UX Design', 'Digital Marketing', 'Server Security']

const placeholderGradients = [
  'linear-gradient(135deg, #6D28D9 0%, #a855f7 100%)',
  'linear-gradient(135deg, #1a0a3d 0%, #6D28D9 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #C4B5FD 100%)',
  'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)',
  'linear-gradient(135deg, #6D28D9 0%, #1a0a3d 100%)',
  'linear-gradient(135deg, #a855f7 0%, #4f46e5 100%)',
]

function ProjectModal({ project, index, onClose }) {
  if (!project) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#1a0a3d]/70 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl shadow-[#6D28D9]/25"
        >
          {/* Thumbnail */}
          <div
            className="h-56 rounded-t-3xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: project.thumbnail
                ? `url(${project.thumbnail}) center/cover`
                : placeholderGradients[index % placeholderGradients.length]
            }}
          >
            <div className="absolute inset-0 bg-[#1a0a3d]/20" />
            {!project.thumbnail && (
              <div className="relative z-10 text-center">
                <div className="font-['Clash_Display'] font-bold text-white text-3xl tracking-wider opacity-40">
                  {project.title?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4)}
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-20"
            >✕</button>
            <span className="absolute bottom-4 left-4 text-xs font-semibold tracking-widest uppercase text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full z-20">
              {project.category}
            </span>
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="font-['Clash_Display'] font-bold text-2xl text-[#1a0a3d] mb-3">
              {project.title}
            </h2>
            <p className="text-sm text-[#7c6b9e] leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="font-['Clash_Display'] font-semibold text-xs text-[#7c6b9e] uppercase tracking-widest mb-3">
                Tech / Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {(project.tags || []).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#F5F3FF] text-[#6D28D9] border border-[#C4B5FD]/40 px-3 py-1.5 rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#6D28D9] hover:bg-[#5b21b6] text-white text-sm font-medium py-3 rounded-xl text-center transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30 font-['Clash_Display']"
                >
                  View Live →
                </a>
              )}
              <button
                onClick={onClose}
                className="flex-1 border-2 border-[#6D28D9] text-[#6D28D9] text-sm font-medium py-3 rounded-xl hover:bg-[#6D28D9] hover:text-white transition-all duration-200 font-['Clash_Display']"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function Portfolio() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'portfolio'), orderBy('order'))
        const snap = await getDocs(q)
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Error fetching projects:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter)

  return (
    <main className="min-h-screen pt-24">
      {/* PAGE HERO */}
      <section className="bg-[#F5F3FF] py-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-[400px] h-[400px] bg-[#6D28D9] rounded-full opacity-10 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-4">
              <span className="w-6 h-px bg-[#6D28D9] inline-block" />
              Our Work
            </span>
            <h1 className="font-['Clash_Display'] font-bold text-5xl md:text-6xl text-[#1a0a3d] leading-tight mb-4">
              Projects That<br />
              <span className="text-[#6D28D9]">Speak for Themselves</span>
            </h1>
            <p className="text-[#7c6b9e] text-lg max-w-xl leading-relaxed">
              A curated selection of our finest work — from brand identities to full-stack applications.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="bg-white border-b border-[#C4B5FD]/20 px-6 py-5 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                activeFilter === cat
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-[#6D28D9]/30'
                  : 'bg-[#F5F3FF] text-[#7c6b9e] hover:bg-[#6D28D9]/10 hover:text-[#6D28D9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-[#F5F3FF]" />
                  <div className="p-5 border border-[#C4B5FD]/20 rounded-b-3xl">
                    <div className="h-4 bg-[#F5F3FF] rounded-full w-3/4 mb-3" />
                    <div className="h-3 bg-[#F5F3FF] rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="font-['Clash_Display'] font-bold text-xl text-[#1a0a3d] mb-2">No projects here yet</h3>
              <p className="text-[#7c6b9e] text-sm">Nothing in this category yet — check back soon.</p>
              <button
                onClick={() => setActiveFilter('All')}
                className="mt-6 bg-[#6D28D9] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#5b21b6] transition-all"
              >
                View All Projects
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm text-[#7c6b9e]">
                  Showing <span className="text-[#6D28D9] font-semibold">{filtered.length}</span> project{filtered.length !== 1 ? 's' : ''}
                  {activeFilter !== 'All' && ` in ${activeFilter}`}
                </p>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((project, i) => (
                    <motion.div
                      layout
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => { setSelectedProject(project); setSelectedIndex(i) }}
                      className="group rounded-3xl overflow-hidden border border-[#C4B5FD]/20 hover:border-[#6D28D9]/30 hover:shadow-xl hover:shadow-[#6D28D9]/10 transition-all duration-300 cursor-pointer bg-white"
                    >
                      <div
                        className="h-52 relative overflow-hidden"
                        style={{
                          background: project.thumbnail
                            ? `url(${project.thumbnail}) center/cover`
                            : placeholderGradients[i % placeholderGradients.length]
                        }}
                      >
                        <div className="absolute inset-0 bg-[#1a0a3d]/10 group-hover:bg-[#1a0a3d]/30 transition-all duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-4 py-2 rounded-full">
                            View Project →
                          </div>
                        </div>
                        {!project.thumbnail && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-['Clash_Display'] font-bold text-white/20 text-5xl tracking-widest">
                              {project.title?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3)}
                            </span>
                          </div>
                        )}
                        {project.featured && (
                          <span className="absolute top-4 left-4 text-[10px] font-semibold tracking-widest uppercase text-white bg-[#6D28D9] px-3 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        <span className="absolute bottom-4 right-4 text-[10px] font-semibold tracking-widest uppercase text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          {project.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <h3 className="font-['Clash_Display'] font-bold text-lg text-[#1a0a3d] group-hover:text-[#6D28D9] transition-colors mb-2">
                          {project.title}
                        </h3>
                        <p className="text-xs text-[#7c6b9e] leading-relaxed line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(project.tags || []).slice(0, 3).map((tag, j) => (
                            <span key={j} className="text-[10px] bg-[#F5F3FF] text-[#6D28D9] px-2.5 py-1 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                          {(project.tags || []).length > 3 && (
                            <span className="text-[10px] bg-[#F5F3FF] text-[#7c6b9e] px-2.5 py-1 rounded-full">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            index={selectedIndex}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}