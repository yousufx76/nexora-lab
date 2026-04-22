import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import Team from './pages/Team'
import Contact from './pages/Contact'
import Clients from './pages/Clients'
import Reviews from './pages/Reviews'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminClients from './admin/AdminClients'
import AdminReviews from './admin/AdminReviews'
import AdminTeam from './admin/AdminTeam'
import AdminStats from './admin/AdminStats'
import AdminMessages from './admin/AdminMessages'
import AdminPortfolio from './admin/AdminPortfolio'
import AdminDashboard from './admin/AdminDashboard'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* Public routes */}
        <Route path="/" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Home /><Footer />
          </div>
        }/>
        <Route path="/services" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Services /><Footer />
          </div>
        }/>
        <Route path="/portfolio" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Portfolio /><Footer />
          </div>
        }/>
        <Route path="/team" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Team /><Footer />
          </div>
        }/>
        <Route path="/contact" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Contact /><Footer />
          </div>
        }/>
        <Route path="/clients" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Clients /><Footer />
          </div>
        }/>
        <Route path="/reviews" element={
          <div className="font-['Satoshi'] bg-white text-[#1a0a3d]">
            <Navbar /><Reviews /><Footer />
          </div>
        }/>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="portfolio" element={<AdminPortfolio />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}