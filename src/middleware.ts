import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
)

// Routes that require authentication
const protectedRoutes = ['/dashboard/bulk']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route needs protection
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Get session token from cookie
  const token = request.cookies.get('session')?.value

  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    // Invalid token - redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/dashboard/bulk/:path*'],
}
