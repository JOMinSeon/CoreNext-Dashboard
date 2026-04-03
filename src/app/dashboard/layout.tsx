"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Calculator,
  FileSignature,
  Menu,
  X,
  LogOut,
  DollarSign,
  Calendar,
  Bell,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { name: "거래처", href: "/dashboard/clients", icon: Users },
  { name: "프로젝트", href: "/dashboard/projects", icon: FolderKanban },
  { name: "일정", href: "/dashboard/calendar", icon: Calendar },
  { name: "지출", href: "/dashboard/expenses", icon: DollarSign },
  { name: "문서", href: "/dashboard/documents", icon: FileText },
]

const documentSubmenu = [
  { name: "견적서", href: "/dashboard/documents/quotes", icon: FileText },
  { name: "거래명세서", href: "/dashboard/documents/invoices", icon: Receipt },
  { name: "세금계산서", href: "/dashboard/documents/tax-invoices", icon: Calculator },
  { name: "계약서", href: "/dashboard/documents/contracts", icon: FileSignature },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [documentsOpen, setDocumentsOpen] = useState(true)

  const userInitial = session?.user?.name?.charAt(0) || "U"

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-gray-900">B2B 플랫폼</h1>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            if (item.name === "문서") {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setDocumentsOpen(!documentsOpen)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </div>
                  </button>
                  {documentsOpen && (
                    <div className="mt-1 ml-4 space-y-1">
                      {documentSubmenu.map((doc) => {
                        const docActive = pathname === doc.href
                        const DocIcon = doc.icon
                        return (
                          <Link
                            key={doc.name}
                            href={doc.href}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              docActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <DocIcon className="h-4 w-4" />
                            {doc.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium">{session?.user?.name || "사용자"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="min-h-screen">{children}</div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
