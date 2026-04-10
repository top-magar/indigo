interface CountdownTimerProps {
  targetDate: string; heading: string; expiredText: string
}

export function CountdownTimer({ targetDate, heading, expiredText }: CountdownTimerProps) {
  const target = new Date(targetDate).getTime()
  const now = Date.now()
  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  const expired = diff <= 0

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center rounded-lg bg-gray-100 px-4 py-3">
      <span className="text-3xl font-bold">{String(value).padStart(2, "0")}</span>
      <span className="text-xs uppercase text-gray-500">{label}</span>
    </div>
  )

  return (
    <div className="py-8 text-center">
      {heading && <h2 className="mb-4 text-2xl font-bold">{heading}</h2>}
      {expired
        ? <p className="text-lg text-gray-500">{expiredText}</p>
        : <div className="flex justify-center gap-3">
            <Box value={days} label="Days" /><Box value={hours} label="Hours" />
            <Box value={minutes} label="Min" /><Box value={seconds} label="Sec" />
          </div>
      }
    </div>
  )
}
