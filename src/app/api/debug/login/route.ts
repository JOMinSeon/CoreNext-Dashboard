import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { compare } from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const users = await sql`
      SELECT id, name, email, position, password 
      FROM users 
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found",
        email 
      })
    }

    const user = users[0]
    const match = await compare(password, user.password)

    return NextResponse.json({
      success: match,
      message: match ? "Login would succeed" : "Password does not match",
      storedHash: user.password,
      inputPassword: password,
      email: user.email,
      name: user.name
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error",
      error: String(error)
    })
  }
}
