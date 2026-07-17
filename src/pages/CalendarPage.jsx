import Layout from '../components/Layout'
import Calendar from '../components/Calendar'

export default function CalendarPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <p className="text-[11px] font-semibold text-pink-400/80 uppercase tracking-[0.2em] mb-2">Archivo</p>
          <h1 className="font-display font-black text-4xl text-white leading-none">Calendario</h1>
        </div>
        <Calendar />
      </div>
    </Layout>
  )
}
