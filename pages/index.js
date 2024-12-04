import { useState, useEffect } from 'react'
import { differenceInWeeks, differenceInDays, parseISO, addWeeks, addYears } from 'date-fns'

export default function Home() {
  const LIFE_EXPECTANCY = 73
  const STORAGE_KEY = 'life-weeks-birthday'
  
  const [birthday, setBirthday] = useState('')
  const [showVisualization, setShowVisualization] = useState(false)
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    const savedBirthday = localStorage.getItem(STORAGE_KEY)
    if (savedBirthday) {
      setBirthday(savedBirthday)
      setShowVisualization(true)
    }
  }, [])

  useEffect(() => {
    if (!birthday) return

    const calculateTimeLeft = () => {
      const birthDate = parseISO(birthday)
      const endDate = addYears(birthDate, LIFE_EXPECTANCY)
      const now = new Date()
      const difference = endDate - now

      if (difference <= 0) {
        return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      const years = Math.floor(difference / (365.25 * 24 * 60 * 60 * 1000))
      const months = Math.floor((difference % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
      const days = Math.floor((difference % (30.44 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
      const hours = Math.floor((difference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      const minutes = Math.floor((difference % (60 * 60 * 1000)) / (60 * 1000))
      const seconds = Math.floor((difference % (60 * 1000)) / 1000)

      return { years, months, days, hours, minutes, seconds }
    }

    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [birthday])

  const handleBirthdayChange = (e) => {
    const newBirthday = e.target.value
    setBirthday(newBirthday)
    localStorage.setItem(STORAGE_KEY, newBirthday)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowVisualization(true)
  }

  const calculateProgress = () => {
    if (!birthday) return { days: 0, percentage: 0 }
    
    const birthDate = parseISO(birthday)
    const today = new Date()
    const totalDaysLived = differenceInDays(today, birthDate)
    const totalPossibleDays = LIFE_EXPECTANCY * 365
    const percentage = (totalDaysLived / totalPossibleDays) * 100

    return {
      days: totalDaysLived,
      percentage: Math.min(100, percentage)
    }
  }

  const formatCountdown = () => {
    if (!countdown) return ''
    const parts = []
    if (countdown.years) parts.push(`${countdown.years}y`)
    if (countdown.months) parts.push(`${countdown.months}m`)
    if (countdown.days) parts.push(`${countdown.days}d`)
    if (countdown.hours) parts.push(`${countdown.hours}h`)
    if (countdown.minutes) parts.push(`${countdown.minutes}m`)
    parts.push(`${countdown.seconds}s`)
    return parts.join(' ')
  }

  const calculateWeeks = () => {
    if (!birthday) return []
    
    const totalWeeks = LIFE_EXPECTANCY * 52
    const birthDate = parseISO(birthday)
    const today = new Date()
    const weeksLived = differenceInWeeks(today, birthDate)
    
    return Array(totalWeeks).fill().map((_, i) => {
      const weekStart = addWeeks(birthDate, i)
      const isLived = i < weeksLived
      const isCurrentWeek = i === weeksLived - 1
      const totalDaysLived = isLived ? 
        Math.min(differenceInDays(today, birthDate), (i + 1) * 7) : 0

      return {
        isLived,
        weekNumber: i + 1,
        totalDaysLived,
        isBirth: i === 0,
        isDeath: i === totalWeeks - 1,
        isCurrentWeek
      }
    })
  }

  const getSquareColor = (week) => {
    if (week.isBirth) return 'bg-green-500'
    if (week.isDeath) return 'bg-red-500'
    return week.isLived ? 'bg-gray-700' : 'bg-gray-200'
  }

  const getSquareClasses = (week) => {
    const baseClasses = `aspect-square ${getSquareColor(week)} hover:ring-2 hover:ring-blue-500`
    return week.isCurrentWeek ? `${baseClasses} current-week` : baseClasses
  }

  const renderGrid = () => {
    const rows = []
    for (let year = 0; year < LIFE_EXPECTANCY; year++) {
      const yearWeeks = weeks.slice(year * 52, (year + 1) * 52)
      const yearDate = birthday ? addYears(parseISO(birthday), year).getFullYear() : ''
      
      rows.push(
        <div key={year} className="flex items-center gap-2">
          <div className="text-xs text-gray-500 w-12 text-right">{yearDate}</div>
          <div className="flex-1 grid grid-cols-52 gap-1">
            {yearWeeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="group relative"
              >
                <div
                  className={getSquareClasses(week)}
                />
                <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  {week.isBirth ? "Birth" : week.isDeath ? "End of life expectancy" : `Week ${week.weekNumber}`}
                  {week.isLived && ` (${week.totalDaysLived} days lived)`}
                  {week.isCurrentWeek && " - Current Week"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return rows
  }

  const weeks = calculateWeeks()
  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Life in Weeks</h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Time's ticking, make every moment matter!
        </p>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex justify-center gap-4">
            <input
              type="date"
              value={birthday}
              onChange={handleBirthdayChange}
              className="px-4 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Visualize
            </button>
          </div>
        </form>

        {showVisualization && (
          <>
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {progress.days.toLocaleString()} days lived
                  {countdown && (
                    <span className="text-gray-500"> (remaining: {formatCountdown()})</span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  {progress.percentage.toFixed(1)}% of {LIFE_EXPECTANCY} years
                  <div className="group relative">
                    <svg 
                      className="w-4 h-4 text-gray-400 cursor-help" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <div className="invisible group-hover:visible absolute z-50 right-0 bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                      Life expectancy at birth. Data based on the latest<br />
                      United Nations Population Division estimates (2024)
                    </div>
                  </div>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              {renderGrid()}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
