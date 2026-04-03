import { create } from "zustand"

export type DocumentStatus = "draft" | "issued" | "confirmed" | "cancelled"

export interface DocumentItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface BaseDocument {
  id: string
  documentNumber: string
  clientId: string
  projectId?: string
  issueDate: string
  status: DocumentStatus
  items: DocumentItem[]
  totalAmount: number
  taxAmount: number
  memo: string
  createdAt: string
}

export interface Quote extends BaseDocument {
  validUntil: string
  terms: string
}

export interface Invoice extends BaseDocument {
  dueDate: string
}

export interface TaxInvoice extends BaseDocument {
  supplyDate: string
  cash: number
  taxableAmount: number
  taxRate: number
}

export interface Contract extends BaseDocument {
  contractDate: string
  startDate: string
  endDate: string
  terms: string
}

interface DocumentStore {
  quotes: Quote[]
  invoices: Invoice[]
  taxInvoices: TaxInvoice[]
  contracts: Contract[]

  addQuote: (quote: Omit<Quote, "id" | "documentNumber" | "createdAt">) => void
  updateQuote: (id: string, quote: Partial<Quote>) => void
  deleteQuote: (id: string) => void

  addInvoice: (invoice: Omit<Invoice, "id" | "documentNumber" | "createdAt">) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  addTaxInvoice: (taxInvoice: Omit<TaxInvoice, "id" | "documentNumber" | "createdAt">) => void
  updateTaxInvoice: (id: string, taxInvoice: Partial<TaxInvoice>) => void
  deleteTaxInvoice: (id: string) => void

  addContract: (contract: Omit<Contract, "id" | "documentNumber" | "createdAt">) => void
  updateContract: (id: string, contract: Partial<Contract>) => void
  deleteContract: (id: string) => void

  generateDocumentNumber: (type: "quote" | "invoice" | "tax" | "contract") => string
}

const generateNumber = (prefix: string) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${year}${month}-${random}`
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  quotes: [],
  invoices: [],
  taxInvoices: [],
  contracts: [],

  addQuote: (quote) =>
    set((state) => ({
      quotes: [
        ...state.quotes,
        {
          ...quote,
          id: Date.now().toString(),
          documentNumber: get().generateDocumentNumber("quote"),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateQuote: (id, updatedQuote) =>
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.id === id ? { ...q, ...updatedQuote } : q
      ),
    })),

  deleteQuote: (id) =>
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== id),
    })),

  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [
        ...state.invoices,
        {
          ...invoice,
          id: Date.now().toString(),
          documentNumber: get().generateDocumentNumber("invoice"),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateInvoice: (id, updatedInvoice) =>
    set((state) => ({
      invoices: state.invoices.map((i) =>
        i.id === id ? { ...i, ...updatedInvoice } : i
      ),
    })),

  deleteInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== id),
    })),

  addTaxInvoice: (taxInvoice) =>
    set((state) => ({
      taxInvoices: [
        ...state.taxInvoices,
        {
          ...taxInvoice,
          id: Date.now().toString(),
          documentNumber: get().generateDocumentNumber("tax"),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateTaxInvoice: (id, updatedTaxInvoice) =>
    set((state) => ({
      taxInvoices: state.taxInvoices.map((t) =>
        t.id === id ? { ...t, ...updatedTaxInvoice } : t
      ),
    })),

  deleteTaxInvoice: (id) =>
    set((state) => ({
      taxInvoices: state.taxInvoices.filter((t) => t.id !== id),
    })),

  addContract: (contract) =>
    set((state) => ({
      contracts: [
        ...state.contracts,
        {
          ...contract,
          id: Date.now().toString(),
          documentNumber: get().generateDocumentNumber("contract"),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateContract: (id, updatedContract) =>
    set((state) => ({
      contracts: state.contracts.map((c) =>
        c.id === id ? { ...c, ...updatedContract } : c
      ),
    })),

  deleteContract: (id) =>
    set((state) => ({
      contracts: state.contracts.filter((c) => c.id !== id),
    })),

  generateDocumentNumber: (type) => {
    const prefixMap = {
      quote: "QT",
      invoice: "IV",
      tax: "TX",
      contract: "CT",
    }
    return generateNumber(prefixMap[type])
  },
}))
