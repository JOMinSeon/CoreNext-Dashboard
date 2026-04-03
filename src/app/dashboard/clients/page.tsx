"use client"

import { useState } from "react"
import { useClientStore, Client } from "@/store/client-store"
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
import { Plus, MoreHorizontal, Pencil, Trash2, Mail, Phone, MapPin, Search, Building2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(1, "거래처명은 필수입니다"),
  businessNumber: z.string().optional(),
  ownerName: z.string().optional(),
  email: z.string().email("유효한 이메일을 입력하세요").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  memo: z.string().optional(),
})

type ClientForm = z.infer<typeof clientSchema>

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClientStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
  })

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.businessNumber?.includes(searchQuery) ||
    client.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddDialog = () => {
    setEditingClient(null)
    reset({
      name: "",
      businessNumber: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      memo: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client)
    reset({
      name: client.name,
      businessNumber: client.businessNumber || "",
      ownerName: client.ownerName || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      industry: client.industry || "",
      memo: client.memo || "",
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: ClientForm) => {
    if (editingClient) {
      updateClient(editingClient.id, data)
    } else {
      addClient(data)
    }
    setIsDialogOpen(false)
    reset()
  }

  const handleDelete = (client: Client) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id)
      setIsDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">거래처 관리</h1>
          <p className="mt-2 text-gray-500">
            총 {clients.length}개의 거래처가 등록되어 있습니다
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          거래처 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="거래처명, 사업자번호, 대표자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery ? "검색 결과가 없습니다" : "아직 등록된 거래처가 없습니다"}
              </p>
              {!searchQuery && (
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 거래처 추가
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>거래처명</TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead>대표자</TableHead>
                  <TableHead>업종</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.businessNumber || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      {client.ownerName || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      {client.industry ? (
                        <Badge variant="outline">{client.industry}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {client.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(client)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(client)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "거래처 수정" : "거래처 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingClient
                ? "거래처 정보를 수정합니다"
                : "새 거래처를 등록합니다"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  거래처명 <span className="text-red-500">*</span>
                </Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="businessNumber">사업자번호</Label>
                  <Input id="businessNumber" placeholder="000-00-00000" {...register("businessNumber")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ownerName">대표자명</Label>
                  <Input id="ownerName" {...register("ownerName")} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industry">업종</Label>
                <Input id="industry" placeholder="예: IT 서비스, 제조업" {...register("industry")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">주소</Label>
                <Input id="address" {...register("address")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="memo">메모</Label>
                <Textarea id="memo" {...register("memo")} rows={3} />
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
                {editingClient ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>거래처 삭제</DialogTitle>
            <DialogDescription>
              {`"${clientToDelete?.name}"`} 거래처를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
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
