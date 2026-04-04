import { useState, useEffect, useRef, useMemo } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { expertSidebarItems, expertSidebarBottomItems } from '../../config/expertNav'
import { useAppSelector } from '../../store/hooks'
import { selectUser } from '../../store/selectors/authSelectors'
import { IconCalendar, IconClock, IconVideo, IconMapPin } from '../../components/layout/DashboardIcons'
import {
  getAvailability,
  createAvailability,
  deleteAvailability,
  getSessions,
  getCalendarStats,
  updateSessionStatus,
  type AvailabilityWindow,
  type ScheduledSession,
} from '../../api/expertCalendar'

const TEAL = '#008C9E'

function formatWindowDate(d: string): string {
  const date = new Date(d)
  const mon = date.toLocaleString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${mon} ${day}, ${year}`
}

/** Format date as DD/MM/YYYY for availability window inputs */
function toDDMMYYYY(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const y = d.getFullYear()
  return `${day}/${m}/${y}`
}

/** Parse DD/MM/YYYY string to Date, or null if invalid */
function parseDDMMYYYY(s: string): Date | null {
  const trimmed = s.trim()
  if (!trimmed) return null
  const parts = trimmed.split('/')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  if (isNaN(day) || isNaN(month) || isNaN(year) || month < 0 || month > 11) return null
  const date = new Date(year, month, day)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null
  return date
}

/** Convert DD/MM/YYYY to YYYY-MM-DD for API */
function ddmmToApi(s: string): string | null {
  const d = parseDDMMYYYY(s)
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Build a 6×7 grid for the calendar. Each cell: { day, isCurrentMonth } */
function getCalendarGrid(year: number, month: number): { day: number; isCurrentMonth: boolean }[] {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const startWeekday = first.getDay()
  const daysInMonth = last.getDate()
  const prevMonthLast = new Date(year, month - 1, 0).getDate()
  const grid: { day: number; isCurrentMonth: boolean }[] = []
  for (let i = 0; i < startWeekday; i++) {
    grid.push({ day: prevMonthLast - startWeekday + i + 1, isCurrentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ day: d, isCurrentMonth: true })
  }
  const remaining = 42 - grid.length
  for (let d = 1; d <= remaining; d++) {
    grid.push({ day: d, isCurrentMonth: false })
  }
  return grid
}

export function ExpertCalendar() {
  const user = useAppSelector(selectUser) as { name?: string; email?: string } | null
  const prefix = (user?.email || '').split('@')[0] || 'John'
  const displayName = user?.name || (prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase() + ' Doe' : 'John Doe')

  const [showAddWindow, setShowAddWindow] = useState(false)
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const [windows, setWindows] = useState<AvailabilityWindow[]>([])
  const [sessions, setSessions] = useState<ScheduledSession[]>([])
  const [stats, setStats] = useState<{ activeWindows: number; upcomingSessions: number; pending: number; completed: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [windowStart, setWindowStart] = useState(toDDMMYYYY(today))
  const [windowEnd, setWindowEnd] = useState(toDDMMYYYY(today))
  const [windowNote, setWindowNote] = useState('')
  const [savingWindow, setSavingWindow] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingSessionId, setConfirmingSessionId] = useState<string | null>(null)
  const startDatePickerRef = useRef<HTMLInputElement>(null)
  const endDatePickerRef = useRef<HTMLInputElement>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [availRes, sessionsRes, statsRes] = await Promise.all([
        getAvailability(),
        getSessions(),
        getCalendarStats(),
      ])
      if (availRes.success) setWindows(availRes.data)
      if (sessionsRes.success) setSessions(sessionsRes.data)
      if (statsRes.success) setStats(statsRes.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const calendarGrid = getCalendarGrid(viewYear, viewMonth)
  const monthLabel = `${MONTH_NAMES[viewMonth - 1]} ${viewYear}`

  const goPrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth() + 1)
  }

  const isDayInWindow = (year: number, month: number, day: number, w: AvailabilityWindow) => {
    const d = new Date(year, month - 1, day)
    const start = new Date(w.startDate)
    const end = new Date(w.endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    d.setHours(0, 0, 0, 0)
    return d >= start && d <= end
  }

  const isDayInSession = (year: number, month: number, day: number, s: ScheduledSession) => {
    const d = new Date(year, month - 1, day)
    const sessionDate = new Date(s.scheduledDate)
    d.setHours(0, 0, 0, 0)
    sessionDate.setHours(0, 0, 0, 0)
    return d.getTime() === sessionDate.getTime()
  }

  const isSelected = (day: number) => selectedDay !== null && selectedDay === day
  const isAvailable = (day: number) =>
    windows.some((w) => isDayInWindow(viewYear, viewMonth, day, w))
  const isScheduled = (day: number) =>
    sessions.some((s) => isDayInSession(viewYear, viewMonth, day, s))

  const handleSaveWindow = async () => {
    const startStr = ddmmToApi(windowStart)
    const endStr = ddmmToApi(windowEnd)
    if (!startStr || !endStr) {
      setError('Please enter dates in DD/MM/YYYY format')
      return
    }
    const start = new Date(startStr)
    const end = new Date(endStr)
    if (end < start) {
      setError('End date must be on or after start date')
      return
    }
    setSavingWindow(true)
    setError(null)
    try {
      const res = await createAvailability({
        startDate: startStr,
        endDate: endStr,
        note: windowNote.trim() || undefined,
      })
      if (res.success) {
        await loadData()
        setShowAddWindow(false)
        setWindowNote('')
        setWindowStart(toDDMMYYYY(today))
        setWindowEnd(toDDMMYYYY(today))
      }
    } catch {
      setError('Failed to save availability window')
    } finally {
      setSavingWindow(false)
    }
  }

  const handleDeleteWindow = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteAvailability(id)
      await loadData()
    } catch {
      setError('Failed to delete window')
    } finally {
      setDeletingId(null)
    }
  }

  const handleConfirmSession = async (id: string) => {
    setConfirmingSessionId(id)
    try {
      await updateSessionStatus(id, 'confirmed')
      await loadData()
    } catch {
      setError('Failed to confirm session')
    } finally {
      setConfirmingSessionId(null)
    }
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const upcomingSessions = [...sessions.filter((s) => new Date(s.scheduledDate) >= todayStart)].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  )
  const pastSessions = sessions
    .filter((s) => new Date(s.scheduledDate) < todayStart)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())

  const sessionOverview = useMemo(() => {
    const upcoming = upcomingSessions
    const past = pastSessions
    return {
      upcomingTotal: upcoming.length,
      confirmedUpcoming: upcoming.filter((s) => s.status === 'confirmed').length,
      pendingUpcoming: upcoming.filter((s) => s.status === 'pending').length,
      completed: past.length,
      nextSession: upcoming[0],
    }
  }, [upcomingSessions, pastSessions])

  function formatSessionTypeLabel(raw: string) {
    return String(raw || 'Session')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (ch) => ch.toUpperCase())
  }

  return (
    <DashboardLayout
      sidebarItems={expertSidebarItems}
      sidebarBottomItems={expertSidebarBottomItems}
      userTypeLabel="Expert"
      userDisplayName={displayName}
      userSubLabel="Expert"
      accentColor="green"
      mainClassName="pl-5 pr-6"
    >
      <div className="max-w-5xl mx-auto pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendar &amp; Availability</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your availability windows and scheduled sessions</p>
        </div>

        {loading && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-center text-gray-500 text-sm">
            Loading calendar…
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Sync with External Calendars */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Sync with External Calendars</h2>
            <p className="text-sm text-gray-500 mt-0.5">Connect your calendar to automatically sync sessions</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border 
                border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-gray-700 text-[10px] text-gray-800">
                  <span className="h-2 w-2 border border-gray-800" />
                </span>
                Connect Google Calendar
              </button>
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-lg border 
                border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 
                transition-colors hover:border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-700 transition-colors group-hover:border-white">
                  <span className="h-2 w-2 rounded-full border border-gray-800 transition-colors group-hover:border-white" />
                </span>
                Connect Apple Calendar
              </button>
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-lg border 
                border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 
                transition-colors hover:border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-gray-700 transition-colors group-hover:border-white">
                  <span className="h-2 w-2 border border-gray-800 border-b-0 border-l-0 transition-colors group-hover:border-white" />
                </span>
                Connect Outlook
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800 transition-colors hover:border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
              >
                Download .ICS File
              </button>
            </div>
          </div>
          <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-teal-50" style={{ color: TEAL }}>
            <IconCalendar />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 lg:flex lg:gap-6 lg:items-start">
          {/* Calendar View */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 pt-5 pb-8 lg:w-1/2 lg:min-h-[630px] flex flex-col">
            <h2 className="text-base font-semibold text-gray-900">Calendar View</h2>
            <p className="text-sm text-gray-500 mt-0.5 mb-4">Select dates to mark your availability</p>

            {/* Month + Today left, arrows right */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{monthLabel}</span>
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-[#0096C7] hover:bg-[#0096C7] hover:text-white"
                  onClick={goToday}
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white text-gray-600"
                  style={{ borderColor: '#BEE3F8' }}
                  onClick={goPrevMonth}
                  aria-label="Previous month"
                >
                  {'<'}
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600"
                  onClick={goNextMonth}
                  aria-label="Next month"
                >
                  {'>'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-xs text-gray-600 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div
              className="grid grid-cols-7 text-sm flex-1 min-h-0"
              style={{ gridTemplateRows: 'repeat(6, 1fr)' }}
            >
              {calendarGrid.map((cell, idx) => {
                const { day, isCurrentMonth } = cell
                const selected = isCurrentMonth && isSelected(day)
                const available = isCurrentMonth && isAvailable(day)
                const scheduled = isCurrentMonth && isScheduled(day)
                const key = `cell-${viewYear}-${viewMonth}-${idx}-${day}-${isCurrentMonth}`
                if (!isCurrentMonth) {
                  return (
                    <div key={key} className="flex flex-col items-center justify-center p-0.5">
                      <span className="flex flex-col items-center justify-center w-9 min-h-9 text-sm font-medium text-gray-300">
                        {day}
                      </span>
                    </div>
                  )
                }
                return (
                  <div key={key} className="flex flex-col items-center justify-center p-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center justify-center rounded-lg w-9 min-h-9 text-sm font-medium ${
                        selected ? 'border-2 bg-white text-gray-900' : ''
                      } ${available ? 'bg-[#D1FAE5] text-gray-900' : ''} ${
                        scheduled ? 'border-2 bg-white text-gray-900' : ''
                      } ${!selected && !available && !scheduled ? 'text-gray-700' : ''}`}
                      style={
                        selected || scheduled ? { borderColor: '#BEE3F8' } : undefined
                      }
                    >
                      {day}
                      {available && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#34D399]" />}
                      {scheduled && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-[#34D399] bg-transparent" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded border-2 border-[#BEE3F8] bg-transparent" />
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#20C997]" />
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Availability & Quick Stats (right column) */}
          <div className="space-y-6 lg:w-1/2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Availability Windows</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Set date ranges when you&apos;re available for engagements</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: TEAL }}
                  onClick={() => setShowAddWindow(true)}
                >
                  <span className="text-base leading-none">+</span>
                  Add Window
                </button>
              </div>
              {/* Add Window form */}
              {showAddWindow && (
                <div className="rounded-lg border border-gray-200 bg-[#F8FAFF] px-4 py-4 mb-4">
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={windowStart}
                            onChange={(e) => setWindowStart(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400"
                          />
                          <input
                            ref={startDatePickerRef}
                            type="date"
                            value={ddmmToApi(windowStart) || ''}
                            onChange={(e) => {
                              const v = e.target.value
                              if (v) setWindowStart(toDDMMYYYY(new Date(v + 'T12:00:00')))
                            }}
                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                            aria-hidden
                            tabIndex={-1}
                          />
                          <button
                            type="button"
                            onClick={() => startDatePickerRef.current?.showPicker?.() ?? startDatePickerRef.current?.click()}
                            className="absolute right-2 flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Choose start date"
                          >
                            <IconCalendar className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={windowEnd}
                            onChange={(e) => setWindowEnd(e.target.value)}
                            placeholder="DD/MM/YYYY"
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400"
                          />
                          <input
                            ref={endDatePickerRef}
                            type="date"
                            value={ddmmToApi(windowEnd) || ''}
                            onChange={(e) => {
                              const v = e.target.value
                              if (v) setWindowEnd(toDDMMYYYY(new Date(v + 'T12:00:00')))
                            }}
                            className="absolute opacity-0 w-0 h-0 pointer-events-none"
                            aria-hidden
                            tabIndex={-1}
                          />
                          <button
                            type="button"
                            onClick={() => endDatePickerRef.current?.showPicker?.() ?? endDatePickerRef.current?.click()}
                            className="absolute right-2 flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            aria-label="Choose end date"
                          >
                            <IconCalendar className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Note <span className="font-normal text-gray-400">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={windowNote}
                        onChange={(e) => setWindowNote(e.target.value)}
                        placeholder="e.g., Available for workshops only"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={
                        savingWindow ||
                        !windowStart ||
                        !windowEnd ||
                        !ddmmToApi(windowStart) ||
                        !ddmmToApi(windowEnd) ||
                        (parseDDMMYYYY(windowEnd) !== null &&
                          parseDDMMYYYY(windowStart) !== null &&
                          parseDDMMYYYY(windowEnd)! < parseDDMMYYYY(windowStart)!)
                      }
                      onClick={handleSaveWindow}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      style={{ backgroundColor: TEAL }}
                    >
                      {savingWindow ? 'Saving…' : 'Save Window'}
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                      onClick={() => setShowAddWindow(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Window list from API */}
              {windows.length === 0 && !showAddWindow && (
                <p className="text-sm text-gray-500 py-2">No availability windows yet. Click Add Window to create one.</p>
              )}
              {windows.map((w) => (
                <div
                  key={w.id}
                  className="rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between gap-3 mt-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E0ECFF] text-[#4C6FFF]">
                      <IconCalendar className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatWindowDate(w.startDate)} - {formatWindowDate(w.endDate)}
                      </p>
                      {w.note && <p className="text-xs text-gray-500 mt-0.5">{w.note}</p>}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={deletingId === w.id}
                    onClick={() => handleDeleteWindow(w.id)}
                    className="text-gray-400 hover:text-gray-600 text-lg leading-none disabled:opacity-50"
                    aria-label="Delete window"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-base font-semibold text-gray-900">Session overview</h2>
              <p className="text-sm text-gray-500 mt-0.5 mb-4">Based on your scheduled sessions</p>
              {loading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#D7DEE8] bg-[#F5FAFE] p-4">
                      <p className="text-2xl font-bold text-[#0EA5C4]">{sessionOverview.upcomingTotal}</p>
                      <p className="mt-1 text-xs text-gray-500">Upcoming sessions</p>
                    </div>
                    <div className="rounded-xl border border-[#D7EBD9] bg-[#F3FBF6] p-4">
                      <p className="text-2xl font-bold text-[#1E8D51]">{sessionOverview.confirmedUpcoming}</p>
                      <p className="mt-1 text-xs text-gray-500">Confirmed</p>
                    </div>
                    <div className="rounded-xl border border-[#EEE2CF] bg-[#FFF8EE] p-4">
                      <p className="text-2xl font-bold text-[#C87400]">{sessionOverview.pendingUpcoming}</p>
                      <p className="mt-1 text-xs text-gray-500">Pending</p>
                    </div>
                    <div className="rounded-xl border border-[#D7DEE8] bg-[#FAFBFD] p-4">
                      <p className="text-2xl font-bold text-[#4B5563]">{sessionOverview.completed}</p>
                      <p className="mt-1 text-xs text-gray-500">Completed</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#BFE8EF] bg-[#F3FCFF] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1590A8]">Next session</p>
                    {sessionOverview.nextSession ? (
                      <>
                        <p className="mt-2 text-lg font-semibold text-gray-900">
                          {sessionOverview.nextSession.requirementTitle || sessionOverview.nextSession.companyName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">{sessionOverview.nextSession.companyName}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1.5">
                            <IconCalendar className="h-4 w-4" />
                            {formatWindowDate(sessionOverview.nextSession.scheduledDate)}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1.5">
                            <IconClock className="h-4 w-4" />
                            {[sessionOverview.nextSession.startTime, sessionOverview.nextSession.endTime]
                              .filter(Boolean)
                              .join(' – ') || 'Time TBD'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No upcoming sessions.</p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Availability windows</p>
                      <p className="text-lg font-semibold text-[#008C9E]">{stats?.activeWindows ?? windows.length}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scheduled Sessions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Scheduled Sessions</h2>

          <p className="text-sm font-semibold text-[#64748B] mb-3">Upcoming ({upcomingSessions.length})</p>
          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-transparent py-10 text-[#94A3B8]">
              <IconClock className="h-10 w-10" />
              <p className="mt-2 text-sm">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((s) => {
                const loc = s.location || ''
                const isLink =
                  /^https?:\/\//i.test(loc) || loc.toLowerCase().includes('zoom') || loc.toLowerCase().includes('meet.')
                return (
                  <div key={s.id} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#1F2937]">
                        {s.requirementTitle || s.companyName}
                      </p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                          s.status === 'confirmed'
                            ? 'bg-[#E8F8EE] text-[#1E8D51]'
                            : 'bg-[#FFF4D7] text-[#A56A00]'
                        }`}
                      >
                        {s.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {s.companyName} • {formatSessionTypeLabel(s.sessionType)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#64748B]">
                      <span className="inline-flex items-center gap-1.5">
                        <IconCalendar className="h-4 w-4 shrink-0" />
                        {formatWindowDate(s.scheduledDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconClock className="h-4 w-4 shrink-0" />
                        {[s.startTime, s.endTime].filter(Boolean).join(' – ') || '—'}
                      </span>
                      {loc ? (
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          {isLink ? <IconVideo className="h-4 w-4 shrink-0" /> : <IconMapPin className="h-4 w-4 shrink-0" />}
                          {isLink ? (
                            <a
                              href={loc.startsWith('http') ? loc : `https://${loc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-[#008C9E] underline"
                            >
                              Join link
                            </a>
                          ) : (
                            <span className="truncate">{loc}</span>
                          )}
                        </span>
                      ) : null}
                    </div>
                    {s.status === 'pending' && (
                      <button
                        type="button"
                        disabled={confirmingSessionId === s.id}
                        onClick={() => handleConfirmSession(s.id)}
                        className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        style={{ backgroundColor: TEAL }}
                      >
                        {confirmingSessionId === s.id ? 'Confirming…' : 'Confirm session'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="my-6 h-px bg-[#E5E7EB]" />

          <p className="text-sm font-semibold text-[#64748B] mb-3">Past Sessions ({pastSessions.length})</p>
          <div className="space-y-3">
            {pastSessions.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No past sessions.</p>
            ) : (
              pastSessions.map((s) => (
                <div key={s.id} className="rounded-xl border border-[#E5E7EB] bg-[#FAFBFD] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1F2937]">{s.requirementTitle || s.companyName}</p>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">Completed</span>
                  </div>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    {s.companyName} • {formatSessionTypeLabel(s.sessionType)} • {formatWindowDate(s.scheduledDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

