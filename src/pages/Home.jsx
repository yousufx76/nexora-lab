import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '../firebase'
import Marquee from '../components/Marquee'
// import { Link } from 'react-router-dom'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: 'easeOut' },
  }),
}

export default function Home() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ activeProjects: 0, clientCount: 0, avgRating: 0 })
  const [teamAvatars, setTeamAvatars] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Agency stats
        const statsRef = doc(db, 'agency_stats', 'main')
        const statsSnap = await getDoc(statsRef)
        const activeProjects = statsSnap.exists() ? statsSnap.data().activeProjects || 0 : 0

        // Client count
        const clientsSnap = await getDocs(collection(db, 'clients'))
        const clientCount = clientsSnap.size

        // Avg rating
        const reviewsSnap = await getDocs(collection(db, 'reviews'))
        let total = 0, count = 0
        reviewsSnap.forEach(d => {
          const r = d.data()
          if (r.approved && r.rating) { total += r.rating; count++ }
        })
        const avgRating = count > 0 ? ((total / count / 5) * 100).toFixed(0) : 0

        // Team avatars (Featured members, ordered by order field)
        const teamQuery = query(
          collection(db, 'team'),
          where('featured', '==', true),
          orderBy('order')
        )
        const teamSnap = await getDocs(teamQuery)
        const avatars = teamSnap.docs.map(d => ({
          id: d.id,
          name: d.data().name || '',
          image: d.data().image || '',
        }))

        setStats({ activeProjects, clientCount, avgRating })
        setTeamAvatars(avatars)
      } catch (err) {
        console.error('Firebase fetch error:', err)
      }
    }
    fetchData()
  }, [])

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const avatarColors = ['#6D28D9', '#a855f7', '#7c3aed', '#1a0a3d']

  return (
    <main className="min-h-screen">

      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#F5F3FF] pt-24 pb-16 px-6">

        {/* Blobs */}
        <div className="absolute top-[-80px] right-[-60px] w-[500px] h-[500px] bg-[#6D28D9] rounded-full opacity-[0.15] blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[5%] w-[380px] h-[380px] bg-[#C4B5FD] rounded-full opacity-25 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">

          {/* ── LEFT ── */}
          <div>
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={0}
              className="inline-flex items-center gap-2 bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20 rounded-full px-4 py-1.5 text-xs font-medium tracking-widest uppercase mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9] inline-block animate-pulse" />
              Creative IT Agency
            </motion.div>

            <motion.h1
              variants={fadeUp} initial="hidden" animate="show" custom={1}
              className="font-['Clash_Display'] font-bold text-[#1a0a3d] leading-[1.05] text-5xl md:text-6xl lg:text-7xl mb-6"
            >
              We Build<br />
              <span className="text-[#6D28D9]">Digital</span><br />
              Empires.
            </motion.h1>

            <motion.p
              variants={fadeUp} initial="hidden" animate="show" custom={2}
              className="text-[#7c6b9e] text-lg leading-relaxed max-w-md mb-8"
            >
              Nexora Lab is a full-service creative and tech studio — designing, building, and securing your digital presence from the ground up.
            </motion.p>

            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={3}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/contact"
                className="bg-[#6D28D9] text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-[#5b21b6] hover:shadow-lg hover:shadow-[#6D28D9]/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start a Project
              </Link>
              <Link
                to="/portfolio"
                className="border-2 border-[#6D28D9] text-[#6D28D9] px-7 py-3.5 rounded-full text-sm font-medium hover:bg-[#6D28D9] hover:text-white transition-all duration-200"
              >
                See Our Work
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={4}
              className="flex gap-10 mt-12 pt-8 border-t border-[#6D28D9]/15"
            >
              {[
                { num: '120+', label: 'Projects Done' },
                { num: `${stats.clientCount || '—'}`, label: 'Happy Clients' },
                { num: '5+', label: 'Years of Craft' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="font-['Clash_Display'] font-bold text-3xl text-[#6D28D9]">{s.num}</div>
                  <div className="text-xs text-[#7c6b9e] mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── RIGHT — Live Cards ── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            className="hidden md:flex flex-col gap-4 items-end"
          >

            {/* Active Projects — static */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-[#6D28D9]/10 border border-[#C4B5FD]/30 w-full max-w-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-medium text-[#7c6b9e]">Active Projects</div>
                  <div className="font-['Clash_Display'] font-bold text-2xl text-[#6D28D9]">
                    {stats.activeProjects || '—'}
                  </div>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F5F3FF]">
                <div className="h-2 rounded-full bg-[#6D28D9] w-[72%] transition-all" />
              </div>
              <div className="text-xs text-[#7c6b9e] mt-1.5">72% on schedule</div>
            </div>

            {/* Clients + Satisfaction — clickable */}
            <div className="flex gap-4 w-full max-w-sm">
              <motion.div
                onClick={() => navigate('/clients')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 bg-[#6D28D9] rounded-2xl p-4 text-white cursor-pointer"
              >
                <div className="text-xs opacity-70 mb-1">Our Clients</div>
                <div className="font-['Clash_Display'] font-bold text-2xl">
                  {stats.clientCount > 0 ? `${stats.clientCount}+` : '—'}
                </div>
                <div className="text-xs opacity-60 mt-1">tap to explore →</div>
              </motion.div>

              <motion.div
                onClick={() => navigate('/reviews')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 bg-white rounded-2xl p-4 border border-[#C4B5FD]/40 shadow-lg shadow-[#6D28D9]/10 cursor-pointer"
              >
                <div className="text-xs text-[#7c6b9e] mb-1">Satisfaction</div>
                <div className="font-['Clash_Display'] font-bold text-2xl text-[#6D28D9]">
                  {stats.avgRating > 0 ? `${stats.avgRating}%` : '—'}
                </div>
                <div className="text-xs text-[#7c6b9e] mt-1">tap to view →</div>
              </motion.div>
            </div>

            {/* Team card — clickable, real avatars */}
            <motion.div
              onClick={() => navigate('/team')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white rounded-2xl px-5 py-4 border border-[#C4B5FD]/30 shadow-lg shadow-[#6D28D9]/10 w-full max-w-sm flex items-center justify-between cursor-pointer group"
            >
              <div>
                <div className="text-xs text-[#7c6b9e]">The Minds Behind It</div>
                <div className="text-sm font-semibold text-[#1a0a3d] mt-0.5 group-hover:text-[#6D28D9] transition-colors">
                  Meet the team →
                </div>
              </div>
              <div className="flex -space-x-2">
                {teamAvatars.length > 0
                  ? teamAvatars.map((member, i) => (
                    member.image
                      ? <img
                        key={member.id}
                        src={member.image}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      />
                      : <div
                        key={member.id}
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: avatarColors[i % avatarColors.length] }}
                      >
                        {getInitials(member.name)}
                      </div>
                  ))
                  : avatarColors.map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: c }}
                    >
                      {'NLAB'[i]}
                    </div>
                  ))
                }
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>
      <Marquee />
      {/* ───── SERVICES PREVIEW ───── */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-3">
                <span className="w-6 h-px bg-[#6D28D9] inline-block" />
                What We Do
              </span>
              <h2 className="font-['Clash_Display'] font-bold text-4xl md:text-5xl text-[#1a0a3d] leading-tight">
                Services Built for<br />
                <span className="text-[#6D28D9]">Modern Brands</span>
              </h2>
            </div>
            <Link
              to="/services"
              className="self-start md:self-auto border-2 border-[#6D28D9] text-[#6D28D9] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#6D28D9] hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              All Services →
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><circle cx="17.5" cy="17.5" r="3.5" />
                  </svg>
                ),
                title: 'Graphic Design',
                desc: 'Visual identities, branding, and print-ready assets that make your brand unforgettable.',
                tag: 'Creative',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                  </svg>
                ),
                title: 'UI / UX Design',
                desc: 'Research-driven interfaces that are intuitive, beautiful, and conversion-optimized.',
                tag: 'Design',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                ),
                title: 'Web Development',
                desc: 'Fast, responsive, modern websites built to perform — from landing pages to full-stack apps.',
                tag: 'Tech',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Digital Marketing',
                desc: 'SEO, social media, ad campaigns and content strategies that grow traffic and drive real ROI.',
                tag: 'Growth',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Server Security',
                desc: 'Enterprise-grade protection, penetration testing, and hardened infrastructure for peace of mind.',
                tag: 'Security',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-[#6D28D9]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" strokeLinecap="round" />
                  </svg>
                ),
                title: 'IT Trending Center',
                desc: 'Hands-on training, workshops and mentoring to equip your team with the latest tech skills.',
                tag: 'Education',
              },
            ].map((service, i) => (
              <Link
                to="/services"
                key={i}
                className="group bg-[#F5F3FF] hover:bg-[#6D28D9] border border-[#C4B5FD]/30 hover:border-[#6D28D9] rounded-2xl p-6 transition-all duration-300 cursor-pointer"
              >
                {/* Tag */}
                <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-[#6D28D9] group-hover:text-[#C4B5FD] bg-white group-hover:bg-[#5b21b6] px-2.5 py-1 rounded-full mb-4 transition-all duration-300">
                  {service.tag}
                </span>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-white group-hover:bg-[#5b21b6] flex items-center justify-center mb-4 transition-all duration-300">
                  <div className="group-hover:[&>svg]:text-[#C4B5FD] transition-all">
                    {service.icon}
                  </div>
                </div>

                {/* Text */}
                <h3 className="font-['Clash_Display'] font-semibold text-lg text-[#1a0a3d] group-hover:text-white mb-2 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-sm text-[#7c6b9e] group-hover:text-[#C4B5FD] leading-relaxed transition-colors duration-300">
                  {service.desc}
                </p>

                {/* Arrow */}
                <div className="mt-5 text-[#C4B5FD] group-hover:text-white text-lg transition-all duration-300 group-hover:translate-x-1">
                  →
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>
      {/* ───── TEAM TEASER ───── */}
      <section className="bg-[#F5F3FF] py-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#6D28D9] mb-3">
                <span className="w-6 h-px bg-[#6D28D9] inline-block" />
                The Minds Behind It
              </span>
              <h2 className="font-['Clash_Display'] font-bold text-4xl md:text-5xl text-[#1a0a3d] leading-tight">
                People Who Make<br />
                <span className="text-[#6D28D9]">It Happen</span>
              </h2>
            </div>
            <Link
              to="/team"
              className="self-start md:self-auto border-2 border-[#6D28D9] text-[#6D28D9] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#6D28D9] hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              Meet Everyone →
            </Link>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamAvatars.length > 0
              ? teamAvatars.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  onClick={() => navigate('/team')}
                  className="bg-white rounded-2xl p-6 border border-[#C4B5FD]/30 shadow-sm hover:shadow-lg hover:shadow-[#6D28D9]/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {/* Avatar */}
                  <div className="mb-4">
                    {member.image
                      ? <img
                        src={member.image}
                        alt={member.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      : <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold font-['Clash_Display']"
                        style={{ background: avatarColors[i % avatarColors.length] }}
                      >
                        {getInitials(member.name)}
                      </div>
                    }
                  </div>
                  <h3 className="font-['Clash_Display'] font-semibold text-[#1a0a3d] group-hover:text-[#6D28D9] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#7c6b9e] mt-1">{member.role || 'Team Member'}</p>
                  <div className="mt-4 text-[#C4B5FD] group-hover:text-[#6D28D9] text-sm transition-colors">
                    View profile →
                  </div>
                </motion.div>
              ))
              : [1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-[#C4B5FD]/30 animate-pulse"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#F5F3FF] mb-4" />
                  <div className="h-4 bg-[#F5F3FF] rounded-full w-3/4 mb-2" />
                  <div className="h-3 bg-[#F5F3FF] rounded-full w-1/2" />
                </div>
              ))
            }
          </div>

        </div>
      </section>

      {/* ───── CTA STRIP ───── */}
      <section className="bg-[#6D28D9] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-[#C4B5FD] mb-4">
              <span className="w-6 h-px bg-[#C4B5FD] inline-block" />
              Ready to Start?
              <span className="w-6 h-px bg-[#C4B5FD] inline-block" />
            </span>
            <h2 className="font-['Clash_Display'] font-bold text-4xl md:text-6xl text-white leading-tight mb-6">
              Let's Build Something<br />
              <span className="text-[#C4B5FD]">Extraordinary.</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Whether you have a project in mind or just want to explore — we're ready to talk.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-[#6D28D9] px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#F5F3FF] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Start a Project
              </Link>
              <Link
                to="/portfolio"
                className="border-2 border-white/40 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:border-white hover:bg-white/10 transition-all duration-200"
              >
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  )
}