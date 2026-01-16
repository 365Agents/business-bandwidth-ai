"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OrderStepAccount } from "./order-step-account"
import { OrderStep1 } from "./order-step-1"
import { OrderStep2 } from "./order-step-2"
import { OrderStepSign } from "./order-step-sign"
import { orderFormSchema, type OrderFormValues } from "@/lib/validations/order"
import { linkQuoteToUser, saveOrderContacts } from "@/app/quote/[id]/order-actions"

export interface QuoteDataForWizard {
  leadName: string
  leadEmail: string
  leadPhone: string
  leadCompany: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  speed: string
  term: string
  mrc: number
  nrc: number
  carrierName: string | null
  addOnSdwan: boolean
  addOn5g: boolean
  addOnCatoSase: boolean
}

interface OrderWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteId: string
  quoteData: QuoteDataForWizard
}

const STEPS = [
  { id: 1, title: "Account", description: "Create or sign in to your account" },
  { id: 2, title: "Contacts", description: "Billing & technical contacts" },
  { id: 3, title: "Review", description: "Confirm service details" },
  { id: 4, title: "Sign", description: "Sign your agreements" },
]

interface UserData {
  id: string
  email: string
  name: string
  company: string
}

export function OrderWizardDialog({
  open,
  onOpenChange,
  quoteId,
  quoteData,
}: OrderWizardDialogProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      billingContact: {
        name: quoteData.leadName,
        email: quoteData.leadEmail,
        phone: quoteData.leadPhone,
        company: quoteData.leadCompany,
      },
      technicalContact: {
        name: "",
        email: "",
        phone: "",
        company: "",
      },
      sameAsBilling: false,
      salesRepName: "",
      salesRepEmail: "",
    },
  })

  const handleAccountComplete = async (user: UserData) => {
    setUserData(user)
    // Link quote to user
    await linkQuoteToUser(quoteId, user.id)
    // Pre-fill billing contact with user data if not already set
    const currentBilling = form.getValues("billingContact")
    if (!currentBilling.name || currentBilling.name === quoteData.leadName) {
      form.setValue("billingContact", {
        name: user.name,
        email: user.email,
        phone: currentBilling.phone || quoteData.leadPhone,
        company: user.company,
      })
    }
    setCurrentStep(2)
    setSubmitError(null)
  }

  const handleNext = async () => {
    // Step 1 is handled by handleAccountComplete
    if (currentStep === 1) return

    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fieldsToValidate as (keyof OrderFormValues)[])

    if (isValid && currentStep < 4) {
      // If moving from step 2 (contacts) to step 3 (review), save contacts
      if (currentStep === 2) {
        setIsSubmitting(true)
        try {
          const formData = form.getValues()
          await saveOrderContacts(quoteId, formData)
        } catch {
          setSubmitError("Failed to save contact information")
          setIsSubmitting(false)
          return
        }
        setIsSubmitting(false)
      }
      setCurrentStep(currentStep + 1)
      setSubmitError(null)
    }
  }

  const handleBack = () => {
    // Can't go back from step 1
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setSubmitError(null)
    }
  }

  const handleSigningComplete = () => {
    // Close dialog and redirect to success page
    onOpenChange(false)
    router.push(`/dashboard/quotes/${quoteId}?success=true`)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setCurrentStep(1)
      setSubmitError(null)
      setUserData(null)
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0a0a0f] border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-white">
            Complete Your Order
          </DialogTitle>
          <DialogDescription className="text-[#808090]">
            {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step 1: Account - Outside form since it has its own flow */}
        {currentStep === 1 && (
          <OrderStepAccount
            defaultEmail={quoteData.leadEmail}
            defaultName={quoteData.leadName}
            defaultCompany={quoteData.leadCompany}
            onComplete={handleAccountComplete}
          />
        )}

        {/* Steps 2-4: Inside form */}
        {currentStep > 1 && (
          <FormProvider {...form}>
            <form className="space-y-6">
              {currentStep === 2 && <OrderStep1 />}
              {currentStep === 3 && (
                <OrderStep2 quoteData={quoteData} formData={form.getValues()} />
              )}
              {currentStep === 4 && userData && (
                <OrderStepSign
                  quoteId={quoteId}
                  signerEmail={form.getValues("billingContact.email")}
                  signerName={form.getValues("billingContact.name")}
                  onComplete={handleSigningComplete}
                />
              )}

              {/* Error Message */}
              {submitError && (
                <div className="bg-[#ff4466]/10 border border-[#ff4466]/30 rounded-lg p-4 text-center">
                  <p className="text-[#ff4466] text-sm">{submitError}</p>
                </div>
              )}

              {/* Navigation Buttons - Not shown on step 4 (signing handles its own completion) */}
              {currentStep < 4 && (
                <div className="flex justify-between pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Back
                  </Button>

                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="bg-electric-gradient shadow-electric hover:shadow-electric-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : currentStep === 3 ? (
                      "Proceed to Sign"
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS
  currentStep: number
}) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step.id === currentStep
                  ? "bg-[#0066ff] text-white shadow-electric"
                  : step.id < currentStep
                  ? "bg-[#00ff88] text-black"
                  : "bg-[#1a1a28] text-[#808090]"
              }`}
            >
              {step.id < currentStep ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-xs mt-1 ${
                step.id === currentStep ? "text-[#0066ff]" : "text-[#606070]"
              }`}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-3 ${
                step.id < currentStep ? "bg-[#00ff88]" : "bg-[#1a1a28]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function getFieldsForStep(step: number): string[] {
  switch (step) {
    case 2:
      return ["billingContact", "technicalContact"]
    default:
      return []
  }
}
