import { AddressInput } from "@/components/address-input"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - NetworkGPT Style */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(0,102,255,0.1)_0%,transparent_70%)] animate-pulse" />

        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Main Logo/Title */}
            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight">
              Network<span className="text-[#0066ff] text-glow">GPT</span>
            </h1>

            {/* Tagline */}
            <p className="font-mono text-sm tracking-[0.25em] uppercase text-[#808090]">
              Worldwide Internet Quotes
            </p>

            {/* Subtext */}
            <p className="text-lg text-[#b0b0c0] max-w-xl mx-auto">
              200+ carriers. One best price for your location.
            </p>

            {/* Address Input */}
            <div className="max-w-xl mx-auto pt-6 relative z-50">
              <AddressInput />
            </div>

            {/* Powered by */}
            <p className="text-xs tracking-[0.2em] uppercase text-[#505060] pt-4">
              powered by <span className="text-[#00c9a7] font-semibold">Momentum</span>
            </p>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container py-20 border-t border-white/5">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#12121a] border border-white/5 rounded-2xl p-8 text-center space-y-4 hover:border-[#0066ff]/30 hover:shadow-[0_0_60px_rgba(0,102,255,0.1)] transition-all">
            <div className="font-display text-5xl font-bold text-[#0066ff]">200+</div>
            <h3 className="font-semibold text-lg">Carriers</h3>
            <p className="text-sm text-[#808090]">
              We query over 200 carriers to find the best rates for your location.
            </p>
          </div>
          <div className="bg-[#12121a] border border-white/5 rounded-2xl p-8 text-center space-y-4 hover:border-[#0066ff]/30 hover:shadow-[0_0_60px_rgba(0,102,255,0.1)] transition-all">
            <div className="font-display text-5xl font-bold text-[#00d4ff]">2-3 min</div>
            <h3 className="font-semibold text-lg">Quote Time</h3>
            <p className="text-sm text-[#808090]">
              Get comprehensive pricing in just a few minutes, not days.
            </p>
          </div>
          <div className="bg-[#12121a] border border-white/5 rounded-2xl p-8 text-center space-y-4 hover:border-[#0066ff]/30 hover:shadow-[0_0_60px_rgba(0,102,255,0.1)] transition-all">
            <div className="font-display text-5xl font-bold text-[#00c9a7]">Global</div>
            <h3 className="font-semibold text-lg">Coverage</h3>
            <p className="text-sm text-[#808090]">
              Business internet quotes for locations worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-[#0066ff] mb-4">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold">
            Simple. Fast. Accurate.
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-electric-cyan-gradient flex items-center justify-center mx-auto text-xl font-bold shadow-electric">
              1
            </div>
            <h3 className="font-semibold">Enter Address</h3>
            <p className="text-sm text-[#808090]">
              Provide your business address for verification
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-electric-cyan-gradient flex items-center justify-center mx-auto text-xl font-bold shadow-electric">
              2
            </div>
            <h3 className="font-semibold">Choose Speed</h3>
            <p className="text-sm text-[#808090]">
              Select bandwidth and contract term
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-electric-cyan-gradient flex items-center justify-center mx-auto text-xl font-bold shadow-electric">
              3
            </div>
            <h3 className="font-semibold">AI Queries Carriers</h3>
            <p className="text-sm text-[#808090]">
              We check 200+ carriers in real-time
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-electric-cyan-gradient flex items-center justify-center mx-auto text-xl font-bold shadow-electric">
              4
            </div>
            <h3 className="font-semibold">Get Best Price</h3>
            <p className="text-sm text-[#808090]">
              Receive your optimized quote instantly
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
