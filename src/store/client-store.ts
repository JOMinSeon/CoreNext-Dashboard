import { create } from "zustand"

export interface Client {
  id: string
  name: string
  businessNumber: string
  ownerName: string
  email: string
  phone: string
  address: string
  industry: string
  memo: string
  createdAt: string
}

interface ClientStore {
  clients: Client[]
  addClient: (client: Omit<Client, "id" | "createdAt">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  getClient: (id: string) => Client | undefined
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  addClient: (client) =>
    set((state) => ({
      clients: [
        ...state.clients,
        {
          ...client,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateClient: (id, updatedClient) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...updatedClient } : c
      ),
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),
  getClient: (id) => get().clients.find((c) => c.id === id),
}))
