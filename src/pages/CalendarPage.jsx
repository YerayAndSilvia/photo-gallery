import Layout from '../components/Layout'
import Calendar from '../components/Calendar'
import { CalendarDays } from 'lucide-react'

export default function CalendarPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-pink-300/40">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calendario</h1>
            <p className="text-sm text-gray-400">Navega por todos vuestros recuerdos</p>
          </div>
        </div>
        <Calendar />
      </div>
    </Layout>
  )
}
