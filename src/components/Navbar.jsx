import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'The Minds', path: '/team' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-sm shadow-[#6D28D9]/10'
        : 'bg-[#F5F3FF]'
    }`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/">
          <img src={logo} alt="Nexora Lab" className="h-10 w-auto object-contain" />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 relative group ${
                  location.pathname === link.path
                    ? 'text-[#6D28D9]'
                    : 'text-[#7c6b9e] hover:text-[#6D28D9]'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#6D28D9] transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/contact"
          className="hidden md:inline-block bg-[#6D28D9] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#5b21b6] transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30"
        >
          Get Started
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <motion.span animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-[#6D28D9] origin-center" />
          <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} className="block w-6 h-0.5 bg-[#6D28D9]" />
          <motion.span animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="block w-6 h-0.5 bg-[#6D28D9] origin-center" />
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#F5F3FF] border-t border-[#C4B5FD]/30 overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block text-sm font-medium tracking-wide transition-colors ${
                      location.pathname === link.path
                        ? 'text-[#6D28D9]'
                        : 'text-[#7c6b9e] hover:text-[#6D28D9]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/contact"
                  className="inline-block bg-[#6D28D9] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#5b21b6] transition-all mt-2"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}