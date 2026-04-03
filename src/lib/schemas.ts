import { z } from "zod"

export const DocumentItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "품목명은 필수입니다"),
  quantity: z.coerce.number().min(1, "수량은 1 이상이어야 합니다"),
  unitPrice: z.coerce.number().min(0, "단가는 0 이상이어야 합니다"),
  amount: z.coerce.number().min(0),
})

export const createQuoteSchema = z.object({
  clientId: z.string().min(1, "거래처를 선택해주세요"),
  projectId: z.string().optional(),
  issueDate: z.string().min(1, "발행일을 선택해주세요"),
  validUntil: z.string().optional(),
  status: z.enum(["draft", "issued", "confirmed", "cancelled"]),
  items: z.array(DocumentItemSchema).min(1, "최소 1개 이상의 품목이 필요합니다"),
  memo: z.string().optional(),
  terms: z.string().optional(),
})

export const createInvoiceSchema = z.object({
  clientId: z.string().min(1, "거래처를 선택해주세요"),
  projectId: z.string().optional(),
  issueDate: z.string().min(1, "발행일을 선택해주세요"),
  dueDate: z.string().min(1, "결제기한을 선택해주세요"),
  status: z.enum(["draft", "issued", "confirmed", "cancelled"]),
  items: z.array(DocumentItemSchema).min(1, "최소 1개 이상의 품목이 필요합니다"),
  memo: z.string().optional(),
})

export const createTaxInvoiceSchema = z.object({
  clientId: z.string().min(1, "거래처를 선택해주세요"),
  projectId: z.string().optional(),
  issueDate: z.string().min(1, "발행일을 선택해주세요"),
  supplyDate: z.string().min(1, "공급일을 선택해주세요"),
  status: z.enum(["draft", "issued", "confirmed", "cancelled"]),
  items: z.array(DocumentItemSchema).min(1, "최소 1개 이상의 품목이 필요합니다"),
  memo: z.string().optional(),
  cash: z.coerce.number().min(0).optional(),
})

export const createContractSchema = z.object({
  clientId: z.string().min(1, "거래처를 선택해주세요"),
  projectId: z.string().optional(),
  contractDate: z.string().min(1, "계약일을 선택해주세요"),
  startDate: z.string().min(1, "시작일을 선택해주세요"),
  endDate: z.string().min(1, "종료일을 선택해주세요"),
  status: z.enum(["draft", "issued", "confirmed", "cancelled"]),
  items: z.array(DocumentItemSchema).min(1, "최소 1개 이상의 품목이 필요합니다"),
  memo: z.string().optional(),
  terms: z.string().optional(),
})
