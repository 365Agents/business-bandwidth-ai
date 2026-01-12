import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function QuotePage() {
  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Request a Quote</CardTitle>
          <CardDescription>
            Get pricing for business internet at your location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="font-semibold">Quote Form Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              The quote request form will be available in Phase 2, including lead capture, 
              address verification, and bandwidth selection.
            </p>
            <Badge variant="secondary" className="mt-4">
              Coming in Phase 2
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
