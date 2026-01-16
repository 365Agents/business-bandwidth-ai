"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { OrderFormValues } from "@/lib/validations/order"
import type { QuoteDataForWizard } from "./order-wizard-dialog"

interface OrderStep2Props {
  quoteData: QuoteDataForWizard
  formData: OrderFormValues
}

export function OrderStep2({ quoteData, formData }: OrderStep2Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)

  const addOnPrices = { sdwan: 250, fiveG: 250 }
  const addOnsTotal =
    (quoteData.addOnSdwan ? addOnPrices.sdwan : 0) +
    (quoteData.addOn5g ? addOnPrices.fiveG : 0)
  const totalMrc = quoteData.mrc + addOnsTotal

  return (
    <div className="space-y-4">
      {/* Service Location */}
      <Card className="bg-gradient-to-r from-[#0066ff]/5 to-[#00d4ff]/5 border-[#0066ff]/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066ff]/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-[#0066ff]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[#808090] uppercase tracking-wider mb-1">
                Service Location
              </p>
              <p className="text-white font-medium">{quoteData.streetAddress}</p>
              <p className="text-[#b0b0c0]">
                {quoteData.city}, {quoteData.state} {quoteData.zipCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card className="bg-[#12121a] border-white/10">
        <CardContent className="pt-4">
          <h3 className="text-xs font-semibold text-[#808090] uppercase tracking-wider mb-4">
            Service Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#606070]">Service Type</p>
              <p className="text-white font-medium">Dedicated Internet Access</p>
            </div>
            <div>
              <p className="text-[#606070]">Bandwidth</p>
              <p className="text-white font-medium">{quoteData.speed} Mbps</p>
            </div>
            <div>
              <p className="text-[#606070]">Contract Term</p>
              <p className="text-white font-medium">{quoteData.term} months</p>
            </div>
            {quoteData.carrierName && (
              <div>
                <p className="text-[#606070]">Carrier</p>
                <p className="text-white font-medium">{quoteData.carrierName}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contacts Summary */}
      <Card className="bg-[#12121a] border-white/10">
        <CardContent className="pt-4">
          <h3 className="text-xs font-semibold text-[#808090] uppercase tracking-wider mb-4">
            Contacts
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#0066ff]" />
                <p className="text-[#0066ff] text-xs uppercase font-medium">
                  Billing
                </p>
              </div>
              <p className="text-white">{formData.billingContact.name}</p>
              <p className="text-[#808090] text-xs">
                {formData.billingContact.email}
              </p>
              <p className="text-[#808090] text-xs">
                {formData.billingContact.phone}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />
                <p className="text-[#00d4ff] text-xs uppercase font-medium">
                  Technical
                </p>
              </div>
              <p className="text-white">{formData.technicalContact.name}</p>
              <p className="text-[#808090] text-xs">
                {formData.technicalContact.email}
              </p>
              <p className="text-[#808090] text-xs">
                {formData.technicalContact.phone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card className="bg-gradient-to-r from-[#0066ff]/10 to-[#00d4ff]/10 border-[#0066ff]/30">
        <CardContent className="pt-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Pricing Summary
          </h3>
          <div className="space-y-3 text-sm">
            {/* Base Service */}
            <div className="flex justify-between">
              <span className="text-[#b0b0c0]">
                Dedicated Internet ({quoteData.speed} Mbps)
              </span>
              <span className="text-white">{formatCurrency(quoteData.mrc)}/mo</span>
            </div>

            {/* IP Block */}
            <div className="flex justify-between">
              <span className="text-[#b0b0c0]">/29 IP Block (5 Usable IPv4)</span>
              <span className="text-[#00ff88]">Included</span>
            </div>

            {/* Add-ons */}
            {quoteData.addOnSdwan && (
              <div className="flex justify-between">
                <span className="text-[#b0b0c0]">Juniper SD-WAN</span>
                <span className="text-white">
                  +{formatCurrency(addOnPrices.sdwan)}/mo
                </span>
              </div>
            )}

            {quoteData.addOn5g && (
              <div className="flex justify-between">
                <span className="text-[#b0b0c0]">5G Internet Backup</span>
                <span className="text-white">
                  +{formatCurrency(addOnPrices.fiveG)}/mo
                </span>
              </div>
            )}

            {quoteData.addOnCatoSase && (
              <div className="flex justify-between items-center">
                <span className="text-[#b0b0c0]">Cato SASE</span>
                <Badge className="bg-[#0066ff]/20 text-[#0066ff] border-[#0066ff]/30">
                  Consultation Required
                </Badge>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Total Monthly</span>
                <span className="font-display text-2xl font-bold text-[#0066ff]">
                  {formatCurrency(totalMrc)}
                  <span className="text-sm font-normal text-[#808090]">/mo</span>
                  {quoteData.addOnCatoSase && (
                    <span className="text-sm font-normal text-[#808090]">
                      {" "}
                      + Cato
                    </span>
                  )}
                </span>
              </div>
              {quoteData.nrc > 0 && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#808090]">One-time setup fee</span>
                  <span className="text-[#808090]">
                    {formatCurrency(quoteData.nrc)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
