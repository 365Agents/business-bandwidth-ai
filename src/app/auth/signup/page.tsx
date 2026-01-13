"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { signupSchema, type SignupFormValues } from "@/lib/validations/auth"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/dashboard/bulk"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      company: "",
      phone: "",
      userType: "end_user",
    },
  })

  async function onSubmit(values: SignupFormValues) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred during signup")
        return
      }

      router.push(returnTo)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-[#12121a] border-white/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
        <CardDescription className="text-[#808090]">
          Sign up for free to upload bulk quotes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#b0b0c0]">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      className="bg-[#1a1a24] border-white/10 text-white placeholder:text-[#505060]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#b0b0c0]">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      className="bg-[#1a1a24] border-white/10 text-white placeholder:text-[#505060]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#b0b0c0]">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Smith"
                      className="bg-[#1a1a24] border-white/10 text-white placeholder:text-[#505060]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#b0b0c0]">Company / Business Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Corp"
                      className="bg-[#1a1a24] border-white/10 text-white placeholder:text-[#505060]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#b0b0c0]">Phone (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="bg-[#1a1a24] border-white/10 text-white placeholder:text-[#505060]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[#b0b0c0]">I am...</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 gap-3">
                      <Label
                        htmlFor="agent"
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          field.value === "agent"
                            ? "border-[#0066ff] bg-[#0066ff]/10"
                            : "border-white/10 bg-[#1a1a24] hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          id="agent"
                          value="agent"
                          checked={field.value === "agent"}
                          onChange={() => field.onChange("agent")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === "agent" ? "border-[#0066ff]" : "border-white/30"
                        }`}>
                          {field.value === "agent" && (
                            <div className="w-2 h-2 rounded-full bg-[#0066ff]" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">A sales agent</div>
                          <div className="text-sm text-[#808090]">Getting quotes for clients</div>
                        </div>
                      </Label>

                      <Label
                        htmlFor="end_user"
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          field.value === "end_user"
                            ? "border-[#0066ff] bg-[#0066ff]/10"
                            : "border-white/10 bg-[#1a1a24] hover:border-white/20"
                        }`}
                      >
                        <input
                          type="radio"
                          id="end_user"
                          value="end_user"
                          checked={field.value === "end_user"}
                          onChange={() => field.onChange("end_user")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          field.value === "end_user" ? "border-[#0066ff]" : "border-white/30"
                        }`}>
                          {field.value === "end_user" && (
                            <div className="w-2 h-2 rounded-full bg-[#0066ff]" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">A business owner</div>
                          <div className="text-sm text-[#808090]">Getting quotes for my business</div>
                        </div>
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-electric-gradient shadow-electric hover:shadow-electric-lg transition-all"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-[#808090]">
              Already have an account?{" "}
              <Link href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`} className="text-[#0066ff] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
