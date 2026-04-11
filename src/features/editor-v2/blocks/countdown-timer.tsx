"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetDate: string; heading: string; expiredText: string
}

function calcDiff(target: number) {
  const diff = Math.max(0, target - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff <= 0,
  }
}

export function CountdownTimer({ targetDate, heading, expiredText }: CountdownTimerProps) {
  const target = new Date(targetDate).getTime()
  const [time, setTime] = useState(() => calcDiff(target))

  useEffect(() => {
    const id = setInterval(() => setTime(calcDiff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center rounded-lg bg-gray-100 px-4 py-3">
      <span className="text-3xl tabular-nums" style={{ fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{String(value).padStart(2, "0")}</span>
      <span className="text-xs uppercase" style={{ color: "var(--store-color-muted)" }}>{label}</span>
    </div>
  )

  return (
    <div className="py-8 text-center">
      {heading && <h2 className="mb-4 text-2xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</h2>}
      {time.expired
        ? <p className="text-lg" style={{ color: "var(--store-color-muted)" }}>{expiredText}</p>
        : <div className="flex justify-center gap-3">
            <Box value={time.days} label="Days" /><Box value={time.hours} label="Hours" />
            <Box value={time.minutes} label="Min" /><Box value={time.seconds} label="Sec" />
          </div>
      }
    </div>
  )
}
