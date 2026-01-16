"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface AccountStepProps {
  defaultEmail?: string
  defaultName?: string
  defaultCompany?: string
  onComplete: (user: {
    id: string
    email: string
    name: string
    company: string
  }) => void
}

type Mode = "check" | "login" | "signup"

export function OrderStepAccount({
  defaultEmail = "",
  defaultName = "",
  defaultCompany = "",
  onComplete,
}: AccountStepProps) {
  const [mode, setMode] = useState<Mode>("check")
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState(defaultName)
  const [company, setCompany] = useState(defaultCompany)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckEmail = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.exists) {
        setMode("login")
      } else {
        setMode("signup")
      }
    } catch {
      // If API doesn't exist yet, default to signup
      setMode("signup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!password) {
      setError("Please enter your password")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      onComplete(data.user)
    } catch {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!name) {
      setError("Please enter your name")
      return
    }
    if (!company) {
      setError("Please enter your company name")
      return
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          company,
          userType: "end_user",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        return
      }

      onComplete(data.user)
    } catch {
      setError("An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">
          {mode === "check" && "Create Your Account"}
          {mode === "login" && "Welcome Back"}
          {mode === "signup" && "Complete Registration"}
        </h3>
        <p className="text-sm text-[#808090]">
          {mode === "check" &&
            "Enter your email to get started with your order"}
          {mode === "login" &&
            "Sign in to continue with your order"}
          {mode === "signup" &&
            "Create your account to track your order status"}
        </p>
      </div>

      <Card className="bg-[#12121a] border-white/10">
        <CardContent className="pt-6 space-y-4">
          {/* Email Field - Always Shown */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#b0b0c0]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) =>
                mode === "check" && handleKeyDown(e, handleCheckEmail)
              }
              disabled={mode !== "check" || isLoading}
              placeholder="you@company.com"
              className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] h-12"
            />
          </div>

          {/* Check Email Button */}
          {mode === "check" && (
            <Button
              type="button"
              onClick={handleCheckEmail}
              disabled={isLoading}
              className="w-full bg-electric-gradient shadow-electric hover:shadow-electric-lg h-12"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Checking...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#b0b0c0]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                  placeholder="Enter your password"
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] h-12"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("check")}
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  Change Email
                </Button>
                <Button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="flex-1 bg-electric-gradient shadow-electric hover:shadow-electric-lg"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#b0b0c0]">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] h-12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#b0b0c0]">
                    Company
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc"
                    className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#b0b0c0]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#b0b0c0]">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleSignup)}
                  placeholder="Repeat your password"
                  className="bg-[#0a0a0f] border-white/10 text-white placeholder:text-[#606070] focus:border-[#0066ff] h-12"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMode("check")}
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  Change Email
                </Button>
                <Button
                  type="button"
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="flex-1 bg-electric-gradient shadow-electric hover:shadow-electric-lg"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-[#ff4466]/10 border border-[#ff4466]/30 rounded-lg p-3 text-center">
              <p className="text-[#ff4466] text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Info */}
      <div className="bg-[#0066ff]/10 border border-[#0066ff]/20 rounded-xl p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-[#0066ff] flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-[#b0b0c0]">
            <p className="font-medium text-white mb-1">
              Why create an account?
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#808090]">
              <li>Track your order status in real-time</li>
              <li>Access signed documents anytime</li>
              <li>Quick reordering for additional locations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
