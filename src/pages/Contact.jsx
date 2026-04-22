import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE = 'service_jlnzgop'
const EMAILJS_TEMPLATE = 'template_jhycdtd'
const EMAILJS_KEY = 'V02WaCYB7gx5MRSM0'

const contactInfo = [
  {
    label: 'Email Us',
    value: 'xaninstudio@gmail.com',
    display: 'yousuf132465700@gmail.com',
    href: 'mailto:xaninstudio@gmail.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    value: 'https://wa.me/8801794078825',
    display: '+880 1794 ***825',
    href: 'https://wa.me/8801794078825',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
  },
  {
    label: 'Location',
    value: 'Savar, Dhaka, Bangladesh',
    display: 'Savar, Dhaka, Bangladesh',
    href: 'https://maps.google.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
]

const services = [
  'Graphic Design',
  'UI / UX Design',
  'Web Development',
  'Digital Marketing',
  'Server Security',
  'IT Training',
  'Other',
]

function FaqCard({ faq, index }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        viewport={{ once: true }}
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white hover:bg-[#6D28D9] rounded-2xl p-5 border border-[#C4B5FD]/20 hover:border-[#6D28D9] cursor-pointer group transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-['Clash_Display'] font-semibold text-sm text-[#1a0a3d] group-hover:text-white transition-colors duration-300 leading-snug">
            {faq.q}
          </h3>
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5F3FF] group-hover:bg-white/20 flex items-center justify-center text-[#6D28D9] group-hover:text-white text-xs transition-all duration-300">
            ?
          </span>
        </div>
        <p className="text-xs text-[#7c6b9e] group-hover:text-[#C4B5FD] mt-2 transition-colors duration-300">
          Click to read answer →
        </p>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-[#1a0a3d]/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl shadow-[#6D28D9]/20 pointer-events-auto overflow-hidden"
              >
                <div className="bg-[#6D28D9] px-7 py-6 relative">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-colors"
                  >
                    ✕
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold font-['Clash_Display'] mb-3">
                    ?
                  </div>
                  <h3 className="font-['Clash_Display'] font-bold text-white text-lg leading-snug pr-8">
                    {faq.q}
                  </h3>
                </div>

                <div className="px-7 py-6">
                  <p className="text-sm text-[#7c6b9e] leading-relaxed">
                    {faq.a}
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-6 w-full bg-[#F5F3FF] hover:bg-[#6D28D9] text-[#6D28D9] hover:text-white border border-[#C4B5FD]/30 hover:border-[#6D28D9] py-3 rounded-xl text-sm font-medium transition-all duration-200 font-['Clash_Display']"
                  >
                    Got it ✓
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', service: '', budget: '', message: ''
  })
  const [status, setStatus] = useState(null)

  const handleChange = (e) => {
    if (status === 'error') setStatus(null)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { 
      setStatus('error')
      return 
    }
    
    setStatus('sending')
    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          from_name: form.name,
          from_email: form.email,
          service: form.service || 'Not specified',
          budget: form.budget || 'Not specified',
          message: form.message,
        },
        EMAILJS_KEY
      )

      await addDoc(collection(db, 'contact_messages'), {
        ...form,
        createdAt: serverTimestamp(),
        status: 'new',
      })

      setStatus('sent')
      setForm({ name: '', email: '', service: '', budget: '', message: '' })
    } catch (err) {
      console.error("Form submission error:", err)
      setStatus('error')
    }
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
              Get In Touch
            </span>
            <h1 className="font-['Clash_Display'] font-bold text-5xl md:text-6xl text-[#1a0a3d] leading-tight mb-4">
              Let's Build Something<br />
              <span className="text-[#6D28D9]">Extraordinary</span>
            </h1>
            <p className="text-[#7c6b9e] text-lg max-w-xl leading-relaxed">
              Have a project in mind? We'd love to hear about it. Fill out the form or reach out directly — we respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───── MAIN CONTENT ───── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* ── LEFT — Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {contactInfo.map((info, i) => (
              <a
                key={i}
                href={info.href}
                target="_blank"
                rel="noreferrer"
                className="group bg-[#F5F3FF] hover:bg-[#6D28D9] border border-[#C4B5FD]/30 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-white group-hover:bg-[#5b21b6] flex items-center justify-center text-[#6D28D9] group-hover:text-[#C4B5FD] flex-shrink-0 transition-all duration-300">
                  {info.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-widest uppercase text-[#7c6b9e] group-hover:text-[#C4B5FD] mb-1 transition-colors duration-300">
                    {info.label}
                  </div>
                  <div className="text-sm font-medium text-[#1a0a3d] group-hover:text-white transition-colors duration-300">
                    {info.display}
                  </div>
                </div>
                <div className="ml-auto text-[#C4B5FD] group-hover:text-white transition-colors duration-300">
                  →
                </div>
              </a>
            ))}

            <div className="bg-[#6D28D9] rounded-2xl p-6 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#C4B5FD]">
                  Currently Available
                </span>
              </div>
              <h3 className="font-['Clash_Display'] font-bold text-white text-xl mb-2">
                We respond fast.
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Average response time is under 24 hours. For urgent projects, WhatsApp is the fastest way to reach us.
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT — Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-[#F5F3FF] rounded-3xl p-8 border border-[#C4B5FD]/30">
              <h2 className="font-['Clash_Display'] font-bold text-2xl text-[#1a0a3d] mb-6">
                Send Us a Message
              </h2>

              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                      Your Name *
                    </label>
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      placeholder="Yousuf Hasan"
                      className="w-full bg-white border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-white border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                      Service Needed
                    </label>
                    <select
                      name="service" value={form.service} onChange={handleChange}
                      className="w-full bg-white border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select a service...</option>
                      {services.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                      Budget Range
                    </label>
                    <select
                      name="budget" value={form.budget} onChange={handleChange}
                      className="w-full bg-white border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select budget...</option>
                      <option value="Under $500">Under $500</option>
                      <option value="$500 - $1,000">$500 - $1,000</option>
                      <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                      <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                      <option value="$5,000+">$5,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                    Your Message *
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your project..."
                    className="w-full bg-white border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={status === 'sending' || status === 'sent'}
                  className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-medium py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30 disabled:opacity-60 disabled:cursor-not-allowed font-['Clash_Display'] text-sm tracking-wide"
                >
                  {status === 'sending' ? 'Sending...'
                    : status === 'sent' ? '✓ Message Sent!'
                    : 'Send Message →'}
                </button>

                {status === 'error' && (
                  <p className="text-red-500 text-xs text-center">
                    Oops! Please fill in all required fields.
                  </p>
                )}
                {status === 'sent' && (
                  <p className="text-[#6D28D9] text-xs text-center">
                    We got your message! Expect a reply within 24 hours. 🔥
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ STRIP ───── */}
      <section className="bg-[#F5F3FF] py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-4">
              <span className="w-6 h-px bg-[#6D28D9] inline-block" />
              Quick Answers
            </span>
            <h2 className="font-['Clash_Display'] font-bold text-3xl text-[#1a0a3d] mb-8">
              Common Questions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  q: 'How fast do you respond?',
                  a: 'We typically respond within 24 hours on business days. For urgent matters, WhatsApp is the fastest way to reach us directly.',
                },
                {
                  q: 'Do you work with international clients?',
                  a: 'Absolutely. We work with clients globally across different timezones. Distance is never a barrier to great work.',
                },
                {
                  q: 'How do payments work?',
                  a: 'We accept bank transfers, mobile banking (bKash/Nagad), and international payments. Our standard terms are 50% upfront and 50% on delivery.',
                },
                {
                  q: 'Can I request revisions?',
                  a: 'Yes — all our packages include revision rounds. We keep working until you are fully satisfied with the result.',
                },
                {
                  q: 'How long does a project take?',
                  a: 'It depends on the scope. A logo takes 3–7 days, a full website 2–4 weeks, and ongoing services run monthly. We always give you a timeline upfront.',
                },
                {
                  q: 'Do you sign NDAs?',
                  a: 'Yes, we are happy to sign NDAs before any project discussion. Your ideas and business information are always kept confidential.',
                },
                {
                  q: 'Can I hire a specific team member?',
                  a: 'You can visit our Team page and contact any member directly. All direct contacts are coordinated through the main studio to ensure quality.',
                },
                {
                  q: 'What if I am not satisfied?',
                  a: 'We have a satisfaction guarantee. If we cannot meet your expectations after revision rounds, we will discuss a fair resolution — including partial refunds where applicable.',
                },
              ].map((faq, i) => (
                <FaqCard key={i} faq={faq} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}