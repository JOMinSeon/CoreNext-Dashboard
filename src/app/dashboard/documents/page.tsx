"use client"

import Link from "next/link"
import { useDocumentStore } from "@/store/document-store"
import { useProjectStore } from "@/store/project-store"
import { useClientStore } from "@/store/client-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Receipt, Calculator, FileSignature, Plus, ArrowRight } from "lucide-react"

const documentTypes = [
  {
    title: "견적서",
    href: "/documents/quotes",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    count: () => useDocumentStore.getState().quotes.length,
    description: "거래처에 대한 제품/서비스 가격 제안",
  },
  {
    title: "거래명세서",
    href: "/documents/invoices",
    icon: Receipt,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    count: () => useDocumentStore.getState().invoices.length,
    description: "제공한 제품/서비스의 거래 내역",
  },
  {
    title: "세금계산서",
    href: "/documents/tax-invoices",
    icon: Calculator,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    count: () => useDocumentStore.getState().taxInvoices.length,
    description: "부가세 신고용 세금 계산서",
  },
  {
    title: "계약서",
    href: "/documents/contracts",
    icon: FileSignature,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    count: () => useDocumentStore.getState().contracts.length,
    description: "서비스 제공을 위한 계약 문서",
  },
]

export default function DocumentsPage() {
  const { quotes, invoices, taxInvoices, contracts } = useDocumentStore()
  const { projects } = useProjectStore()
  const { clients } = useClientStore()

  const totalDocuments = quotes.length + invoices.length + taxInvoices.length + contracts.length
  const totalAmount = [
    ...quotes,
    ...invoices,
    ...taxInvoices,
    ...contracts,
  ].reduce((sum, doc) => sum + doc.totalAmount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">문서 관리</h1>
        <p className="mt-2 text-gray-500">
          총 {totalDocuments}개의 문서가 등록되어 있습니다
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {documentTypes.map((docType) => {
          const Icon = docType.icon
          const count = docType.count()
          return (
            <Card
              key={docType.title}
              className={`border-2 ${docType.borderColor} hover:shadow-md transition-shadow`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{docType.title}</CardTitle>
                <div className={`p-2 rounded-lg ${docType.bgColor}`}>
                  <Icon className={`h-5 w-5 ${docType.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{count}</div>
                <p className="text-sm text-gray-500 mt-1">{docType.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              견적서
            </CardTitle>
            <CardDescription>최근 등록된 견적서</CardDescription>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>아직 등록된 견적서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.slice(0, 3).map((quote) => {
                  const client = clients.find((c) => c.id === quote.clientId)
                  return (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{quote.documentNumber}</p>
                        <p className="text-sm text-gray-500">{client?.name || "-"}</p>
                      </div>
                      <Badge variant={quote.status === "issued" ? "default" : "secondary"}>
                        {quote.status === "issued" ? "발행" : "임시"}
                      </Badge>
                    </div>
                  )
                })}
                {quotes.length > 3 && (
                  <Link
                    href="/documents/quotes"
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:underline mt-4"
                  >
                    더보기 <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              거래명세서
            </CardTitle>
            <CardDescription>최근 등록된 거래명세서</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>아직 등록된 거래명세서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => {
                  const client = clients.find((c) => c.id === invoice.clientId)
                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{invoice.documentNumber}</p>
                        <p className="text-sm text-gray-500">{client?.name || "-"}</p>
                      </div>
                      <Badge variant={invoice.status === "confirmed" ? "default" : "secondary"}>
                        {invoice.status === "confirmed" ? "확인" : "대기"}
                      </Badge>
                    </div>
                  )
                })}
                {invoices.length > 3 && (
                  <Link
                    href="/documents/invoices"
                    className="flex items-center justify-center gap-2 text-sm text-green-600 hover:underline mt-4"
                  >
                    더보기 <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              세금계산서
            </CardTitle>
            <CardDescription>최근 등록된 세금계산서</CardDescription>
          </CardHeader>
          <CardContent>
            {taxInvoices.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>아직 등록된 세금계산서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taxInvoices.slice(0, 3).map((taxInvoice) => {
                  const client = clients.find((c) => c.id === taxInvoice.clientId)
                  return (
                    <div
                      key={taxInvoice.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{taxInvoice.documentNumber}</p>
                        <p className="text-sm text-gray-500">{client?.name || "-"}</p>
                      </div>
                      <Badge variant="default">
                        {formatCurrency(taxInvoice.totalAmount)}
                      </Badge>
                    </div>
                  )
                })}
                {taxInvoices.length > 3 && (
                  <Link
                    href="/documents/tax-invoices"
                    className="flex items-center justify-center gap-2 text-sm text-purple-600 hover:underline mt-4"
                  >
                    더보기 <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-orange-600" />
              계약서
            </CardTitle>
            <CardDescription>최근 등록된 계약서</CardDescription>
          </CardHeader>
          <CardContent>
            {contracts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>아직 등록된 계약서가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.slice(0, 3).map((contract) => {
                  const client = clients.find((c) => c.id === contract.clientId)
                  return (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{contract.documentNumber}</p>
                        <p className="text-sm text-gray-500">{client?.name || "-"}</p>
                      </div>
                      <Badge variant="outline">
                        {contract.startDate} ~ {contract.endDate}
                      </Badge>
                    </div>
                  )
                })}
                {contracts.length > 3 && (
                  <Link
                    href="/documents/contracts"
                    className="flex items-center justify-center gap-2 text-sm text-orange-600 hover:underline mt-4"
                  >
                    더보기 <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
