"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import type { OrderFormValues } from "@/lib/validations/order"

export function OrderStep1() {
  const form = useFormContext<OrderFormValues>()
  const sameAsBilling = useWatch({ control: form.control, name: "sameAsBilling" })

  const handleSameAsBillingChange = (checked: boolean) => {
    form.setValue("sameAsBilling", checked)
    if (checked) {
      const billing = form.getValues("billingContact")
      form.setValue("technicalContact", { ...billing })
    } else {
      form.setValue("technicalContact", {
        name: "",
        email: "",
        phone: "",
        company: "",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Billing Contact */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0066ff]/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#0066ff]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Billing Contact</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billingContact.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full name"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingContact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="billing@company.com"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingContact.company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Company</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Company name"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Technical Contact */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[#00d4ff]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Technical Contact</h3>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#808090] cursor-pointer">
            <Checkbox
              checked={sameAsBilling}
              onCheckedChange={handleSameAsBillingChange}
              className="border-white/20 data-[state=checked]:bg-[#0066ff] data-[state=checked]:border-[#0066ff]"
            />
            Same as billing
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="technicalContact.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full name"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060] disabled:opacity-50"
                    disabled={sameAsBilling}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technicalContact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="tech@company.com"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060] disabled:opacity-50"
                    disabled={sameAsBilling}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technicalContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060] disabled:opacity-50"
                    disabled={sameAsBilling}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="technicalContact.company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Company</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Company name"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060] disabled:opacity-50"
                    disabled={sameAsBilling}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Sales Rep (Optional) */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#808090]/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#808090]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Sales Representative
            </h3>
            <p className="text-xs text-[#606070]">Optional</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salesRepName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Rep's name"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salesRepEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#b0b0c0]">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="rep@company.com"
                    className="bg-[#12121a] border-white/10 text-white placeholder:text-[#505060]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
