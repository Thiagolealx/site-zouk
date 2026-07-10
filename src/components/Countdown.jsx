import { useState, useEffect } from 'react'

const EVENT_DATE = new Date('2026-11-26T03:00:00Z')

function getTimeLeft() {
  const diff = EVENT_DATE - Date.now()
  if (diff <= 0) return null

  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function Block({ value, label }) {
  return (
    <div className="flex flex-col items-center bg-night-light rounded-2xl px-5 py-5 min-w-[72px]">
      <span className="font-display text-5xl md:text-7xl text-sun-yellow leading-none tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-body text-xs md:text-sm text-sand tracking-widest mt-2 uppercase">
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="py-16 md:py-20 bg-night">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-sand tracking-widest mb-10">
          FALTA POUCO
        </h2>
        {timeLeft ? (
          <div className="flex flex-wrap justify-center gap-4">
            <Block value={timeLeft.days} label="DIAS" />
            <Block value={timeLeft.hours} label="HORAS" />
            <Block value={timeLeft.minutes} label="MINUTOS" />
            <Block value={timeLeft.seconds} label="SEGUNDOS" />
          </div>
        ) : (
          <p className="font-display text-3xl md:text-5xl text-sun-yellow">
            O EVENTO COMEÇOU! 🎉
          </p>
        )}
      </div>
    </section>
  )
}
