// Fondo con corazones decorativos para la sesión de Silvia
export default function HeartsBackground() {
  const hearts = [
    { top: '5%', left: '3%', size: '1.4rem', opacity: 0.18, rotate: -15, emoji: '❤️' },
    { top: '8%', left: '92%', size: '1.1rem', opacity: 0.14, rotate: 10, emoji: '💕' },
    { top: '15%', left: '15%', size: '0.9rem', opacity: 0.12, rotate: 5, emoji: '💖' },
    { top: '18%', left: '80%', size: '1.6rem', opacity: 0.15, rotate: -20, emoji: '💗' },
    { top: '28%', left: '6%', size: '1.2rem', opacity: 0.13, rotate: 12, emoji: '💝' },
    { top: '32%', left: '88%', size: '0.9rem', opacity: 0.11, rotate: -8, emoji: '❤️' },
    { top: '42%', left: '2%', size: '1.0rem', opacity: 0.10, rotate: 18, emoji: '💕' },
    { top: '45%', left: '95%', size: '1.3rem', opacity: 0.14, rotate: -5, emoji: '💖' },
    { top: '55%', left: '8%', size: '1.5rem', opacity: 0.12, rotate: -22, emoji: '💓' },
    { top: '58%', left: '85%', size: '1.0rem', opacity: 0.13, rotate: 7, emoji: '💗' },
    { top: '68%', left: '4%', size: '0.9rem', opacity: 0.11, rotate: -10, emoji: '💝' },
    { top: '70%', left: '91%', size: '1.4rem', opacity: 0.15, rotate: 14, emoji: '❤️' },
    { top: '78%', left: '12%', size: '1.1rem', opacity: 0.12, rotate: -6, emoji: '💕' },
    { top: '82%', left: '79%', size: '1.2rem', opacity: 0.14, rotate: 20, emoji: '💖' },
    { top: '88%', left: '5%', size: '1.0rem', opacity: 0.10, rotate: -18, emoji: '💓' },
    { top: '92%', left: '88%', size: '0.9rem', opacity: 0.12, rotate: 8, emoji: '💗' },
    // algunos al interior para relleno sutil
    { top: '25%', left: '48%', size: '0.8rem', opacity: 0.07, rotate: 15, emoji: '💕' },
    { top: '50%', left: '50%', size: '0.75rem', opacity: 0.06, rotate: -12, emoji: '❤️' },
    { top: '72%', left: '45%', size: '0.85rem', opacity: 0.07, rotate: 9, emoji: '💖' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }} aria-hidden="true">
      {hearts.map((h, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            top: h.top,
            left: h.left,
            fontSize: h.size,
            opacity: h.opacity,
            transform: `rotate(${h.rotate}deg)`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  )
}
