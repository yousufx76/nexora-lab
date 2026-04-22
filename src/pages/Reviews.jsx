import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, orderBy, query, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl transition-all duration-150 ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          <span className={
            star <= (hovered || rating)
              ? 'text-yellow-400'
              : 'text-gray-200'
          }>★</span>
        </button>
      ))}
    </div>
  )
}

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    clientName: '', company: '', rating: 0, comment: ''
  })
  const [status, setStatus] = useState(null)

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setReviews(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const approvedReviews = reviews.filter((r) => r.approved)

  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approvedReviews.filter((r) => r.rating === star).length,
    percent: approvedReviews.length > 0
      ? Math.round((approvedReviews.filter((r) => r.rating === star).length / approvedReviews.length) * 100)
      : 0
  }))

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.clientName || !form.comment || form.rating === 0) {
      setStatus('error')
      return
    }
    setStatus('sending')
    try {
      await addDoc(collection(db, 'reviews'), {
        ...form,
        approved: false,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      })
      setStatus('sent')
      setForm({ clientName: '', company: '', rating: 0, comment: '' })
    } catch (err) {
      console.error(err)
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
              What Clients Say
            </span>
            <h1 className="font-['Clash_Display'] font-bold text-5xl md:text-6xl text-[#1a0a3d] leading-tight mb-4">
              Real Reviews<br />
              <span className="text-[#6D28D9]">Real Results</span>
            </h1>
            <p className="text-[#7c6b9e] text-lg max-w-xl leading-relaxed">
              Every review is from a real client. We don't filter feedback — we earn it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───── STATS STRIP ───── */}
      <section className="bg-[#6D28D9] py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Left — big rating */}
          <div className="flex items-center gap-6">
            <div>
              <div className="font-['Clash_Display'] font-bold text-7xl text-white leading-none">
                {avgRating}
              </div>
              <StarRating rating={Math.round(avgRating)} />
              <div className="text-[#C4B5FD] text-sm mt-2">
                Based on {approvedReviews.length} review{approvedReviews.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Right — rating breakdown */}
          <div className="flex flex-col gap-2">
            {ratingCounts.map(({ star, count, percent }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs text-[#C4B5FD] w-4">{star}</span>
                <span className="text-yellow-400 text-sm">★</span>
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <span className="text-xs text-[#C4B5FD] w-8 text-right">{count}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ───── REVIEWS GRID ───── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-10">
            <h2 className="font-['Clash_Display'] font-bold text-2xl text-[#1a0a3d]">
              Client Reviews
            </h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30"
            >
              + Leave a Review
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map((_, i) => (
                <div key={i} className="h-48 bg-[#F5F3FF] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : approvedReviews.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-['Clash_Display'] font-bold text-xl text-[#1a0a3d] mb-2">
                No reviews yet
              </h3>
              <p className="text-[#7c6b9e] text-sm mb-6">
                Be the first to share your experience with Nexora Lab.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#6D28D9] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#5b21b6] transition-all"
              >
                Leave a Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {approvedReviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-[#F5F3FF] rounded-2xl p-6 border border-[#C4B5FD]/20 flex flex-col justify-between"
                >
                  {/* Top */}
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <StarRating rating={review.rating} />
                      <span className="text-[10px] text-[#7c6b9e]">{review.date}</span>
                    </div>
                    <p className="text-sm text-[#1a0a3d] leading-relaxed italic mb-4">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#C4B5FD]/20">
                    <div className="w-9 h-9 rounded-xl bg-[#6D28D9] flex items-center justify-center text-white text-xs font-bold font-['Clash_Display'] flex-shrink-0">
                      {review.clientName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1a0a3d] font-['Clash_Display']">
                        {review.clientName}
                      </div>
                      {review.company && (
                        <div className="text-xs text-[#7c6b9e]">{review.company}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── REVIEW FORM MODAL ───── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowForm(false); setStatus(null) }}
              className="fixed inset-0 bg-[#1a0a3d]/60 backdrop-blur-sm z-50"
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
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl shadow-[#6D28D9]/20 pointer-events-auto overflow-hidden"
              >
                {/* Header */}
                <div className="bg-[#6D28D9] px-7 py-6 relative">
                  <button
                    onClick={() => { setShowForm(false); setStatus(null) }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-colors"
                  >✕</button>
                  <h2 className="font-['Clash_Display'] font-bold text-2xl text-white mb-1">
                    Leave a Review
                  </h2>
                  <p className="text-[#C4B5FD] text-sm">
                    Your review will be visible after approval.
                  </p>
                </div>

                {/* Form */}
                <div className="px-7 py-6 flex flex-col gap-4">

                  {/* Star Rating */}
                  <div>
                    <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                      Your Rating *
                    </label>
                    <StarRating
                      rating={form.rating}
                      interactive
                      onRate={(r) => setForm({ ...form, rating: r })}
                    />
                  </div>

                  {/* Name + Company */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                        Your Name *
                      </label>
                      <input
                        type="text" name="clientName"
                        value={form.clientName} onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-2.5 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                        Company
                      </label>
                      <input
                        type="text" name="company"
                        value={form.company} onChange={handleChange}
                        placeholder="Optional"
                        className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-2.5 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-medium text-[#7c6b9e] mb-2 uppercase tracking-wide">
                      Your Review *
                    </label>
                    <textarea
                      name="comment" value={form.comment} onChange={handleChange}
                      rows={4}
                      placeholder="Share your experience working with Nexora Lab..."
                      className="w-full bg-[#F5F3FF] border border-[#C4B5FD]/30 focus:border-[#6D28D9] rounded-xl px-4 py-3 text-sm text-[#1a0a3d] placeholder:text-[#C4B5FD] outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={status === 'sending' || status === 'sent'}
                    className="w-full bg-[#6D28D9] hover:bg-[#5b21b6] text-white font-medium py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#6D28D9]/30 disabled:opacity-60 font-['Clash_Display'] text-sm"
                  >
                    {status === 'sending' ? 'Submitting...'
                      : status === 'sent' ? '✓ Review Submitted!'
                      : 'Submit Review'}
                  </button>

                  {status === 'error' && (
                    <p className="text-red-500 text-xs text-center">
                      Please fill in your name, rating and review.
                    </p>
                  )}
                  {status === 'sent' && (
                    <p className="text-[#6D28D9] text-xs text-center">
                      Thanks! Your review will appear after approval. 🔥
                    </p>
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