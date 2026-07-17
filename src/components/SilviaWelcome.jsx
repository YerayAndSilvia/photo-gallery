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

// Selecciona una frase aleatoria UNA SOLA VEZ al montar el componente
function useRandomPhrase() {
  return useRef(PHRASES[Math.floor(Math.random() * PHRASES.length)]).current
}

function HeartLoader({ progress }) {
  const filled = Math.round((progress / 100) * 10)
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="text-lg select-none transition-all duration-500"
          style={{
            opacity: i < filled ? 1 : 0.15,
            transform: i < filled ? 'scale(1.25)' : 'scale(1)',
            filter: i < filled ? 'drop-shadow(0 0 6px rgba(236,72,153,0.9))' : 'none',
          }}
        >
          {i < filled ? '❤️' : '🤍'}
        </span>
      ))}
    </div>
  )
}

function FloatingHearts() {
  const hearts = useRef(
    Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.7) % 100}%`,
      delay: `${(i * 0.31) % 5}s`,
      duration: `${4.5 + (i % 4)}s`,
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

export default function SilviaWelcome({ onFinish }) {
  const phrase = useRandomPhrase()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const DURATION = 4500

  // Entrada con pequeño delay para que se vea el fade-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(id)
        setFadeOut(true)
        setTimeout(onFinish, 600)
      }
    }, 30)
    return () => clearInterval(id)
  }, [onFinish])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1a0a12 0%, #2d0a22 40%, #1a0a2e 100%)',
        opacity: fadeOut ? 0 : visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      <FloatingHearts />

      {/* Contenido centrado */}
      <div
        className="relative z-10 flex flex-col items-center gap-10 px-8 text-center"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'transform 0.7s ease',
        }}
      >
        {/* Emoji grande */}
        <span
          className="text-7xl select-none"
          style={{ animation: 'heartbeat 2s ease-in-out infinite' }}
        >
          {phrase.emoji}
        </span>

        {/* Frase — solo una, sin rotación */}
        <div className="space-y-3">
          <p className="font-display text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight"
             style={{ textShadow: '0 0 40px rgba(236,72,153,0.5)' }}>
            {phrase.text}
          </p>
          <p className="text-pink-300 text-lg font-light tracking-wide">¡Hola Silvia! 💕</p>
        </div>

        {/* Carga */}
        <div className="flex flex-col items-center gap-3">
          <HeartLoader progress={progress} />
          <p className="text-xs text-white/30 tracking-widest uppercase">Cargando vuestra galería</p>
        </div>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(110vh) rotate(0deg); opacity: 0; }
          8%   { opacity: 0.7; }
          92%  { opacity: 0.3; }
          100% { transform: translateY(-15vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
