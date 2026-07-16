import { useEffect, useState } from 'react'

const PHRASES = [
  '❤️ Recuerda que te quiero mucho ❤️',
  '💕 Te quiero para siempre 💕',
  '💖 Eres la mejor 💖',
  '💝 Eres mi mongola 💝',
]

// Corazones posicionados en círculo
const HEART_COUNT = 12
const RADIUS = 110

function HeartCircle() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
      {/* Corazones orbitando */}
      {Array.from({ length: HEART_COUNT }).map((_, i) => {
        const angle = (i / HEART_COUNT) * 2 * Math.PI - Math.PI / 2
        const x = Math.cos(angle) * RADIUS
        const y = Math.sin(angle) * RADIUS
        const delay = (i / HEART_COUNT) * 2
        const size = i % 3 === 0 ? 'text-2xl' : i % 3 === 1 ? 'text-xl' : 'text-lg'
        return (
          <span
            key={i}
            className={`absolute ${size} select-none`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animation: `heartbeat 1.5s ease-in-out ${delay}s infinite`,
            }}
          >
            {i % 4 === 0 ? '❤️' : i % 4 === 1 ? '💕' : i % 4 === 2 ? '💖' : '💝'}
          </span>
        )
      })}

      {/* Centro */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <span
          className="text-6xl select-none"
          style={{ animation: 'heartbeat 1s ease-in-out infinite' }}
        >
          💖
        </span>
      </div>
    </div>
  )
}

export default function SilviaWelcome({ onFinish }) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const DURATION = 5000

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setFadeOut(true)
        setTimeout(onFinish, 600)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [onFinish])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #f5d0fe 60%, #ede9fe 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Corazones flotantes de fondo */}
      <FloatingHearts />

      <div className="relative flex flex-col items-center gap-8 px-8 text-center">
        {/* Círculo de corazones */}
        <HeartCircle />

        {/* Frase */}
        <div className="max-w-xs">
          <p
            className="text-2xl font-bold text-pink-600 leading-snug"
            style={{ animation: 'fadeInUp 0.8s ease forwards', textShadow: '0 2px 20px rgba(236,72,153,0.3)' }}
          >
            {phrase}
          </p>
        </div>

        {/* Nombre */}
        <p className="text-lg text-pink-400 font-semibold">
          ¡Hola Silvia! 💕
        </p>

        {/* Barra de progreso */}
        <div className="w-64 h-2 bg-pink-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #f472b6, #a855f7)',
              transition: 'width 0.03s linear',
            }}
          />
        </div>

        <p className="text-xs text-pink-300">Cargando vuestra galería...</p>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatHeart {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function FloatingHearts() {
  const hearts = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
    size: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'][Math.floor(Math.random() * 5)],
    emoji: ['❤️', '💕', '💖', '💗', '💝', '💓'][Math.floor(Math.random() * 6)],
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <span
          key={h.id}
          className={`absolute ${h.size} select-none`}
          style={{
            left: h.left,
            bottom: '-10%',
            animation: `floatHeart ${h.duration} ${h.delay} infinite ease-in-out`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}
