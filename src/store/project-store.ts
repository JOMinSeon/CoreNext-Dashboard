import { create } from "zustand"

export type ProjectStatus = "pending" | "active" | "completed" | "cancelled"

export interface Project {
  id: string
  name: string
  clientId: string
  status: ProjectStatus
  startDate: string
  endDate: string
  amount: number
  description: string
  createdAt: string
}

interface ProjectStore {
  projects: Project[]
  addProject: (project: Omit<Project, "id" | "createdAt">) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
  getProjectsByClient: (clientId: string) => Project[]
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  addProject: (project) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateProject: (id, updatedProject) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updatedProject } : p
      ),
    })),
  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
  getProject: (id) => get().projects.find((p) => p.id === id),
  getProjectsByClient: (clientId) =>
    get().projects.filter((p) => p.clientId === clientId),
}))
