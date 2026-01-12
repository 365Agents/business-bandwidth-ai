import { z } from "zod"

export const quoteFormSchema = z.object({
  // Contact info
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  // Location
  streetAddress: z.string().min(5, "Please enter a valid street address"),
  city: z.string().min(2, "Please enter a city"),
  state: z.string().min(2, "Please enter a state"),
  zipCode: z.string().min(5, "Please enter a valid zip code"),
  // Service requirements
  speed: z.string().min(1, "Please select a speed"),
  term: z.string().min(1, "Please select a contract term"),
})

export type QuoteFormValues = z.infer<typeof quoteFormSchema>
