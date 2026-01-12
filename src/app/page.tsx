import { Card, CardContent } from "@/components/ui/card"
import { AddressInput } from "@/components/address-input"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Google-style */}
      <section className="container py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get Business Internet Quotes{" "}
            <span className="text-primary">Anywhere on Earth</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Compare pricing from 200+ carriers worldwide. Get quotes in 2-3 minutes.
            Business addresses only.
          </p>

          {/* Address Input - Google-style */}
          <div className="max-w-xl mx-auto pt-4">
            <AddressInput />
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="container py-16 border-t">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">200+</div>
              <h3 className="font-semibold">Carriers</h3>
              <p className="text-sm text-muted-foreground">
                We query over 200 carriers to find the best rates for your location.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">2-3 min</div>
              <h3 className="font-semibold">Quote Time</h3>
              <p className="text-sm text-muted-foreground">
                Get comprehensive pricing in just a few minutes, not days.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <div className="text-4xl font-bold text-primary">Global</div>
              <h3 className="font-semibold">Coverage</h3>
              <p className="text-sm text-muted-foreground">
                Business internet quotes for locations worldwide with currency conversion.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="font-semibold">Enter Address</h3>
            <p className="text-sm text-muted-foreground">
              Provide your business address for verification
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="font-semibold">Choose Speed</h3>
            <p className="text-sm text-muted-foreground">
              Select bandwidth and contract term
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="font-semibold">Get Quotes</h3>
            <p className="text-sm text-muted-foreground">
              We check 200+ carriers in real-time
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
              4
            </div>
            <h3 className="font-semibold">Receive Quote</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed pricing via email
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
