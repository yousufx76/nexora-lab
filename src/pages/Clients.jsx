import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

// Sub-component for the Modal
function ClientModal({ client, onClose }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#1a0a3d]/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-6 pointer-events-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl w-full max-w-md shadow-2xl shadow-[#6D28D9]/20 pointer-events-auto overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#6D28D9] to-[#a855f7] px-7 py-8 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-colors"
            >✕</button>

            {/* Logo or initials */}
            <div className="mb-4">
              {client.logo ? (
                <img
                  src={client.logo}
                  alt={client.name}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold font-['Clash_Display'] border-4 border-white/10">
                  {client.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="font-['Clash_Display'] font-bold text-2xl text-white mb-1">
              {client.name}
            </h2>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-white bg-white/20 px-3 py-1 rounded-full">
              {client.industry}
            </span>
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            <p className="text-sm text-[#7c6b9e] leading-relaxed mb-6">
              {client.description || 'A valued client of Nexora Lab.'}
            </p>

            {client.website && (
              <a
                href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#6D28D9] hover:underline mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round"/>
                </svg>
                {client.website.replace(/^https?:\/\//, '')}
              </a>
            )}

            <button
              onClick={onClose}
              className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white py-3 rounded-xl text-sm font-medium transition-all duration-200 font-['Clash_Display']"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

const industries = ['All', 'Technology', 'Education', 'E-Commerce', 'Healthcare', 'Finance', 'Creative', 'Other']
const industryIcons = {
  Technology: '💻', Education: '📚', 'E-Commerce': '🛒',
  Healthcare: '🏥', Finance: '💰', Creative: '🎨', Other: '🌐',
}

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedClient, setSelectedClient] = useState(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(collection(db, 'clients'), orderBy('name'))
        const snap = await getDocs(q)
        setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Error fetching clients:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedClient) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [selectedClient])

  const filtered = activeFilter === 'All'
    ? clients
    : clients.filter((c) => c.industry === activeFilter)

  return (
    <main className="min-h-screen pt-24">
      {/* ───── PAGE HERO ───── */}
      <section className="bg-[#F5F3FF] py-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-[400px] h-[400px] bg-[#6D28D9] rounded-full opacity-10 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-4">
              <span className="w-6 h-px bg-[#6D28D9] inline-block" />
              Who We've Worked With
            </span>
            <h1 className="font-['Clash_Display'] font-bold text-5xl md:text-6xl text-[#1a0a3d] leading-tight mb-4">
              Clients Who<br />
              <span className="text-[#6D28D9]">Trust Us</span>
            </h1>
            <p className="text-[#7c6b9e] text-lg max-w-xl leading-relaxed">
              From startups to established brands — we've helped businesses across industries build their digital presence.
            </p>

            <div className="flex gap-8 mt-8 pt-8 border-t border-[#6D28D9]/15">
              <div>
                <div className="font-['Clash_Display'] font-bold text-3xl text-[#6D28D9]">
                  {loading ? '—' : `${clients.length}+`}
                </div>
                <div className="text-xs text-[#7c6b9e] mt-1">Total Clients</div>
              </div>
              <div>
                <div className="font-['Clash_Display'] font-bold text-3xl text-[#6D28D9]">
                  {loading ? '—' : clients.filter(c => c.featured).length}
                </div>
                <div className="text-xs text-[#7c6b9e] mt-1">Featured Partners</div>
              </div>
              <div>
                <div className="font-['Clash_Display'] font-bold text-3xl text-[#6D28D9]">
                  {loading ? '—' : [...new Set(clients.map(c => c.industry))].length}
                </div>
                <div className="text-xs text-[#7c6b9e] mt-1">Industries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── FILTER BAR ───── */}
      <section className="bg-white border-b border-[#C4B5FD]/20 px-6 py-5 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setActiveFilter(ind)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                activeFilter === ind
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-[#6D28D9]/30'
                  : 'bg-[#F5F3FF] text-[#7c6b9e] hover:bg-[#6D28D9]/10 hover:text-[#6D28D9]'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </section>

      {/* ───── CLIENTS GRID ───── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((_, i) => (
                <div key={i} className="h-40 bg-[#F5F3FF] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-['Clash_Display'] font-bold text-xl text-[#1a0a3d] mb-2">
                No clients in this industry yet
              </h3>
              <p className="text-[#7c6b9e] text-sm">Check back soon — we're always growing.</p>
              <button
                onClick={() => setActiveFilter('All')}
                className="mt-6 bg-[#6D28D9] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#5b21b6] transition-all"
              >
                View All Clients
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((client, i) => (
                  <motion.div
                    key={client.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    onClick={() => setSelectedClient(client)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-[#F5F3FF] hover:bg-[#6D28D9] border border-[#C4B5FD]/20 hover:border-[#6D28D9] rounded-2xl p-6 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {client.logo ? (
                        <img
                          src={client.logo}
                          alt={client.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[#C4B5FD]/20"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#6D28D9] group-hover:bg-white/20 flex items-center justify-center text-white text-xl font-bold font-['Clash_Display'] flex-shrink-0 transition-all duration-300">
                          {client.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-['Clash_Display'] font-bold text-[#1a0a3d] group-hover:text-white transition-colors duration-300">
                          {client.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm">{industryIcons[client.industry] || '🌐'}</span>
                          <span className="text-xs text-[#7c6b9e] group-hover:text-[#C4B5FD] transition-colors duration-300">
                            {client.industry}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#7c6b9e] group-hover:text-[#C4B5FD] leading-relaxed line-clamp-2 mb-4 transition-colors duration-300">
                      {client.description || 'A valued client of Nexora Lab.'}
                    </p>

                    <div className="flex items-center justify-between">
                      {client.featured && (
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#6D28D9] group-hover:text-[#C4B5FD] bg-white group-hover:bg-white/20 px-2.5 py-1 rounded-full transition-all duration-300">
                          ★ Featured
                        </span>
                      )}
                      <span className="ml-auto text-xs text-[#C4B5FD] group-hover:text-white transition-colors duration-300">
                        View details →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ───── MODAL ───── */}
      <AnimatePresence>
        {selectedClient && (
          <ClientModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}