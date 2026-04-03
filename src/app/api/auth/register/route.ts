import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hash } from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, position, password } = body

    if (!name || !email || !position || !password) {
      return NextResponse.json(
        { message: "모든 필드를 입력해주세요" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "이미 존재하는 이메일입니다" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    await sql`
      INSERT INTO users (name, email, position, password)
      VALUES (${name}, ${email}, ${position}, ${hashedPassword})
    `

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다" },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
