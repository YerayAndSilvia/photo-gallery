import { useEffect, useState, useRef } from 'react'

const PHRASES = [
  { text: 'Te quiero mucho', emoji: '❤️' },
  { text: 'Eres la mejor', emoji: '💖' },
  { text: 'La más preciosa', emoji: '💕' },
  { text: 'La más bella', emoji: '💗' },
  { text: 'Mi mongola', emoji: '💝' },
  { text: 'Te quiero para siempre', emoji: '💓' },
  { text: 'Recuerda que te quiero', emoji: '🌸' },
]

// Corazón SVG animado para la barra de carga
function HeartLoader({ progress }) {
  return (
    <div className="flex flex-col items-center gap-2 w-64">
      {/* Fila de corazones que se van llenando */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: 10 }).map((_, i) => {
          const filled = i < Math.round(progress / 10)
          return (
            <span
              key={i}
              className="text-xl select-none transition-all duration-300"
              style={{
                opacity: filled ? 1 : 0.2,
                transform: filled ? 'scale(1.15)' : 'scale(1)',
                filter: filled ? 'drop-shadow(0 0 4px rgba(236,72,153,0.7))' : 'none',
              }}
            >
              {filled ? '❤️' : '🤍'}
            </span>
          )
        })}
      </div>
      <p className="text-xs text-pink-300">{Math.round(progress)}%</p>
    </div>
  )
}

// Corazones orbitando en círculo
const HEART_COUNT = 14
const RADIUS = 115

function HeartOrbit() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
      {Array.from({ length: HEART_COUNT }).map((_, i) => {
        const angle = (i / HEART_COUNT) * 2 * Math.PI - Math.PI / 2
        const x = Math.cos(angle) * RADIUS
        const y = Math.sin(angle) * RADIUS
        const delay = (i / HEART_COUNT) * 2.4
        const emojis = ['❤️', '💕', '💖', '💗', '💝', '💓', '🌸']
        const emoji = emojis[i % emojis.length]
        const sizes = ['text-xl', 'text-2xl', 'text-lg']
        const size = sizes[i % sizes.length]
        return (
          <span
            key={i}
            className={`absolute ${size} select-none`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animation: `heartPulse 1.8s ease-in-out ${delay}s infinite`,
            }}
          >
            {emoji}
          </span>
        )
      })}

      {/* Corazón central grande */}
      <div className="relative z-10 flex flex-col items-center">
        <span
          className="text-7xl select-none"
          style={{ animation: 'heartPulse 1s ease-in-out infinite' }}
        >
          💖
        </span>
      </div>
    </div>
  )
}

export default function SilviaWelcome({ onFinish }) {
  // Rotar por todas las frases en orden aleatorio
  const order = useRef(
    [...Array(PHRASES.length).keys()].sort(() => Math.random() - 0.5)
  )
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const DURATION = 6000
  const PHRASE_INTERVAL = DURATION / PHRASES.length

  // Progreso
  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(interval)
        setFadeOut(true)
        setTimeout(onFinish, 700)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [onFinish])

  // Rotar frases con fade
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseVisible(false)
      setTimeout(() => {
        setPhraseIdx((prev) => (prev + 1) % PHRASES.length)
        setPhraseVisible(true)
      }, 350)
    }, PHRASE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const current = PHRASES[order.current[phraseIdx]]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 30%, #f5d0fe 60%, #ede9fe 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <FloatingHearts />

      <div className="relative flex flex-col items-center gap-6 px-8 text-center">
        {/* Órbita de corazones */}
        <HeartOrbit />

        {/* Frase con fade */}
        <div
          className="max-w-xs min-h-[4rem] flex flex-col items-center gap-1"
          style={{
            opacity: phraseVisible ? 1 : 0,
            transform: phraseVisible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <span className="text-3xl">{current.emoji}</span>
          <p
            className="text-2xl font-bold text-pink-600 leading-snug"
            style={{ textShadow: '0 2px 20px rgba(236,72,153,0.3)' }}
          >
            {current.text}
          </p>
          <span className="text-3xl">{current.emoji}</span>
        </div>

        {/* Saludo */}
        <p className="text-lg text-pink-400 font-semibold -mt-2">
          ¡Hola Silvia! 💕
        </p>

        {/* Carga en corazones */}
        <HeartLoader progress={progress} />

        <p className="text-xs text-pink-300 -mt-1">Cargando vuestra galería...</p>
      </div>

      <style>{`
        @keyframes heartPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.35); }
        }
        @keyframes floatHeart {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function FloatingHearts() {
  const hearts = useRef(
    Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.5) % 100}%`,
      delay: `${(i * 0.3) % 5}s`,
      duration: `${4 + (i % 5)}s`,
      size: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'][i % 5],
      emoji: ['❤️', '💕', '💖', '💗', '💝', '💓', '🌸'][i % 7],
    }))
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.current.map((h) => (
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
