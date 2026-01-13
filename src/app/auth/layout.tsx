import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-display text-3xl font-semibold tracking-tight">
              Network<span className="text-[#0066ff] text-glow">GPT</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
