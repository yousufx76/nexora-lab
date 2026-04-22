import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const links = {
  Company: [
    { label: 'Home', path: '/' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'The Minds', path: '/team' },
  ],
  Services: [
    { label: 'Graphic Design', path: '/services' },
    { label: 'UI / UX Design', path: '/services' },
    { label: 'Web Development', path: '/services' },
    { label: 'Server Security', path: '/services' },
    { label: 'IT Training', path: '/services' },
  ],
  Connect: [
    { label: 'Contact Us', path: '/contact' },
    { label: 'Our Clients', path: '/clients' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Admin Panel', path: '/admin' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#1a0a3d] text-white">

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link to="/">
            <img
              src={logo}
              alt="Nexora Lab"
              className="h-9 w-auto object-contain mb-4 brightness-200"
            />
          </Link>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Creative IT studio based in Dhaka — designing, building, and securing brands that lead.
          </p>

          {/* Contact info */}
          <div className="flex flex-col gap-2 mb-5">
            <a
              href="mailto:xaninstudio@gmail.com"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-[#C4B5FD] transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" strokeLinecap="round" />
              </svg>
              xaninstudio@gmail.com
            </a>

            <a
              href="https://wa.me/8801794078825"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-white/50 hover:text-[#C4B5FD] transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +880 1794 078825
            </a>
          </div>

          {/* Socials */}
          <div className="flex gap-3">
            {[
              {
                label: 'Facebook',
                icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              },
              {
                label: 'Instagram',
                icon: <>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
                </>
              },
              {
                label: 'LinkedIn',
                icon: <>
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </>
              },
            ].map((s) => (
              <button
                key={s.label}
                aria-label={s.label}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#6D28D9] flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  {s.icon}
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Nav Links */}
        {Object.entries(links).map(([category, items]) => (
          <div key={category}>
            <h4 className="font-['Clash_Display'] font-semibold text-xs tracking-widest uppercase text-[#C4B5FD] mb-4">
              {category}
            </h4>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Nexora Lab. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Crafted with purpose by{' '}
            <span className="text-[#C4B5FD]">KAIZO & CO.</span>
          </p>
        </div>
      </div>

    </footer>
  )
}