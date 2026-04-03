"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useClientStore } from "@/store/client-store"
import { useProjectStore } from "@/store/project-store"
import { useDocumentStore } from "@/store/document-store"
import { useExpenseStore } from "@/store/expense-store"
import { Users, FolderKanban, FileText, TrendingUp, DollarSign, Clock, AlertCircle, Calendar } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const clients = useClientStore((state) => state.clients)
  const projects = useProjectStore((state) => state.projects)
  const { invoices, taxInvoices, contracts } = useDocumentStore()
  const expenses = useExpenseStore((state) => state.expenses)

  if (status === "unauthenticated") {
    redirect("/login")
  }

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const activeProjects = projects.filter((p) => p.status === "active")
  const pendingProjects = projects.filter((p) => p.status === "pending")
  
  const thisMonthDocuments = [
    ...invoices.filter((i) => i.issueDate.startsWith(currentMonth)),
    ...taxInvoices.filter((t) => t.issueDate.startsWith(currentMonth)),
    ...contracts.filter((c) => c.contractDate.startsWith(currentMonth)),
  ]

  const thisMonthRevenue = taxInvoices
    .filter((t) => t.issueDate.startsWith(currentMonth) && t.status === "confirmed")
    .reduce((sum, t) => sum + t.totalAmount + t.taxAmount, 0)

  const thisMonthExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0)

  const pendingInvoices = invoices.filter((i) => i.status === "issued")
  const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0)

  const upcomingDeadlines = projects
    .filter((p) => p.endDate && new Date(p.endDate) > now)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 5)

  const stats = [
    {
      title: "총 거래처",
      value: clients.length.toString(),
      description: "등록된 거래처",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "진행 중 프로젝트",
      value: activeProjects.length.toString(),
      description: `${pendingProjects.length}개 대기중`,
      icon: FolderKanban,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "이번 달 문서",
      value: thisMonthDocuments.length.toString(),
      description: "발행된 문서",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "이번 달 매출",
      value: `₩${thisMonthRevenue.toLocaleString()}`,
      description: `지출: ₩${thisMonthExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((p) => {
      const client = clients.find((c) => c.id === p.clientId)
      return {
        ...p,
        clientName: client?.name || "미지정",
      }
    })

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "대기중", variant: "secondary" },
      active: { label: "진행중", variant: "default" },
      completed: { label: "완료", variant: "outline" },
      cancelled: { label: "취소", variant: "destructive" },
    }
    const { label, variant } = statusMap[status] || statusMap.pending
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          안녕하세요, {session?.user?.name || "사업자"}님
        </h1>
        <p className="mt-2 text-gray-500">
          {now.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })} 기준 대시보드
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              최근 프로젝트
            </CardTitle>
            <CardDescription>최근 등록된 프로젝트입니다</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderKanban className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>아직 등록된 프로젝트가 없습니다</p>
                <p className="text-sm mt-1">프로젝트를 추가해보세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.clientName}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(project.status)}
                      <p className="text-sm font-medium mt-2">₩{project.amount.toLocaleString()}</p>
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
              <AlertCircle className="h-5 w-5" />
              미수금 현황
            </CardTitle>
            <CardDescription>발행 후 미확인 청구서</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>미수금이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">미수금 총액</p>
                      <p className="text-sm text-gray-500">{pendingInvoices.length}건</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-orange-600">
                    ₩{totalPendingAmount.toLocaleString()}
                  </p>
                </div>
                {pendingInvoices.slice(0, 3).map((invoice) => {
                  const client = clients.find((c) => c.id === invoice.clientId)
                  return (
                    <div key={invoice.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{invoice.documentNumber}</p>
                        <p className="text-gray-500">{client?.name || "미지정"}</p>
                      </div>
                      <p className="font-medium">₩{invoice.totalAmount.toLocaleString()}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              다가오는 마감일
            </CardTitle>
            <CardDescription>프로젝트 마감일 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>다가오는 마감일이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((project) => {
                  const daysLeft = Math.ceil(
                    (new Date(project.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const isUrgent = daysLeft <= 7
                  const client = clients.find((c) => c.id === project.clientId)
                  return (
                    <div
                      key={project.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isUrgent ? "bg-red-50" : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">{client?.name || "미지정"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
                          {daysLeft <= 0 ? "마감일 초과" : `${daysLeft}일 남음`}
                        </p>
                        <p className="text-xs text-gray-500">{project.endDate}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              월간 요약
            </CardTitle>
            <CardDescription>{currentMonth}월 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">당월 매출</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ₩{thisMonthRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <span className="font-medium">당월 지출</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  ₩{thisMonthExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">당월 이익</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  ₩{(thisMonthRevenue - thisMonthExpenses).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
