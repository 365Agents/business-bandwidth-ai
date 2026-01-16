import { z } from "zod"

// Contact information schema (reusable for billing and technical)
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
})

// Contacts schema for saving billing/technical contacts
export const contactsSchema = z.object({
  billingContact: contactSchema,
  technicalContact: contactSchema,
  sameAsBilling: z.boolean().default(false),
  salesRepName: z.string().optional(),
  salesRepEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
})

// Step 1: Customer Information (alias for backwards compatibility)
export const orderStep1Schema = contactsSchema

// Order form schema - DocuSeal handles terms acceptance now
export const orderFormSchema = z.object({
  billingContact: contactSchema,
  technicalContact: contactSchema,
  sameAsBilling: z.boolean(),
  salesRepName: z.string().optional(),
  salesRepEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
})

export type ContactInfo = z.infer<typeof contactSchema>
export type ContactsValues = z.infer<typeof contactsSchema>
export type OrderStep1Values = z.infer<typeof orderStep1Schema>
export type OrderFormValues = z.infer<typeof orderFormSchema>
