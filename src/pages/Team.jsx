import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useSearchParams } from 'react-router-dom'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE = 'service_jlnzgop'
const EMAILJS_MEMBER_TEMPLATE = 'template_by9fmjq'
const EMAILJS_KEY = 'V02WaCYB7gx5MRSM0'

const departments = ['All', 'design', 'development', 'marketing', 'security', 'training']
const deptLabels = {
  All: 'All', design: 'Design', development: 'Development',
  marketing: 'Marketing', security: 'Security', training: 'Training',
}
const avatarColors = ['#6D28D9', '#a855f7', '#7c3aed', '#4f46e5', '#7c3aed', '#1a0a3d']

const maskEmail = (email) => {
  if (!email) return ''
  const [user, domain] = email.split('@')
  const masked = user.slice(0, 3) + '****'
  return `${masked}@${domain}`
}

const maskWhatsApp = (number) => {
  if (!number) return ''
  const str = number.toString()
  return str.slice(0, 5) + ' **** ' + str.slice(-3)
}

function FlipCard({ member, index, onDoubleClick }) {
  const [flipped, setFlipped] = useState(false)
  const [clicks, setClicks] = useState(0)

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleClick = () => {
    const newClicks = clicks + 1
    setClicks(newClicks)
    if (newClicks === 1) {
      setFlipped(true)
    } else if (newClicks >= 2) {
      setClicks(0)
      setFlipped(false)
      onDoubleClick(member)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="h-96 cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={handleClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden border border-[#C4B5FD]/30 bg-white shadow-md hover:shadow-xl hover:shadow-[#6D28D9]/10 transition-shadow duration-300"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="h-56 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #a855f7 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 rounded-full bg-white/5" />

            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white/30 shadow-xl relative z-10"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-2xl flex items-center justify-center text-white text-4xl font-bold font-['Clash_Display'] border-4 border-white/20 shadow-xl relative z-10"
                style={{ background: avatarColors[index % avatarColors.length] + '80' }}
              >
                {getInitials(member.name)}
              </div>
            )}
            <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-widest uppercase text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              {deptLabels[member.department] || member.department}
            </span>
          </div>

          <div className="p-5">
            <h3 className="font-['Clash_Display'] font-bold text-xl text-[#1a0a3d]">{member.name}</h3>
            <p className="text-sm text-[#7c6b9e] mt-1">{member.role}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {(member.skills || []).slice(0, 2).map((s, i) => (
                  <span key={i} className="text-[10px] bg-[#F5F3FF] text-[#6D28D9] px-2 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
                {(member.skills || []).length > 2 && (
                  <span className="text-[10px] bg-[#F5F3FF] text-[#7c6b9e] px-2 py-1 rounded-full">
                    +{member.skills.length - 2}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#C4B5FD] animate-pulse">click →</span>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-3xl bg-[#6D28D9] border border-[#5b21b6] shadow-xl flex flex-col justify-between p-7"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-['Clash_Display'] font-bold text-white text-xl">{member.name}</h3>
                <p className="text-[#C4B5FD] text-xs mt-0.5">{member.role}</p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold font-['Clash_Display'] text-lg border-2 border-white/20"
                style={{ background: avatarColors[index % avatarColors.length] + '60' }}
              >
                {getInitials(member.name)}
              </div>
            </div>
            <p className="text-white/75 text-sm leading-relaxed line-clamp-4">
              {member.bio || 'A passionate and dedicated member of the Nexora Lab team.'}
            </p>
          </div>

          <div>
            <p className="text-[#C4B5FD] text-[10px] uppercase tracking-widest mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {(member.skills || []).map((skill, i) => (
                <span key={i} className="text-[10px] font-medium bg-white/15 text-white px-2.5 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
            <div className="text-center text-[10px] text-white/40">
              Click again to view full profile
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MemberModal({ member, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [whatsappRevealing, setWhatsappRevealing] = useState(false)

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleWhatsAppClick = async () => {
    setWhatsappRevealing(true)
    try {
      await addDoc(collection(db, 'contact_logs'), {
        memberName: member.name,
        memberRole: member.role,
        action: 'whatsapp_click',
        createdAt: serverTimestamp(),
      })
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_MEMBER_TEMPLATE,
        {
          member_name: member.name,
          member_role: member.role,
          from_name: 'Anonymous Visitor',
          from_email: '—',
          contact_type: 'WhatsApp Click',
          message: `A visitor clicked the WhatsApp button for ${member.name} (${member.role}).`,
        },
        EMAILJS_KEY
      )
    } catch (err) {
      console.error(err)
    }
    setTimeout(() => {
      window.open(`https://wa.me/${member.whatsapp}?text=Hi%20${encodeURIComponent(member.name)}%2C%20I%20found%20you%20on%20Nexora%20Lab%20and%20would%20like%20to%20connect!`, '_blank')
    }, 300)
  }

  const handleSendMessage = async () => {
    if (!form.name || !form.email || !form.message) { setStatus('error'); return }
    setStatus('sending')
    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_MEMBER_TEMPLATE,
        {
          member_name: member.name,
          member_role: member.role,
          member_email: member.email,
          from_name: form.name,
          from_email: form.email,
          contact_type: 'Direct Email Message',
          message: form.message,
        },
        EMAILJS_KEY
      )
      await addDoc(collection(db, 'contact_logs'), {
        memberName: member.name,
        memberRole: member.role,
        fromName: form.name,
        fromEmail: form.email,
        message: form.message,
        action: 'email_contact',
        createdAt: serverTimestamp(),
      })
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

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
          className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl shadow-[#6D28D9]/25"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-br from-[#6D28D9] to-[#a855f7] rounded-t-3xl p-8 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors text-sm"
            >✕</button>

            <div className="flex items-center gap-4">
              {member.image ? (
                <img src={member.image} alt={member.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold font-['Clash_Display'] border-4 border-white/20">
                  {getInitials(member.name)}
                </div>
              )}
              <div>
                <h2 className="font-['Clash_Display'] font-bold text-2xl text-white">{member.name}</h2>
                <p className="text-[#C4B5FD] text-sm mt-0.5">{member.role}</p>
                <span className="inline-block mt-2 text-[10px] font-semibold tracking-widest uppercase text-white bg-white/20 px-3 py-1 rounded-full">
                  {deptLabels[member.department] || member.department}
                </span>
              </div>
            </div>
          </div>

          <div className="p-7">
            {/* Bio */}
            <div className="mb-6">
              <h3 className="font-['Clash_Display'] font-semibold text-xs text-[#7c6b9e] uppercase tracking-widest mb-2">About</h3>
              <p className="text-sm text-[#1a0a3d] leading-relaxed">
                {member.bio || 'A passionate and dedicated member of the Nexora Lab team.'}
              </p>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-['Clash_Display'] font-semibold text-xs text-[#7c6b9e] uppercase tracking-widest mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(member.skills || []).map((s, i) => (
                  <span key={i} className="text-xs bg-[#F5F3FF] text-[#6D28D9] border border-[#C4B5FD]/30 px-3 py-1.5 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-6 bg-[#F5F3FF] rounded-2xl p-5 flex flex-col gap-3">
              {member.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#1a0a3d]">
                    <svg className="w-4 h-4 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" strokeLinecap="round" />
                    </svg>
                    <span className="text-[#7c6b9e] text-xs">{maskEmail(member.email)}</span>
                  </div>
                </div>
              )}
              {member.whatsapp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span className="text-[#7c6b9e] text-xs">{maskWhatsApp(member.whatsapp)}</span>
                  </div>
                  <button
                    onClick={handleWhatsAppClick}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-full transition-colors font-medium"
                  >
                    {whatsappRevealing ? 'Opening...' : 'Chat on WhatsApp'}
                  </button>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="font-['Clash_Display'] font-semibold text-xs text-[#7c6b9e] uppercase tracking-widest mb-4">Send a Message</h3>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Your name"
                    className="bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-2.5 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                  />
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="Your email"
                    className="bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-2.5 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                  />
                </div>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  rows={3} placeholder="What would you like to discuss?"
                  className="bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-2.5 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors resize-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={status === 'sending' || status === 'sent'}
                  className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30 disabled:opacity-60 font-['Clash_Display'] text-sm"
                >
                  {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Message Sent!' : 'Send Message'}
                </button>
                {status === 'error' && <p className="text-red-500 text-xs text-center">Please fill in all fields.</p>}
                {status === 'sent' && <p className="text-[#6D28D9] text-xs text-center">Message delivered! They'll get back to you soon. 🔥</p>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const dept = searchParams.get('dept')
    if (dept) setActiveFilter(dept)
  }, [searchParams])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const q = query(collection(db, 'team'), orderBy('order'))
        const snap = await getDocs(q)
        setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [])

  const filtered = activeFilter === 'All'
    ? members
    : members.filter((m) => m.department === activeFilter)

  return (
    <main className="min-h-screen pt-24">

      {/* ───── PAGE HERO ───── */}
      <section className="bg-[#F5F3FF] py-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-[400px] h-[400px] bg-[#6D28D9] rounded-full opacity-10 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-4">
              <span className="w-6 h-px bg-[#6D28D9] inline-block" />
              The Minds Behind It
            </span>
            <h1 className="font-['Clash_Display'] font-bold text-5xl md:text-6xl text-[#1a0a3d] leading-tight mb-4">
              People Who Make<br />
              <span className="text-[#6D28D9]">It Happen</span>
            </h1>
            <p className="text-[#7c6b9e] text-lg max-w-xl leading-relaxed">
              Every great product starts with great people. Click any card once to flip, twice to view full profile.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───── FILTER BAR ───── */}
      <section className="bg-white border-b border-[#C4B5FD]/20 px-6 py-5 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveFilter(dept)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${activeFilter === dept
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-[#6D28D9]/30'
                  : 'bg-[#F5F3FF] text-[#7c6b9e] hover:bg-[#6D28D9]/10 hover:text-[#6D28D9]'
                }`}
            >
              {deptLabels[dept]}
            </button>
          ))}
        </div>
      </section>

      {/* ───── TEAM GRID ───── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="h-96 bg-[#F5F3FF] rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-['Clash_Display'] font-bold text-xl text-[#1a0a3d] mb-2">No members found</h3>
              <p className="text-[#7c6b9e] text-sm">No team members in this department yet.</p>
              <button
                onClick={() => setActiveFilter('All')}
                className="mt-6 bg-[#6D28D9] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#5b21b6] transition-all"
              >
                View All Members
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm text-[#7c6b9e]">
                  Showing <span className="text-[#6D28D9] font-semibold">{filtered.length}</span> member{filtered.length !== 1 ? 's' : ''}
                  {activeFilter !== 'All' && ` in ${deptLabels[activeFilter]}`}
                </p>
              </div>
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((member, i) => (
                    <FlipCard
                      key={member.id}
                      member={member}
                      index={i}
                      onDoubleClick={(m) => setSelectedMember(m)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {/* ───── MEMBER MODAL ───── */}
      <AnimatePresence>
        {selectedMember && (
          <MemberModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>

    </main>
  )
}