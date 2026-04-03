"use client"

import { useState } from "react"
import { useExpenseStore, Expense } from "@/store/expense-store"
import { useClientStore } from "@/store/client-store"
import { useProjectStore } from "@/store/project-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, DollarSign, Calendar, Filter } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const expenseSchema = z.object({
  date: z.string().min(1, "날짜는 필수입니다"),
  category: z.string().min(1, "분류는 필수입니다"),
  description: z.string().min(1, "설명은 필수입니다"),
  amount: z.coerce.number().min(1, "금액은 1원 이상입니다"),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
})

type ExpenseForm = z.infer<typeof expenseSchema>

const EXPENSE_CATEGORIES = [
  "인건비",
  "소모품",
  "IT 비용",
  "교통비",
  "식비",
  "임대료",
  "광고비",
  "교육비",
  "복리후생",
  "세금",
  "기타",
]

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenseStore()
  const clients = useClientStore((state) => state.clients)
  const projects = useProjectStore((state) => state.projects)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory ? expense.category === filterCategory : true
    return matchesSearch && matchesCategory
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  const currentMonth = new Date()
  const currentMonthExpenses = expenses.filter((e) => {
    const expenseMonth = e.date.substring(0, 7)
    const nowMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`
    return expenseMonth === nowMonth
  })
  const monthlyTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)

  const openAddDialog = () => {
    setEditingExpense(null)
    reset({
      date: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
      amount: 0,
      clientId: "",
      projectId: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    reset({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      clientId: expense.clientId || "",
      projectId: expense.projectId || "",
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: ExpenseForm) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data)
    } else {
      addExpense(data)
    }
    setIsDialogOpen(false)
    reset()
  }

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id)
      setIsDeleteDialogOpen(false)
      setExpenseToDelete(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">지출 관리</h1>
          <p className="mt-2 text-gray-500">
            이번달 지출: ₩{monthlyTotal.toLocaleString()}
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          지출 추가
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">이번달 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₩{monthlyTotal.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">{currentMonthExpenses.length}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">총 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">{expenses.length}건</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">평균 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{expenses.length > 0 ? Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">1건당</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="지출 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterCategory || "전체"}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterCategory(null)}>
                    전체
                  </DropdownMenuItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <DropdownMenuItem key={cat} onClick={() => setFilterCategory(cat)}>
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery || filterCategory ? "검색 결과가 없습니다" : "아직 등록된 지출이 없습니다"}
              </p>
              {!searchQuery && !filterCategory && (
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 지출 추가
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>분류</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead>거래처</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const client = clients.find((c) => c.id === expense.clientId)
                    return (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {expense.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          {client?.name || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          ₩{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(expense)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(expense)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="text-gray-500">총 {filteredExpenses.length}건</span>
                <span className="text-lg font-bold text-red-600">
                  ₩{totalExpenses.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "지출 수정" : "지출 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense ? "지출 정보를 수정합니다" : "새 지출을 등록합니다"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">
                    날짜 <span className="text-red-500">*</span>
                  </Label>
                  <Input id="date" type="date" {...register("date")} />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">
                    분류 <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    {...register("category")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">선택...</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">
                  내용 <span className="text-red-500">*</span>
                </Label>
                <Input id="description" {...register("description")} />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">
                  금액 <span className="text-red-500">*</span>
                </Label>
                <Input id="amount" type="number" {...register("amount")} />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientId">관련 거래처</Label>
                <select
                  id="clientId"
                  {...register("clientId")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">선택...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                취소
              </Button>
              <Button type="submit">
                {editingExpense ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지출 삭제</DialogTitle>
            <DialogDescription>
              이 지출 항목을 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
