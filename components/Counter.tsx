'use client'

import { useEffect, useRef, useState } from 'react'

export function Counter({ end, label }: { end: number; label: string }) {
  const [val, setVal] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        obs.disconnect()
        let start = 0
        const step = Math.ceil(end / 60)
        const id = setInterval(() => {
          start += step
          if (start >= end) { setVal(end); clearInterval(id) }
          else setVal(start)
        }, 16)
      },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end])

  return (
    <div ref={ref} className="counter">
      <div
        className="counter-val"
        style={{ opacity: val === null ? 0 : 1, transition: 'opacity 0.2s' }}
      >
        {val ?? end}+
      </div>
      <div className="counter-label">{label}</div>
    </div>
  )
}