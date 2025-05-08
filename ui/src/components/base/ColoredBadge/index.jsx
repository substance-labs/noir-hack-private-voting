const COLOR_CLASSES = {
  red: "bg-red-400/10 text-red-300 border border-red-400/20",
  orange: "bg-orange-400/10 text-orange-300 border border-orange-400/20",
  amber: "bg-amber-400/10 text-amber-300 border border-amber-400/20",
  yellow: "bg-yellow-400/10 text-yellow-300 border border-yellow-400/20",
  lime: "bg-lime-400/10 text-lime-300 border border-lime-400/20",
  green: "bg-green-400/10 text-green-300 border border-green-400/20",
  emerald: "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20",
  teal: "bg-teal-400/10 text-teal-300 border border-teal-400/20",
  cyan: "bg-cyan-400/10 text-cyan-300 border border-cyan-400/20",
  sky: "bg-sky-400/10 text-sky-300 border border-sky-400/20",
  blue: "bg-blue-400/10 text-blue-300 border border-blue-400/20",
  indigo: "bg-indigo-400/10 text-indigo-300 border border-indigo-400/20",
  violet: "bg-violet-400/10 text-violet-300 border border-violet-400/20",
  purple: "bg-purple-400/10 text-purple-300 border border-purple-400/20",
  fuchsia: "bg-fuchsia-400/10 text-fuchsia-300 border border-fuchsia-400/20",
  pink: "bg-pink-400/10 text-pink-300 border border-pink-400/20",
  rose: "bg-rose-400/10 text-rose-300 border border-rose-400/20",
}

const COLORS = Object.keys(COLOR_CLASSES)

function hashStringToIndex(str, max) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % max
}

const ColoredBadge = ({ label }) => {
  const colorKey = COLORS[hashStringToIndex(label, COLORS.length)]
  const colorClasses = COLOR_CLASSES[colorKey]

  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClasses}`}>{label}</span>
}

export default ColoredBadge
