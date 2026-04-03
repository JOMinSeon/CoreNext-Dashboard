import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export interface User {
  id: string
  name: string
  email: string
  position: string
  password: string
  created_at: Date
}

export interface Client {
  id: string
  name: string
  business_number: string
  owner_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  industry: string | null
  memo: string | null
  created_at: Date
}

export interface Project {
  id: string
  name: string
  client_id: string
  status: "pending" | "active" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
  amount: number
  description: string | null
  created_at: Date
}

export interface DocumentItem {
  id: string
  document_type: "quote" | "invoice" | "tax_invoice" | "contract"
  document_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
}

export interface Quote {
  id: string
  document_number: string
  client_id: string
  project_id: string | null
  issue_date: string
  valid_until: string | null
  status: "draft" | "issued" | "confirmed" | "cancelled"
  total_amount: number
  tax_amount: number
  memo: string | null
  terms: string | null
  created_at: Date
}

export interface Invoice {
  id: string
  document_number: string
  client_id: string
  project_id: string | null
  issue_date: string
  due_date: string
  status: "draft" | "issued" | "confirmed" | "cancelled"
  total_amount: number
  tax_amount: number
  memo: string | null
  created_at: Date
}

export interface TaxInvoice {
  id: string
  document_number: string
  client_id: string
  project_id: string | null
  issue_date: string
  supply_date: string
  status: "draft" | "issued" | "confirmed" | "cancelled"
  total_amount: number
  tax_amount: number
  cash: number
  taxable_amount: number
  tax_rate: number
  memo: string | null
  created_at: Date
}

export interface Contract {
  id: string
  document_number: string
  client_id: string
  project_id: string | null
  contract_date: string
  start_date: string
  end_date: string
  status: "draft" | "issued" | "confirmed" | "cancelled"
  total_amount: number
  tax_amount: number
  memo: string | null
  terms: string | null
  created_at: Date
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  client_id: string | null
  project_id: string | null
  receipt_url: string | null
  created_at: Date
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  const results = await sql`
    SELECT id, name, email, position, password, created_at
    FROM users
    WHERE email = ${email}
  `
  return results[0] ?? null
}

export async function getUserById(id: string): Promise<User | null> {
  const results = await sql`
    SELECT id, name, email, position, password, created_at
    FROM users
    WHERE id = ${id}
  `
  return results[0] ?? null
}

// Client queries
export async function getAllClients(): Promise<Client[]> {
  return sql`
    SELECT * FROM clients ORDER BY created_at DESC
  `
}

export async function getClientById(id: string): Promise<Client | null> {
  const results = await sql`
    SELECT * FROM clients WHERE id = ${id}
  `
  return results[0] ?? null
}

export async function createClient(client: {
  name: string
  business_number: string
  owner_name?: string
  email?: string
  phone?: string
  address?: string
  industry?: string
  memo?: string
}): Promise<Client> {
  const results = await sql`
    INSERT INTO clients (name, business_number, owner_name, email, phone, address, industry, memo)
    VALUES (
      ${client.name},
      ${client.business_number},
      ${client.owner_name ?? null},
      ${client.email ?? null},
      ${client.phone ?? null},
      ${client.address ?? null},
      ${client.industry ?? null},
      ${client.memo ?? null}
    )
    RETURNING *
  `
  return results[0]
}

export async function updateClient(
  id: string,
  client: Partial<Client>
): Promise<Client | null> {
  const results = await sql`
    UPDATE clients SET
      name = COALESCE(${client.name ?? null}, name),
      business_number = COALESCE(${client.business_number ?? null}, business_number),
      owner_name = COALESCE(${client.owner_name ?? null}, owner_name),
      email = COALESCE(${client.email ?? null}, email),
      phone = COALESCE(${client.phone ?? null}, phone),
      address = COALESCE(${client.address ?? null}, address),
      industry = COALESCE(${client.industry ?? null}, industry),
      memo = COALESCE(${client.memo ?? null}, memo),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return results[0] ?? null
}

export async function deleteClient(id: string): Promise<void> {
  await sql`DELETE FROM clients WHERE id = ${id}`
}

// Project queries
export async function getAllProjects(): Promise<Project[]> {
  return sql`
    SELECT * FROM projects ORDER BY created_at DESC
  `
}

export async function getProjectById(id: string): Promise<Project | null> {
  const results = await sql`
    SELECT * FROM projects WHERE id = ${id}
  `
  return results[0] ?? null
}

export async function getProjectsByClient(clientId: string): Promise<Project[]> {
  return sql`
    SELECT * FROM projects WHERE client_id = ${clientId} ORDER BY created_at DESC
  `
}

export async function createProject(project: {
  name: string
  client_id: string
  status?: string
  start_date?: string
  end_date?: string
  amount?: number
  description?: string
}): Promise<Project> {
  const results = await sql`
    INSERT INTO projects (name, client_id, status, start_date, end_date, amount, description)
    VALUES (
      ${project.name},
      ${project.client_id},
      ${project.status ?? "pending"},
      ${project.start_date ?? null},
      ${project.end_date ?? null},
      ${project.amount ?? 0},
      ${project.description ?? null}
    )
    RETURNING *
  `
  return results[0]
}

export async function updateProject(
  id: string,
  project: Partial<Project>
): Promise<Project | null> {
  const results = await sql`
    UPDATE projects SET
      name = COALESCE(${project.name ?? null}, name),
      client_id = COALESCE(${project.client_id ?? null}, client_id),
      status = COALESCE(${project.status ?? null}, status),
      start_date = COALESCE(${project.start_date ?? null}, start_date),
      end_date = COALESCE(${project.end_date ?? null}, end_date),
      amount = COALESCE(${project.amount ?? null}, amount),
      description = COALESCE(${project.description ?? null}, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return results[0] ?? null
}

export async function deleteProject(id: string): Promise<void> {
  await sql`DELETE FROM projects WHERE id = ${id}`
}

// Quote queries
export async function getAllQuotes(): Promise<Quote[]> {
  return sql`SELECT * FROM quotes ORDER BY created_at DESC`
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  const results = await sql`SELECT * FROM quotes WHERE id = ${id}`
  return results[0] ?? null
}

export async function getQuoteItems(quoteId: string): Promise<DocumentItem[]> {
  return sql`
    SELECT * FROM document_items
    WHERE document_type = 'quote' AND document_id = ${quoteId}
    ORDER BY sort_order
  `
}

export async function createQuote(quote: {
  client_id: string
  project_id?: string
  issue_date: string
  valid_until?: string
  status?: string
  memo?: string
  terms?: string
  items: { description: string; quantity: number; unit_price: number; amount: number }[]
}): Promise<Quote> {
  const totalAmount = quote.items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = Math.round(totalAmount * 0.1)

  const quoteResult = await sql`
    INSERT INTO quotes (
      document_number,
      client_id,
      project_id,
      issue_date,
      valid_until,
      status,
      total_amount,
      tax_amount,
      memo,
      terms
    )
    VALUES (
      'QT-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      ${quote.client_id},
      ${quote.project_id ?? null},
      ${quote.issue_date},
      ${quote.valid_until ?? null},
      ${quote.status ?? "draft"},
      ${totalAmount},
      ${taxAmount},
      ${quote.memo ?? null},
      ${quote.terms ?? null}
    )
    RETURNING *
  `

  const newQuote = quoteResult[0]

  for (let i = 0; i < quote.items.length; i++) {
    const item = quote.items[i]
    await sql`
      INSERT INTO document_items (document_type, document_id, description, quantity, unit_price, amount, sort_order)
      VALUES ('quote', ${newQuote.id}, ${item.description}, ${item.quantity}, ${item.unit_price}, ${item.amount}, ${i})
    `
  }

  return newQuote
}

// Invoice queries
export async function getAllInvoices(): Promise<Invoice[]> {
  return sql`SELECT * FROM invoices ORDER BY created_at DESC`
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const results = await sql`SELECT * FROM invoices WHERE id = ${id}`
  return results[0] ?? null
}

export async function getInvoiceItems(invoiceId: string): Promise<DocumentItem[]> {
  return sql`
    SELECT * FROM document_items
    WHERE document_type = 'invoice' AND document_id = ${invoiceId}
    ORDER BY sort_order
  `
}

export async function createInvoice(invoice: {
  client_id: string
  project_id?: string
  issue_date: string
  due_date: string
  status?: string
  memo?: string
  items: { description: string; quantity: number; unit_price: number; amount: number }[]
}): Promise<Invoice> {
  const totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = Math.round(totalAmount * 0.1)

  const invoiceResult = await sql`
    INSERT INTO invoices (
      document_number,
      client_id,
      project_id,
      issue_date,
      due_date,
      status,
      total_amount,
      tax_amount,
      memo
    )
    VALUES (
      'IV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      ${invoice.client_id},
      ${invoice.project_id ?? null},
      ${invoice.issue_date},
      ${invoice.due_date},
      ${invoice.status ?? "draft"},
      ${totalAmount},
      ${taxAmount},
      ${invoice.memo ?? null}
    )
    RETURNING *
  `

  const newInvoice = invoiceResult[0]

  for (let i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i]
    await sql`
      INSERT INTO document_items (document_type, document_id, description, quantity, unit_price, amount, sort_order)
      VALUES ('invoice', ${newInvoice.id}, ${item.description}, ${item.quantity}, ${item.unit_price}, ${item.amount}, ${i})
    `
  }

  return newInvoice
}

// Tax Invoice queries
export async function getAllTaxInvoices(): Promise<TaxInvoice[]> {
  return sql`SELECT * FROM tax_invoices ORDER BY created_at DESC`
}

export async function getTaxInvoiceById(id: string): Promise<TaxInvoice | null> {
  const results = await sql`SELECT * FROM tax_invoices WHERE id = ${id}`
  return results[0] ?? null
}

export async function getTaxInvoiceItems(taxInvoiceId: string): Promise<DocumentItem[]> {
  return sql`
    SELECT * FROM document_items
    WHERE document_type = 'tax_invoice' AND document_id = ${taxInvoiceId}
    ORDER BY sort_order
  `
}

export async function createTaxInvoice(taxInvoice: {
  client_id: string
  project_id?: string
  issue_date: string
  supply_date: string
  status?: string
  cash?: number
  memo?: string
  items: { description: string; quantity: number; unit_price: number; amount: number }[]
}): Promise<TaxInvoice> {
  const totalAmount = taxInvoice.items.reduce((sum, item) => sum + item.amount, 0)
  const taxableAmount = totalAmount
  const taxRate = 0.1
  const taxAmount = Math.round(taxableAmount * taxRate)

  const result = await sql`
    INSERT INTO tax_invoices (
      document_number,
      client_id,
      project_id,
      issue_date,
      supply_date,
      status,
      total_amount,
      tax_amount,
      cash,
      taxable_amount,
      tax_rate,
      memo
    )
    VALUES (
      'TX-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      ${taxInvoice.client_id},
      ${taxInvoice.project_id ?? null},
      ${taxInvoice.issue_date},
      ${taxInvoice.supply_date},
      ${taxInvoice.status ?? "draft"},
      ${totalAmount},
      ${taxAmount},
      ${taxInvoice.cash ?? 0},
      ${taxableAmount},
      ${taxRate},
      ${taxInvoice.memo ?? null}
    )
    RETURNING *
  `

  const newTaxInvoice = result[0]

  for (let i = 0; i < taxInvoice.items.length; i++) {
    const item = taxInvoice.items[i]
    await sql`
      INSERT INTO document_items (document_type, document_id, description, quantity, unit_price, amount, sort_order)
      VALUES ('tax_invoice', ${newTaxInvoice.id}, ${item.description}, ${item.quantity}, ${item.unit_price}, ${item.amount}, ${i})
    `
  }

  return newTaxInvoice
}

// Contract queries
export async function getAllContracts(): Promise<Contract[]> {
  return sql`SELECT * FROM contracts ORDER BY created_at DESC`
}

export async function getContractById(id: string): Promise<Contract | null> {
  const results = await sql`SELECT * FROM contracts WHERE id = ${id}`
  return results[0] ?? null
}

export async function getContractItems(contractId: string): Promise<DocumentItem[]> {
  return sql`
    SELECT * FROM document_items
    WHERE document_type = 'contract' AND document_id = ${contractId}
    ORDER BY sort_order
  `
}

export async function createContract(contract: {
  client_id: string
  project_id?: string
  contract_date: string
  start_date: string
  end_date: string
  status?: string
  memo?: string
  terms?: string
  items: { description: string; quantity: number; unit_price: number; amount: number }[]
}): Promise<Contract> {
  const totalAmount = contract.items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = Math.round(totalAmount * 0.1)

  const result = await sql`
    INSERT INTO contracts (
      document_number,
      client_id,
      project_id,
      contract_date,
      start_date,
      end_date,
      status,
      total_amount,
      tax_amount,
      memo,
      terms
    )
    VALUES (
      'CT-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
      ${contract.client_id},
      ${contract.project_id ?? null},
      ${contract.contract_date},
      ${contract.start_date},
      ${contract.end_date},
      ${contract.status ?? "draft"},
      ${totalAmount},
      ${taxAmount},
      ${contract.memo ?? null},
      ${contract.terms ?? null}
    )
    RETURNING *
  `

  const newContract = result[0]

  for (let i = 0; i < contract.items.length; i++) {
    const item = contract.items[i]
    await sql`
      INSERT INTO document_items (document_type, document_id, description, quantity, unit_price, amount, sort_order)
      VALUES ('contract', ${newContract.id}, ${item.description}, ${item.quantity}, ${item.unit_price}, ${item.amount}, ${i})
    `
  }

  return newContract
}

// Expense queries
export async function getAllExpenses(): Promise<Expense[]> {
  return sql`SELECT * FROM expenses ORDER BY date DESC`
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  const results = await sql`SELECT * FROM expenses WHERE id = ${id}`
  return results[0] ?? null
}

export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<Expense[]> {
  return sql`
    SELECT * FROM expenses
    WHERE date >= ${startDate} AND date <= ${endDate}
    ORDER BY date DESC
  `
}

export async function getTotalExpenses(): Promise<number> {
  const result = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM expenses`
  return Number(result[0].total)
}

export async function createExpense(expense: {
  date: string
  category: string
  description: string
  amount: number
  client_id?: string
  project_id?: string
  receipt_url?: string
}): Promise<Expense> {
  const results = await sql`
    INSERT INTO expenses (date, category, description, amount, client_id, project_id, receipt_url)
    VALUES (
      ${expense.date},
      ${expense.category},
      ${expense.description},
      ${expense.amount},
      ${expense.client_id ?? null},
      ${expense.project_id ?? null},
      ${expense.receipt_url ?? null}
    )
    RETURNING *
  `
  return results[0]
}

export async function updateExpense(
  id: string,
  expense: Partial<Expense>
): Promise<Expense | null> {
  const results = await sql`
    UPDATE expenses SET
      date = COALESCE(${expense.date ?? null}, date),
      category = COALESCE(${expense.category ?? null}, category),
      description = COALESCE(${expense.description ?? null}, description),
      amount = COALESCE(${expense.amount ?? null}, amount),
      client_id = COALESCE(${expense.client_id ?? null}, client_id),
      project_id = COALESCE(${expense.project_id ?? null}, project_id),
      receipt_url = COALESCE(${expense.receipt_url ?? null}, receipt_url),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `
  return results[0] ?? null
}

export async function deleteExpense(id: string): Promise<void> {
  await sql`DELETE FROM expenses WHERE id = ${id}`
}
