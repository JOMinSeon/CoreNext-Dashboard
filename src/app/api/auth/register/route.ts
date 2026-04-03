import { NextResponse } from "next/server"
import { users } from "@/lib/users"

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

    const existingUser = users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: "이미 존재하는 이메일입니다" },
        { status: 400 }
      )
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      position,
      password,
    }
    users.push(newUser)

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
