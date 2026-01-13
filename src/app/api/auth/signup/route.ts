import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  userType: z.enum(['agent', 'end_user']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = signupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, name, company, phone, userType } = result.data

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        company,
        phone,
        userType,
      },
    })

    // Create session token
    const token = await createToken(user.id)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
    })

    const cookie = setSessionCookie(token)
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
}
