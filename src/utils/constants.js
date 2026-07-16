export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const MONTH_COLORS = [
  'from-rose-400 to-pink-500',
  'from-pink-400 to-fuchsia-500',
  'from-fuchsia-400 to-purple-500',
  'from-purple-400 to-violet-500',
  'from-violet-400 to-indigo-500',
  'from-indigo-400 to-blue-500',
  'from-blue-400 to-cyan-500',
  'from-cyan-400 to-teal-500',
  'from-teal-400 to-emerald-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-orange-400 to-red-500',
]

export const CURRENT_YEAR = new Date().getFullYear()
export const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)
