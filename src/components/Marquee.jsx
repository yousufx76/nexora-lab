const items = [
  'Graphic Design',
  'UI / UX Design',
  'Web Development',
  'Digital Marketing',
  'Server Security',
  'IT Training',
  'Branding',
  'Motion Design',
]

export default function Marquee() {
  const doubled = [...items, ...items]

  return (
    <div className="bg-[#6D28D9] py-4 overflow-hidden relative">

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#6D28D9] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#6D28D9] to-transparent z-10 pointer-events-none" />

      <div className="flex gap-10 animate-marquee w-max">
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 whitespace-nowrap"
          >
            <span className="font-['Clash_Display'] font-semibold text-sm tracking-[3px] uppercase text-[#C4B5FD]">
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] opacity-50 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}