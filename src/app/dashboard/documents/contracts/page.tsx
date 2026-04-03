"use client"

import { useState } from "react"
import { useDocumentStore, Contract, DocumentStatus } from "@/store/document-store"
import { useClientStore } from "@/store/client-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, MoreHorizontal, Pencil, Trash2, Search, FileSignature, Download } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DocumentItemSchema, createContractSchema } from "@/lib/schemas"
import { exportContractToPDF } from "@/lib/pdf-export"

const contractSchema = createContractSchema

type ContractForm = z.infer<typeof contractSchema>

const statusLabels: Record<DocumentStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "임시", variant: "secondary" },
  issued: { label: "발행", variant: "default" },
  confirmed: { label: "확인", variant: "outline" },
  cancelled: { label: "취소", variant: "secondary" },
}

export default function ContractsPage() {
  const { contracts, addContract, updateContract, deleteContract } = useDocumentStore()
  const { clients } = useClientStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
  } = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      items: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")

  const filteredContracts = contracts.filter((contract) =>
    contract.documentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddDialog = () => {
    setEditingContract(null)
    reset({
      clientId: "",
      projectId: "",
      contractDate: new Date().toISOString().split("T")[0],
      startDate: "",
      endDate: "",
      status: "draft",
      items: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
      memo: "",
      terms: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (contract: Contract) => {
    setEditingContract(contract)
    reset({
      clientId: contract.clientId,
      projectId: contract.projectId || "",
      contractDate: contract.contractDate,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      items: contract.items,
      memo: contract.memo || "",
      terms: contract.terms || "",
    })
    setIsDialogOpen(true)
  }

  const calculateTotal = () => {
    return watchedItems.reduce((sum, item) => {
      const amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
      return sum + amount
    }, 0)
  }

  const onSubmit = (data: ContractForm) => {
    const totalAmount = data.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
    }, 0)

    const processedData = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        amount: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      })),
      totalAmount,
      taxAmount: Math.round(totalAmount * 0.1),
    }

    if (editingContract) {
      updateContract(editingContract.id, processedData)
    } else {
      addContract(processedData)
    }
    setIsDialogOpen(false)
    reset()
  }

  const handleDelete = (contract: Contract) => {
    setContractToDelete(contract)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete.id)
      setIsDeleteDialogOpen(false)
      setContractToDelete(null)
    }
  }

  const handleDownload = (contract: Contract) => {
    const client = clients.find((c) => c.id === contract.clientId)
    exportContractToPDF(contract, client, contract.items)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "알 수 없음"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">계약서</h1>
          <p className="mt-2 text-gray-500">
            총 {contracts.length}개의 계약서가 있습니다
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          계약서 작성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="계약서 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                {searchQuery ? "검색 결과가 없습니다" : "아직 등록된 계약서가 없습니다"}
              </p>
              {!searchQuery && (
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 계약서 작성
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>문서번호</TableHead>
                  <TableHead>거래처</TableHead>
                  <TableHead>계약일</TableHead>
                  <TableHead>계약기간</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const status = statusLabels[contract.status]
                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.documentNumber}</TableCell>
                      <TableCell>{getClientName(contract.clientId)}</TableCell>
                      <TableCell>{contract.contractDate}</TableCell>
                      <TableCell>
                        {contract.startDate} ~ {contract.endDate}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(contract.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(contract)}>
                              <Download className="h-4 w-4 mr-2" />
                              PDF 다운로드
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(contract)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(contract)}>
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContract ? "계약서 수정" : "계약서 작성"}
            </DialogTitle>
            <DialogDescription>
              {editingContract ? "계약서 정보를 수정합니다" : "새 계약서를 작성합니다"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientId">
                    거래처 <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("clientId")}
                    onValueChange={(value) => setValue("clientId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="거래처 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">상태</Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value: DocumentStatus) => setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">임시</SelectItem>
                      <SelectItem value="issued">발행</SelectItem>
                      <SelectItem value="confirmed">확인</SelectItem>
                      <SelectItem value="cancelled">취소</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contractDate">계약일</Label>
                  <Input id="contractDate" type="date" {...register("contractDate")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">시작일</Label>
                  <Input id="startDate" type="date" {...register("startDate")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">종료일</Label>
                  <Input id="endDate" type="date" {...register("endDate")} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>품목</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">품목명</TableHead>
                        <TableHead>수량</TableHead>
                        <TableHead>단가</TableHead>
                        <TableHead>금액</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const itemAmount = (Number(watchedItems[index]?.quantity) || 0) * (Number(watchedItems[index]?.unitPrice) || 0)
                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Input
                                placeholder="품목명"
                                {...register(`items.${index}.description`)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0
                                  setValue(`items.${index}.quantity`, val)
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0
                                  setValue(`items.${index}.unitPrice`, val)
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(itemAmount)}
                            </TableCell>
                            <TableCell>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                  <div className="p-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ description: "", quantity: 1, unitPrice: 0, amount: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      품목 추가
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 text-sm">
                <div className="text-right">
                  <span className="text-gray-500">합계:</span>
                  <span className="ml-2 font-medium">{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-500">VAT(10%):</span>
                  <span className="ml-2 font-medium">{formatCurrency(Math.round(calculateTotal() * 0.1))}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">총계:</span>
                  <span className="ml-2 font-bold">{formatCurrency(Math.round(calculateTotal() * 1.1))}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="terms">계약조건</Label>
                <Textarea id="terms" {...register("terms")} placeholder="계약조건 입력" rows={3} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="memo">메모</Label>
                <Textarea id="memo" {...register("memo")} placeholder="메모 입력" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit">
                {editingContract ? "수정" : "작성"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계약서 삭제</DialogTitle>
            <DialogDescription>
              이 계약서를 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
