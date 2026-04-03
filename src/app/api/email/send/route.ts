import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, html, documentType, documentNumber } = body

    if (!to || !subject) {
      return NextResponse.json(
        { message: "수신자와 제목은 필수입니다" },
        { status: 400 }
      )
    }

    const gmailUser = process.env.GMAIL_USER
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        { message: "이메일 서비스가 설정되지 않았습니다" },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    const documentLabel = {
      quote: "견적서",
      invoice: "청구서",
      tax: "세금계산서",
      contract: "계약서",
    }[documentType] || "문서"

    const mailOptions = {
      from: gmailUser,
      to,
      subject,
      html: html || `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333;">${documentLabel}</h1>
          <p><strong>문서번호:</strong> ${documentNumber}</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #666;">위 문서를 확인해주세요.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      message: "이메일이 전송되었습니다",
    })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { message: "이메일 전송에 실패했습니다" },
      { status: 500 }
    )
  }
}
