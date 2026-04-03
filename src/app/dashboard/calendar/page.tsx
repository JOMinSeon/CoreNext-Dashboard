"use client"

import { useState } from "react"
import { useProjectStore } from "@/store/project-store"
import { useClientStore } from "@/store/client-store"
import { useDocumentStore } from "@/store/document-store"
import { useNotificationStore } from "@/store/notification-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertCircle, CheckCircle, Clock, Bell } from "lucide-react"

export default function CalendarPage() {
  const projects = useProjectStore((state) => state.projects)
  const clients = useClientStore((state) => state.clients)
  const { invoices, contracts } = useDocumentStore()
  const notifications = useNotificationStore((state) => state.notifications)
  const deleteNotification = useNotificationStore((state) => state.deleteNotification)

  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    
    const dayProjects = projects.filter((p) => {
      if (p.startDate === dateStr) return { type: "start" as const, project: p }
      if (p.endDate === dateStr) return { type: "end" as const, project: p }
      return null
    })

    const dayInvoices = invoices.filter((i) => i.issueDate === dateStr || i.dueDate === dateStr)
    const dayContracts = contracts.filter((c) => c.contractDate === dateStr || c.startDate === dateStr || c.endDate === dateStr)

    return { dayProjects, dayInvoices, dayContracts }
  }

  const upcomingDeadlines = projects
    .filter((p) => p.endDate && new Date(p.endDate) >= today)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 10)

  const unreadNotifications = notifications.filter((n) => !n.read)

  const generateCalendarDays = () => {
    const days = []

    for (let i = 0; i < firstDayWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    const diff = target.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getProjectStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "대기", variant: "secondary" },
      active: { label: "진행", variant: "default" },
      completed: { label: "완료", variant: "outline" },
      cancelled: { label: "취소", variant: "destructive" },
    }
    return statusMap[status] || statusMap.pending
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">일정 및 마감</h1>
        <p className="mt-2 text-gray-500">
          프로젝트 마감일과 문서 일정을 확인하세요
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {year}년 {month + 1}월
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    오늘
                  </Button>
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="bg-white min-h-[80px]" />
                  }

                  const events = getEventsForDay(day)
                  const hasEvents = events.dayProjects.length > 0 || events.dayInvoices.length > 0 || events.dayContracts.length > 0

                  return (
                    <div
                      key={index}
                      className={`bg-white min-h-[80px] p-1 ${
                        isToday(day) ? "ring-2 ring-blue-500 ring-inset" : ""
                      }`}
                    >
                      <div className={`text-sm font-medium p-1 ${isToday(day) ? "text-blue-600" : "text-gray-700"}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {events.dayProjects.slice(0, 2).map((event: any) => (
                          <div
                            key={event.project.id}
                            className={`text-xs p-1 rounded truncate ${
                              event.type === "start"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {event.type === "start" ? "시작" : "마감"}: {event.project.name}
                          </div>
                        ))}
                        {events.dayInvoices.slice(0, 1).map((inv) => (
                          <div key={inv.id} className="text-xs p-1 bg-purple-100 text-purple-700 rounded truncate">
                            청구서: {inv.documentNumber}
                          </div>
                        ))}
                        {events.dayContracts.slice(0, 1).map((con) => (
                          <div key={con.id} className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate">
                            계약: {con.documentNumber}
                          </div>
                        ))}
                        {hasEvents && events.dayProjects.length + events.dayInvoices.length + events.dayContracts.length > 3 && (
                          <div className="text-xs text-gray-500">+더보기</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                다가오는 마감일
              </CardTitle>
              <CardDescription>7일 이내 마감 프로젝트</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.filter((p) => getDaysUntil(p.endDate) <= 7).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
                  <p>이번 주 마감 프로젝트가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines
                    .filter((p) => getDaysUntil(p.endDate) <= 7)
                    .map((project) => {
                      const daysLeft = getDaysUntil(project.endDate)
                      const client = clients.find((c) => c.id === project.clientId)
                      const { label, variant } = getProjectStatusBadge(project.status)
                      return (
                        <div
                          key={project.id}
                          className={`p-4 rounded-lg border ${
                            daysLeft <= 3
                              ? "bg-red-50 border-red-200"
                              : daysLeft <= 7
                              ? "bg-orange-50 border-orange-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{project.name}</p>
                              <p className="text-sm text-gray-500">{client?.name || "미지정"}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={variant}>{label}</Badge>
                              <p className={`text-sm font-medium mt-1 ${
                                daysLeft <= 3 ? "text-red-600" : "text-orange-600"
                              }`}>
                                {daysLeft <= 0 ? "마감일 초과!" : `${daysLeft}일 남음`}
                              </p>
                              <p className="text-xs text-gray-500">{project.endDate}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                알림
              </CardTitle>
              <CardDescription>
                {unreadNotifications.length}개의 읽지 않은 알림
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>새 알림이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unreadNotifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.type === "error"
                          ? "bg-red-50 border-red-200"
                          : notification.type === "warning"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          {notification.dueDate && (
                            <p className="text-xs text-gray-400 mt-1">
                              마감: {notification.dueDate}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                모든 마감일
              </CardTitle>
              <CardDescription>남은 프로젝트</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>마감 프로젝트가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((project) => {
                    const daysLeft = getDaysUntil(project.endDate)
                    const client = clients.find((c) => c.id === project.clientId)
                    return (
                      <div key={project.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{project.name}</p>
                          <p className="text-xs text-gray-500 truncate">{client?.name}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className={`text-sm font-medium ${
                            daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-orange-600" : "text-gray-600"
                          }`}>
                            {daysLeft <= 0 ? "초과" : `${daysLeft}d`}
                          </p>
                          <p className="text-xs text-gray-400">{project.endDate}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
