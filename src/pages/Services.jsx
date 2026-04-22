import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE = 'service_jlnzgop'
const EMAILJS_TEMPLATE = 'template_jhycdtd'
const EMAILJS_KEY = 'V02WaCYB7gx5MRSM0'

const services = [
  {
    tag: 'Creative',
    title: 'Graphic Design',
    department: 'design',
    desc: 'From brand identities to marketing materials — we craft visuals that communicate, convert, and leave a lasting impression.',
    longDesc: 'Our graphic design team blends strategy with aesthetics to create visuals that truly represent your brand. Whether you need a complete rebrand or a single asset — we deliver work that stands out in any market.',
    features: ['Logo & Brand Identity', 'Social Media Graphics', 'Print & Packaging', 'Illustration & Icons'],
    deliverables: ['Source files (AI/PSD)', 'Export-ready assets', 'Brand guidelines PDF', 'Unlimited revisions'],
    timeline: '3–7 business days',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><circle cx="17.5" cy="17.5" r="3.5" />
      </svg>
    ),
  },
  {
    tag: 'Design',
    title: 'UI / UX Design',
    department: 'design',
    desc: 'Research-driven interfaces that are intuitive, beautiful, and conversion-optimized for real users.',
    longDesc: 'We design digital experiences that feel effortless. Through research, wireframes, and high-fidelity prototypes — we turn complex problems into clean, elegant interfaces your users will love.',
    features: ['User Research & Wireframing', 'Figma Prototyping', 'Design Systems', 'Usability Testing'],
    deliverables: ['Figma source file', 'Clickable prototype', 'Component library', 'Handoff documentation'],
    timeline: '5–14 business days',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    tag: 'Tech',
    title: 'Web Development',
    department: 'development',
    desc: 'Fast, responsive, modern websites built to perform — from landing pages to full-stack applications.',
    longDesc: 'We build clean, scalable, and high-performance websites using modern technologies. Every project is mobile-first, SEO-ready, and built to grow with your business.',
    features: ['React / Next.js Apps', 'Landing Pages', 'E-Commerce', 'CMS Integration'],
    deliverables: ['Full source code', 'Deployment setup', 'Mobile responsive', 'SEO optimized'],
    timeline: '7–21 business days',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    tag: 'Growth',
    title: 'Digital Marketing',
    department: 'marketing',
    desc: 'SEO, social media, ad campaigns and content strategies that grow traffic and drive real ROI.',
    longDesc: 'Strategy-first marketing that actually moves the needle. We grow your audience, increase conversions, and make your brand impossible to ignore — across every channel that matters.',
    features: ['SEO & Content Strategy', 'Social Media Management', 'Paid Ads (Meta / Google)', 'Analytics & Reporting'],
    deliverables: ['Monthly strategy report', 'Content calendar', 'Ad creatives', 'Performance dashboard'],
    timeline: 'Ongoing / Monthly',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    tag: 'Security',
    title: 'Server Security',
    department: 'security',
    desc: 'Enterprise-grade protection, penetration testing, and hardened infrastructure for peace of mind.',
    longDesc: 'We harden your infrastructure against modern threats. From penetration testing to real-time monitoring — your servers, data, and users stay protected around the clock.',
    features: ['Penetration Testing', 'Server Hardening', 'SSL & Firewall Setup', 'Real-time Monitoring'],
    deliverables: ['Security audit report', 'Vulnerability fixes', 'Monitoring dashboard', '24/7 alert system'],
    timeline: '3–10 business days',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    tag: 'Education',
    title: 'IT Trending Center',
    department: 'training',
    desc: 'Hands-on training and mentoring programs for the next generation of tech professionals.',
    longDesc: 'Learn what\'s actually in demand — from real practitioners. Our training programs are hands-on, project-based, and designed to get you job-ready or freelance-ready fast.',
    features: ['Web Development Bootcamp', 'Design Fundamentals', 'Cybersecurity Basics', '1-on-1 Mentoring'],
    deliverables: ['Course certificate', 'Project portfolio', 'Resource library', 'Mentor access'],
    timeline: '4–12 weeks',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Services() {
  const [selectedService, setSelectedService] = useState(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', budget: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleOrder = async () => {
    if (!form.name || !form.email) { setStatus('error'); return }
    setStatus('sending')
    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: form.name,
          from_email: form.email,
          service: selectedService?.title,
          budget: form.budget,
          message: form.message,
        },
        EMAILJS_KEY
      )
      await addDoc(collection(db, 'service_requests'), {
        ...form,
        service: selectedService?.title,
        createdAt: serverTimestamp(),
        status: 'new',
      })
      setStatus('sent')
      setForm({ name: '', email: '', budget: '', message: '' })
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const openModal = (service) => {
    setSelectedService(service)
    setShowOrderForm(false)
    setStatus(null)
    setForm({ name: '', email: '', budget: '', message: '' })
  }

  const closeModal = () => {
    setSelectedService(null)
    setShowOrderForm(false)
    setStatus(null)
  }

  return (
    <main className="min-h-screen pt-24">

      {/* ───── PAGE HERO ───── */}
      <section className="bg-[#F5F3FF] py-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-40px] w-[400px] h-[400px] bg-[#6D28D9] rounded-full opacity-10 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-4">
              <span className="w-6 h-px bg-[#6D28D9] inline-block" />
              What We Offer
            </span>
            <h1 className="font-['Clash_Display'] font-bold text-5xl md:text-6xl text-[#1a0a3d] leading-tight mb-4">
              Services That<br />
              <span className="text-[#6D28D9]">Drive Results</span>
            </h1>
            <p className="text-[#7c6b9e] text-lg max-w-xl leading-relaxed">
              Six core disciplines. One studio. Click any service to explore details and place an order.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───── SERVICES GRID ───── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              onClick={() => openModal(service)}
              className="group bg-[#F5F3FF] hover:bg-[#6D28D9] rounded-2xl p-8 border border-[#C4B5FD]/30 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-[#5b21b6] flex items-center justify-center text-[#6D28D9] group-hover:text-[#C4B5FD] transition-all duration-300 flex-shrink-0">
                  {service.icon}
                </div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[#6D28D9] group-hover:text-[#C4B5FD] bg-white group-hover:bg-[#5b21b6] px-3 py-1 rounded-full transition-all duration-300">
                  {service.tag}
                </span>
              </div>
              <h2 className="font-['Clash_Display'] font-bold text-2xl text-[#1a0a3d] group-hover:text-white mb-3 transition-colors duration-300">
                {service.title}
              </h2>
              <p className="text-sm text-[#7c6b9e] group-hover:text-[#C4B5FD] leading-relaxed mb-6 transition-colors duration-300">
                {service.desc}
              </p>
              <ul className="flex flex-col gap-2 mb-6">
                {service.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-[#7c6b9e] group-hover:text-white/80 transition-colors duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] group-hover:bg-[#C4B5FD] flex-shrink-0 transition-colors duration-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="text-sm font-medium text-[#6D28D9] group-hover:text-[#C4B5FD] transition-colors duration-300">
                Click to explore & order →
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── MODAL ───── */}
      <AnimatePresence>
        {selectedService && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-[#1a0a3d]/60 backdrop-blur-sm z-50"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl shadow-[#6D28D9]/20"
              >
                {/* Modal Header */}
                <div className="bg-[#6D28D9] rounded-t-3xl p-8 relative">
                  <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      {selectedService.icon}
                    </div>
                    <span className="text-xs font-semibold tracking-widest uppercase text-[#C4B5FD]">
                      {selectedService.tag}
                    </span>
                  </div>
                  <h2 className="font-['Clash_Display'] font-bold text-3xl text-white mb-2">
                    {selectedService.title}
                  </h2>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {selectedService.longDesc}
                  </p>
                </div>

                {/* Modal Body */}
                <div className="p-8">
                  {!showOrderForm ? (
                    <>
                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h3 className="font-['Clash_Display'] font-semibold text-sm text-[#7c6b9e] uppercase tracking-widest mb-3">
                            What's Included
                          </h3>
                          <ul className="flex flex-col gap-2">
                            {selectedService.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#1a0a3d]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-['Clash_Display'] font-semibold text-sm text-[#7c6b9e] uppercase tracking-widest mb-3">
                            Deliverables
                          </h3>
                          <ul className="flex flex-col gap-2">
                            {selectedService.deliverables.map((d, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#1a0a3d]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] flex-shrink-0" />
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="bg-[#F5F3FF] rounded-2xl px-5 py-4 flex items-center justify-between mb-8">
                        <span className="text-sm text-[#7c6b9e]">Estimated Timeline</span>
                        <span className="font-['Clash_Display'] font-semibold text-[#6D28D9]">
                          {selectedService.timeline}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            closeModal()
                            window.location.href = `/team?dept=${selectedService.department}`
                          }}
                          className="flex-1 border-2 border-[#6D28D9] text-[#6D28D9] py-3 rounded-xl text-sm font-medium hover:bg-[#6D28D9] hover:text-white transition-all duration-200 font-['Clash_Display']"
                        >
                          Meet the Team →
                        </button>
                        <button
                          onClick={() => setShowOrderForm(true)}
                          className="flex-1 bg-[#6D28D9] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#5b21b6] transition-all duration-200 font-['Clash_Display']"
                        >
                          Order This Service →
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Order Form */}
                      <button
                        onClick={() => { setShowOrderForm(false); setStatus(null) }}
                        className="flex items-center gap-1 text-xs text-[#7c6b9e] hover:text-[#6D28D9] mb-6 transition-colors"
                      >
                        ← Back to details
                      </button>

                      <h3 className="font-['Clash_Display'] font-bold text-xl text-[#1a0a3d] mb-6">
                        Order — {selectedService.title}
                      </h3>

                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">Your Name</label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              placeholder="Yousuf Hasan"
                              className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="you@example.com"
                              className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">Budget Range</label>
                          <select
                            name="budget"
                            value={form.budget}
                            onChange={handleChange}
                            className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] outline-none transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Select budget...</option>
                            <option>Under $500</option>
                            <option>$500 - $1,000</option>
                            <option>$1,000 - $3,000</option>
                            <option>$3,000 - $5,000</option>
                            <option>$5,000+</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">Project Details</label>
                          <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Tell us about your project, goals, timeline..."
                            className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors resize-none"
                          />
                        </div>

                        <button
                          onClick={handleOrder}
                          disabled={status === 'sending' || status === 'sent'}
                          className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-medium py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30 disabled:opacity-60 font-['Clash_Display']"
                        >
                          {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Order Sent!' : 'Send Order'}
                        </button>

                        {status === 'error' && (
                          <p className="text-red-500 text-xs text-center">Please fill in your name and email.</p>
                        )}
                        {status === 'sent' && (
                          <p className="text-[#6D28D9] text-xs text-center">
                            Order received! We'll contact you within 24 hours. 🔥
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </main>
  )
}