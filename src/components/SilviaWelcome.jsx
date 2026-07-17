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

// Barra de carga en corazones
function HeartLoader({ progress }) {
  const total = 10
  const filled = Math.round((progress / 100) * total)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className="text-xl select-none transition-all duration-300"
            style={{
              opacity: i < filled ? 1 : 0.2,
              transform: i < filled ? 'scale(1.2)' : 'scale(1)',
              filter: i < filled ? 'drop-shadow(0 0 5px rgba(236,72,153,0.8))' : 'none',
            }}
          >
            {i < filled ? '❤️' : '🤍'}
          </span>
        ))}
      </div>
      <p className="text-xs text-pink-300 tabular-nums">{Math.round(progress)}%</p>
    </div>
  )
}

// Corazones orbitando — sin corazón central enorme
function HeartOrbit() {
  const COUNT = 12
  const RADIUS = 90
  const emojis = ['❤️', '💕', '💖', '💗', '💝', '💓', '🌸', '💞']

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 220, height: 220 }}
    >
      {Array.from({ length: COUNT }).map((_, i) => {
        const angle = (i / COUNT) * 2 * Math.PI - Math.PI / 2
        const x = Math.cos(angle) * RADIUS
        const y = Math.sin(angle) * RADIUS
        const delay = (i / COUNT) * 2
        const sizes = ['text-lg', 'text-xl', 'text-base']
        return (
          <span
            key={i}
            className={`absolute select-none ${sizes[i % 3]}`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animation: `heartPulse 1.8s ease-in-out ${delay}s infinite`,
            }}
          >
            {emojis[i % emojis.length]}
          </span>
        )
      })}

      {/* Centro: texto pequeño, no emoji gigante */}
      <div className="relative z-10 flex flex-col items-center gap-1 select-none">
        <span className="text-3xl" style={{ animation: 'heartPulse 1s ease-in-out infinite' }}>💖</span>
        <span className="text-xs font-semibold text-pink-500 tracking-wide">Silvia</span>
      </div>
    </div>
  )
}

export default function SilviaWelcome({ onFinish }) {
  const order = useRef(
    [...Array(PHRASES.length).keys()].sort(() => Math.random() - 0.5)
  )
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  const DURATION = 6000
  const PHRASE_INTERVAL = Math.floor(DURATION / PHRASES.length)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(id)
        setFadeOut(true)
        setTimeout(onFinish, 700)
      }
    }, 30)
    return () => clearInterval(id)
  }, [onFinish])

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseVisible(false)
      setTimeout(() => {
        setPhraseIdx((p) => (p + 1) % PHRASES.length)
        setPhraseVisible(true)
      }, 350)
    }, PHRASE_INTERVAL)
    return () => clearInterval(id)
  }, [PHRASE_INTERVAL])

  const current = PHRASES[order.current[phraseIdx % PHRASES.length]]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 35%, #f5d0fe 65%, #ede9fe 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <FloatingHearts />

      <div className="relative z-10 flex flex-col items-center gap-7 px-8 text-center">
        <HeartOrbit />

        {/* Frase rotante */}
        <div
          className="flex flex-col items-center gap-2 min-h-[5rem]"
          style={{
            opacity: phraseVisible ? 1 : 0,
            transform: phraseVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}
        >
          <span className="text-2xl leading-none">{current.emoji}</span>
          <p
            className="text-2xl font-bold text-pink-600 leading-tight"
            style={{ textShadow: '0 2px 16px rgba(236,72,153,0.25)' }}
          >
            {current.text}
          </p>
          <span className="text-2xl leading-none">{current.emoji}</span>
        </div>

        <p className="text-base text-pink-400 font-semibold -mt-2">¡Hola Silvia! 💕</p>

        <HeartLoader progress={progress} />

        <p className="text-xs text-pink-300">Cargando vuestra galería...</p>
      </div>

      <style>{`
        @keyframes heartPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -50%) scale(1.35); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.9; }
          92%  { opacity: 0.4; }
          100% { transform: translateY(-15vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function FloatingHearts() {
  const hearts = useRef(
    Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.1) % 100}%`,
      delay: `${(i * 0.28) % 5}s`,
      duration: `${4 + (i % 4)}s`,
      size: ['text-sm', 'text-base', 'text-lg', 'text-xl'][i % 4],
      emoji: ['❤️', '💕', '💖', '💗', '💝', '💓', '🌸'][i % 7],
    }))
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.current.map((h) => (
        <span
          key={h.id}
          className={`absolute select-none ${h.size}`}
          style={{
            left: h.left,
            bottom: '-10%',
            animation: `floatUp ${h.duration} ${h.delay} infinite ease-in-out`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}
