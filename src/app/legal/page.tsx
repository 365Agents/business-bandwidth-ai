import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Legal | Momentum Telecom Master Service Agreement",
  description: "Momentum Telecom Master Services Agreement - Terms and conditions for business communications services.",
}

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="container max-w-4xl py-16 px-4">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Master Services Agreement
          </h1>
          <p className="text-[#808090]">Momentum Telecom, Inc.</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="space-y-8 text-[#b0b0c0]">

            <section>
              <p className="text-lg leading-relaxed">
                This Master Services Agreement (&quot;Agreement&quot;) governs business communications
                services provided by Momentum Telecom, Inc. (&quot;Momentum,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
                covering voice, data, connectivity, and related products.
              </p>
            </section>

            {/* Emergency Services Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                1. Emergency Services - 911 Dialing
              </h2>
              <div className="bg-[#ff4466]/10 border border-[#ff4466]/30 rounded-xl p-6 mb-6">
                <p className="text-[#ff4466] font-semibold mb-2">IMPORTANT NOTICE</p>
                <p className="text-[#b0b0c0]">
                  The 911 service provided through Momentum has significant limitations compared
                  to traditional telephone service. Please read this section carefully.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Basic vs. Enhanced 911</h3>
              <p className="mb-4">
                Availability of Basic and Enhanced 911 service depends on your location.
                Service is tied to a specific permanent physical address registered with us.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Activation Confirmation</h3>
              <p className="mb-4 font-semibold text-white">
                YOU SHOULD NOT RELY UPON THE AVAILABILITY OF 911 DIALING WITHOUT FIRST
                CONFIRMING THAT SERVICE HAS BEEN ACTIVATED.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Service Outage Scenarios</h3>
              <p className="mb-4">
                911 access may be disabled during:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Internet service outages</li>
                <li>Power failures</li>
                <li>Account disconnection</li>
                <li>ISP port blocking</li>
                <li>Network congestion</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Non-Native Numbers</h3>
              <p className="mb-4">
                Using phone numbers from different exchanges may prevent emergency personnel
                from identifying your location.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">MLTS Notification</h3>
              <p className="mb-4">
                Multi-line telephone systems can send emergency notification emails when
                911 is dialed.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Liability Disclaimer</h3>
              <p>
                Momentum disclaims responsibility for emergency response center conduct
                and third-party routing errors.
              </p>
            </section>

            {/* Service Terms Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                2. Service Terms
              </h2>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Duration &amp; Termination</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Initial term length specified in Service Orders</li>
                <li>Auto-renews monthly unless terminated with proper notice</li>
                <li>60-day notice required to terminate at end of Initial Term</li>
                <li>30-day notice for Renewal Terms</li>
                <li>Early termination incurs liquidated damages equal to remaining Monthly Revenue Commitment</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Fair Use Policy</h3>
              <p className="mb-4">Prohibited activities include:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Excessive usage</li>
                <li>Auto-dialers</li>
                <li>Continuous call sessions</li>
                <li>Fax blasting</li>
                <li>Mass calling</li>
              </ul>
              <p className="mb-4">
                Momentum may terminate after 30 days&apos; notice with opportunity to cure.
                Suspicious violations may result in 10-day notice disconnection.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Prohibited Uses</h3>
              <p className="mb-4">
                Service is governed by Momentum&apos;s Acceptable Use Policy. The following
                conduct is prohibited:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illegal activities</li>
                <li>Threatening or abusive conduct</li>
                <li>Defamatory content</li>
                <li>Fraudulent activities</li>
                <li>Privacy-invasive conduct</li>
              </ul>
              <p className="mt-4">
                Momentum may disconnect service and forward communications to authorities.
                Customers must comply with all applicable laws and regulations.
              </p>
            </section>

            {/* Equipment Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                3. Equipment
              </h2>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Purchased Equipment</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Final sales policy after 5-day acceptance period</li>
                <li>Defects within warranty period returnable to manufacturer</li>
                <li>Customer pays all shipping fees</li>
                <li>10-day window to return equipment after receiving RMA number</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Rented Equipment</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Customers responsible for shipping costs (delivery and return)</li>
                <li>Must maintain secure location; customer liable for damage/loss</li>
                <li>End-of-contract options: renew, purchase at fair market value, or return</li>
                <li>60-day notice required; must return within 30 days of contract end</li>
                <li>Equipment must be returned in &quot;Good Working Order&quot;</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">General Restrictions</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>No shared, moved, modified, or routed access without written consent</li>
                <li>Cannot access through unauthorized equipment or media</li>
                <li>No reverse engineering, disassembly, or unauthorized modifications</li>
                <li>Non-exclusive, non-transferable license for business use only</li>
              </ul>
            </section>

            {/* Charges, Payments & Taxes Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                4. Charges, Payments &amp; Taxes
              </h2>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Billing</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Commences upon Service activation (or FOC Date for circuits)</li>
                <li>Monthly invoicing in advance (usage charges billed in arrears)</li>
                <li>Introductory pricing subject to change at company discretion</li>
                <li>Usage charges rounded up to nearest minute</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Payment Terms</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Due within 30 days of invoice date</li>
                <li>Late payment fee: lesser of 1.5% monthly or highest rate allowed by law</li>
                <li>10-day notice precedes termination for non-payment</li>
                <li>Non-payment after 15 days may trigger disconnection</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Billing Disputes</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Must be reported in writing within 30 days of invoice receipt</li>
                <li>Disputes waived if not timely reported</li>
                <li>Send disputes to Momentum Billing Department</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Taxes</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Customer responsible for all applicable federal, state, local taxes and fees</li>
                <li>Tax exemption requires original certificate satisfying legal requirements</li>
                <li>Charges based on provided address; customer responsible for updates</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Directory/Operator Assistance</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>$1.00 per 411 directory assistance call</li>
                <li>$3.00 per 0 operator assistance call</li>
              </ul>
            </section>

            {/* Limitation of Liability Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                5. Limitation of Liability &amp; Warranties
              </h2>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Liability Caps</h3>
              <p className="mb-4">
                Momentum shall not be liable for incidental, indirect, special, punitive,
                or consequential damages, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Data loss</li>
                <li>Lost profits</li>
                <li>Business interruption</li>
                <li>Goodwill loss</li>
              </ul>
              <p className="mb-4">
                Maximum liability is limited to amounts paid under applicable Service Orders
                during the preceding 12 months. This excludes unauthorized access unless
                resulting from Momentum gross negligence or willful misconduct.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Service Availability</h3>
              <p className="mb-4">
                No liability for delays caused by third parties, equipment failure, power
                loss, outages, or customer actions. This includes communication failures
                and 911 dialing interruptions.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Limited Warranty</h3>
              <p className="mb-4">
                Momentum warrants right to provide Service, non-infringement, and professional
                performance. If deficiency is uncorrected within reasonable timeframe, either
                party may terminate without penalty. Remedies limited to deficiency correction
                or termination. Hardware provided &quot;AS IS&quot;; manufacturer warranties apply exclusively.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Excluded Warranties</h3>
              <p className="font-semibold text-white">
                NO IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR PARTICULAR PURPOSE.
                NO WARRANTY OF UNINTERRUPTED, ERROR-FREE, OR QUALITY-MAINTAINED SERVICE.
              </p>
            </section>

            {/* Indemnification Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                6. Indemnification
              </h2>
              <p className="mb-4">
                Customer shall defend and indemnify Momentum from third-party claims arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customer breach of agreement terms</li>
                <li>Customer negligence or willful misconduct</li>
                <li>Personal injury or property damage caused by customer</li>
                <li>911 service liability as detailed in Section 1</li>
              </ul>
            </section>

            {/* Miscellaneous Provisions Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                7. Miscellaneous Provisions
              </h2>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Entire Agreement</h3>
              <p className="mb-4">
                Service Order plus this Agreement constitutes complete understanding and
                supersedes all prior statements and understandings.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Governing Law</h3>
              <p className="mb-4">
                Georgia law applies without conflict-of-law principles. Exclusive jurisdiction:
                state and federal courts in Fulton County, Georgia. Both parties consent to
                this venue.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Attorney&apos;s Fees</h3>
              <p className="mb-4">
                Prevailing party recovers reasonable attorney&apos;s fees in any civil action.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Export Controls</h3>
              <p className="mb-4">
                Compliance with U.S. export regulations required. Prohibits use by nationals
                of embargoed countries (Cuba, Iran, North Korea, Sudan, Syria, etc.).
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Severability</h3>
              <p className="mb-4">
                If any provision deemed invalid, remaining provisions remain enforceable.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Privacy</h3>
              <p className="mb-4">
                Subject to Momentum&apos;s separate Privacy Policy. Public Internet and third-party
                networks used for transmission. No guarantee of data privacy despite industry
                best practices.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Subcontracting</h3>
              <p className="mb-4">
                Momentum may delegate obligations to third parties. Momentum remains responsible
                for performance.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Confidentiality</h3>
              <p className="mb-4">
                Separate NDA incorporated by reference if executed. Agreement controls in
                conflict with NDA.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Assignment</h3>
              <p className="mb-4">
                Neither party may assign without other&apos;s written consent. Exception: assignment
                to wholly-owned subsidiaries without consent. Acquiring parties bound by agreement
                terms.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Force Majeure</h3>
              <p className="mb-4">
                Excuse from performance for causes beyond reasonable control, including:
                acts of God, earthquakes, fire, flooding, pandemic, war, strikes, equipment failure.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Execution</h3>
              <p className="mb-4">
                May be executed in counterparts. Electronic signatures valid and binding.
                Effective upon authorized representative signature.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Notice Requirements</h3>
              <p className="mb-4">
                Written notice by mail, courier, or personal delivery required.
              </p>

              <h3 className="text-xl font-semibold text-[#0066ff] mb-3">Survival</h3>
              <p>
                Obligations continuing beyond termination survive, including: payment, ownership,
                confidentiality, indemnity, liability limits, dispute resolution.
              </p>
            </section>

            {/* Customer Representations Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                8. Customer Representations &amp; Consent
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customer represents age 18+ and legal capacity to contract</li>
                <li>Authorization required for representative capacity agreements</li>
                <li>Name, contact information, and location accuracy warranted</li>
                <li>Prompt notification required for information changes</li>
                <li>CPNI (Customer Proprietary Network Information) usage authorized for marketing</li>
                <li>CPNI sharing with agents and affiliates permitted unless consent withdrawn</li>
              </ul>
            </section>

            {/* Contact Section */}
            <section>
              <h2 className="text-2xl font-display font-semibold text-white mb-4">
                Contact Information
              </h2>
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
                <p className="mb-2">
                  <strong className="text-white">Momentum Telecom, Inc.</strong>
                </p>
                <p className="mb-4">
                  2 Ravinia Drive, Suite 1630<br />
                  Atlanta, Georgia 30346
                </p>
                <p>
                  <strong className="text-white">Legal Notices:</strong>{" "}
                  <a href="mailto:Legal_notices@gomomentum.com" className="text-[#0066ff] hover:underline">
                    Legal_notices@gomomentum.com
                  </a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
