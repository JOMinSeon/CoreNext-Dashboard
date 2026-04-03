import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = req.nextUrl.pathname === "/"

  if (isApiAuthRoute || isAuthPage || isPublicRoute) {
    return
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
