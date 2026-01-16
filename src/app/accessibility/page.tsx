import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility | Momentum Telecom",
  description: "Momentum Telecom Accessibility Statement - Our commitment to inclusive products and services.",
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="container max-w-4xl py-16 px-4">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-[#808090]">Momentum Telecom, Inc.</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-8 text-[#b0b0c0]">

            <section>
              <div className="bg-[#0066ff]/10 border border-[#0066ff]/30 rounded-xl p-6 mb-8">
                <p className="text-lg text-white font-medium">
                  We strive to make our products and services accessible to all customers,
                  including those with disabilities.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Our Commitment
              </h2>
              <p className="mb-4">
                Momentum Telecom is committed to ensuring digital accessibility for people
                with disabilities. We are continually improving the user experience for
                everyone and applying the relevant accessibility standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Web Content Accessibility Guidelines (WCAG)
              </h2>
              <p className="mb-4">
                Our website meets <strong className="text-white">Level AA conformance</strong> requirements
                outlined in the Web Content Accessibility Guidelines (WCAG) 2.1.
              </p>
              <p>
                These guidelines explain how to make web content more accessible for people
                with disabilities, and user friendly for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Accessibility Plan
              </h2>
              <p className="mb-4">
                We have developed a formal accessibility plan documenting our efforts to
                identify and remove barriers for individuals with disabilities. This plan
                is available for public review.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white hover:border-[#0066ff]/50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2 text-[#0066ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Accessibility Plan (PDF)
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white hover:border-[#0066ff]/50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2 text-[#0066ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Progress Report 2025 (PDF)
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Feedback
              </h2>
              <p className="mb-4">
                We welcome your feedback on the accessibility of our website and services.
                Please let us know if you encounter accessibility barriers.
              </p>
              <p className="mb-6">
                You may submit accessibility feedback anonymously or with your contact
                information. All feedback is collected to address concerns and improve
                our services. Your personal information will not be shared with third parties.
              </p>

              <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#808090] text-sm mb-1">Email</p>
                    <a
                      href="mailto:accessibility@gomomentum.com"
                      className="text-[#0066ff] hover:underline text-lg"
                    >
                      accessibility@gomomentum.com
                    </a>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[#808090] text-sm mb-1">Accessibility Contact</p>
                    <p className="text-white font-medium">Joe Coomes</p>
                    <p className="text-[#b0b0c0]">SVP &amp; General Counsel</p>
                    <a
                      href="mailto:joe.coomes@gomomentum.com"
                      className="text-[#0066ff] hover:underline"
                    >
                      joe.coomes@gomomentum.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Continuous Improvement
              </h2>
              <p>
                We are committed to ongoing improvement of accessibility across all our
                digital properties. Our accessibility plan includes regular audits,
                accountability designations, and commitment to addressing any barriers
                identified through user feedback or internal review.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Contact Us
              </h2>
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
                <p className="mb-2">
                  <strong className="text-white">Momentum Telecom, Inc.</strong>
                </p>
                <p>
                  2 Ravinia Drive, Suite 1630<br />
                  Atlanta, Georgia 30346
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
