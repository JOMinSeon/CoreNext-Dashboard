"use client"

import { useState } from "react"
import { useProjectStore, Project, ProjectStatus } from "@/store/project-store"
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
import { Plus, MoreHorizontal, Pencil, Trash2, Search, FolderKanban } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const projectSchema = z.object({
  name: z.string().min(1, "프로젝트명은 필수입니다"),
  clientId: z.string().min(1, "거래처를 선택해주세요"),
  status: z.enum(["pending", "active", "completed", "cancelled"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  amount: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

const statusLabels: Record<ProjectStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "대기중", variant: "secondary" },
  active: { label: "진행중", variant: "default" },
  completed: { label: "완료", variant: "outline" },
  cancelled: { label: "취소", variant: "destructive" },
}

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject } = useProjectStore()
  const { clients } = useClientStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "pending",
      amount: 0,
    },
  })

  const selectedStatus = watch("status")
  const selectedClientId = watch("clientId")

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddDialog = () => {
    setEditingProject(null)
    reset({
      name: "",
      clientId: "",
      status: "pending",
      startDate: "",
      endDate: "",
      amount: 0,
      description: "",
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    reset({
      name: project.name,
      clientId: project.clientId,
      status: project.status,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      amount: project.amount,
      description: project.description || "",
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: ProjectForm) => {
    if (editingProject) {
      updateProject(editingProject.id, data)
    } else {
      addProject(data)
    }
    setIsDialogOpen(false)
    reset()
  }

  const handleDelete = (project: Project) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id)
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">프로젝트 관리</h1>
          <p className="mt-2 text-gray-500">
            총 {projects.length}개의 프로젝트가 등록되어 있습니다
          </p>
        </div>
        <Button onClick={openAddDialog} disabled={clients.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          프로젝트 추가
        </Button>
      </div>

      {clients.length === 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-4 py-4">
            <FolderKanban className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">거래처를 먼저 등록해주세요</p>
              <p className="text-sm text-yellow-600">
                프로젝트를 생성하려면 거래처가 필요합니다
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="프로젝트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery ? "검색 결과가 없습니다" : "아직 등록된 프로젝트가 없습니다"}
              </p>
              {!searchQuery && clients.length > 0 && (
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 프로젝트 추가
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로젝트명</TableHead>
                  <TableHead>거래처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const status = statusLabels[project.status]
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{getClientName(project.clientId)}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {project.startDate && project.endDate
                          ? `${project.startDate} ~ ${project.endDate}`
                          : project.startDate || project.endDate || "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(project.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(project)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(project)}
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
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "프로젝트 수정" : "프로젝트 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingProject
                ? "프로젝트 정보를 수정합니다"
                : "새 프로젝트를 등록합니다"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  프로젝트명 <span className="text-red-500">*</span>
                </Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientId">
                  거래처 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedClientId}
                  onValueChange={(value) => setValue("clientId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="거래처를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-sm text-red-500">{errors.clientId.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">상태</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value: ProjectStatus) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="active">진행중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="cancelled">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="amount">금액</Label>
                <Input
                  id="amount"
                  type="number"
                  {...register("amount")}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "")
                    e.target.value = value
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" {...register("description")} rows={3} />
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
                {editingProject ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 삭제</DialogTitle>
            <DialogDescription>
              {`"${projectToDelete?.name}"`} 프로젝트를 삭제하시겠습니까?
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
