"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"

export default function RootPage() {
  const { data: session, status } = useSession()

  if (status === "authenticated") {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}