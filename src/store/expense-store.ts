import { create } from "zustand"

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  clientId?: string
  projectId?: string
  receiptUrl?: string
  createdAt: string
}

interface ExpenseStore {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[]
  getTotalExpenses: () => number
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  addExpense: (expense) =>
    set((state) => ({
      expenses: [
        ...state.expenses,
        {
          ...expense,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateExpense: (id, updatedExpense) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updatedExpense } : e
      ),
    })),
  deleteExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),
  getExpensesByDateRange: (startDate, endDate) => {
    return get().expenses.filter(
      (e) => e.date >= startDate && e.date <= endDate
    )
  },
  getTotalExpenses: () => {
    return get().expenses.reduce((sum, e) => sum + e.amount, 0)
  },
}))
