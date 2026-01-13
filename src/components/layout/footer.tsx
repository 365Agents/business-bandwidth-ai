import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#0a0a0f]">
      <div className="container">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" className="font-display text-2xl font-semibold">
            Network<span className="text-[#0066ff]">GPT</span>
          </Link>
          <p className="text-sm text-[#505060]">
            Powered by{" "}
            <a
              href="https://gomomentum.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00c9a7] hover:underline"
            >
              Momentum
            </a>
          </p>
          <p className="text-xs text-[#505060]">
            &copy; {new Date().getFullYear()} NetworkGPT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
