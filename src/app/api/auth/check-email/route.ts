import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const checkEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = checkEmailSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email } = result.data

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({
      exists: !!existingUser,
    })
  } catch (error) {
    console.error("Check email error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
