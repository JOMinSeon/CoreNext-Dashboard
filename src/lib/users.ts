export interface User {
  id: string
  name: string
  email: string
  position: string
  password: string
}

export const users: User[] = [
  {
    id: "1",
    name: "사업자",
    email: "admin@example.com",
    position: "ceo",
    password: "demo1234",
  },
]
