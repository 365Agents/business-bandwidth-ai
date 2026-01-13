import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#050508]/95 backdrop-blur supports-[backdrop-filter]:bg-[#050508]/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Network<span className="text-[#0066ff] text-glow">GPT</span>
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-[#808090] transition-colors hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#808090] transition-colors hover:text-white"
          >
            Dashboard
          </Link>
          <Button asChild className="bg-electric-gradient shadow-electric hover:shadow-electric-lg transition-all hover:-translate-y-0.5">
            <Link href="/quote">Get Quote</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
