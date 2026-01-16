const DOCUSEAL_API_URL = "https://api.docuseal.com"

interface SubmitterData {
  email: string
  name: string
  role?: string
  fields?: Array<{
    name: string
    default_value: string
  }>
}

interface CreateSubmissionParams {
  templateId?: number
  submitters: SubmitterData[]
  documents?: Array<{
    name: string
    file: string // base64 encoded PDF
  }>
  sendEmail?: boolean
  message?: {
    subject: string
    body: string
  }
}

interface FieldArea {
  x: number // 0-1 percentage from left
  y: number // 0-1 percentage from top
  w: number // width as percentage
  h: number // height as percentage
  page: number // 1-indexed page number
}

interface TemplateField {
  name: string
  type: "signature" | "initials" | "date" | "text" | "checkbox"
  role: string
  required?: boolean
  areas: FieldArea[]
}

interface CreateSubmissionFromPdfsParams {
  submitters: SubmitterData[]
  documents: Array<{
    name: string
    file: string // base64 encoded PDF
  }>
  fields?: TemplateField[]
  sendEmail?: boolean
  message?: {
    subject: string
    body: string
  }
}

export interface DocuSealSubmission {
  id: number
  source: string
  submitters: Array<{
    id: number
    submission_id: number
    uuid: string
    email: string
    slug: string
    sent_at: string | null
    opened_at: string | null
    completed_at: string | null
    declined_at: string | null
    created_at: string
    updated_at: string
    name: string
    phone: string | null
    status: "pending" | "sent" | "opened" | "completed" | "declined"
    role: string
    external_id: string | null
    metadata: Record<string, unknown>
    preferences: Record<string, unknown>
    embed_src: string
  }>
  template: {
    id: number
    name: string
    created_at: string
    updated_at: string
  } | null
  audit_log_url: string | null
  combined_document_url: string | null
  created_at: string
  updated_at: string
  archived_at: string | null
  status: "pending" | "completed"
}

export interface DocuSealDocument {
  id: number
  name: string
  url: string
}

class DocuSealClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${DOCUSEAL_API_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "X-Auth-Token": this.apiKey,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DocuSeal API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  /**
   * Create a submission using an existing template
   */
  async createSubmission(
    params: CreateSubmissionParams
  ): Promise<DocuSealSubmission> {
    return this.request<DocuSealSubmission>("/submissions", {
      method: "POST",
      body: JSON.stringify({
        template_id: params.templateId,
        submitters: params.submitters.map((s) => ({
          email: s.email,
          name: s.name,
          role: s.role || "Signer",
          fields: s.fields,
        })),
        send_email: params.sendEmail ?? true,
        message: params.message,
      }),
    })
  }

  /**
   * Create a submission by uploading PDFs directly using templates/pdf endpoint
   * First creates a template from PDFs, then creates a submission
   */
  async createSubmissionFromPdfs(
    params: CreateSubmissionFromPdfsParams
  ): Promise<DocuSealSubmission> {
    // Default signature fields if none provided
    // Places signature at bottom of last page of each document
    const defaultFields: TemplateField[] = [
      {
        name: "Customer Signature",
        type: "signature",
        role: "Customer",
        required: true,
        areas: [
          { x: 0.1, y: 0.85, w: 0.35, h: 0.06, page: -1 }, // -1 = last page
        ],
      },
      {
        name: "Date Signed",
        type: "date",
        role: "Customer",
        required: true,
        areas: [
          { x: 0.55, y: 0.85, w: 0.25, h: 0.06, page: -1 },
        ],
      },
    ]

    const fields = params.fields || defaultFields

    // Step 1: Create a template from the PDFs with fields
    const templateResponse = await this.request<{ id: number; name: string }>(
      "/templates/pdf",
      {
        method: "POST",
        body: JSON.stringify({
          name: `Order-${Date.now()}`,
          documents: params.documents.map((d) => ({
            name: d.name,
            file: d.file, // base64 data URL
          })),
          fields: fields,
        }),
      }
    )

    // Step 2: Create a submission using the template
    return this.request<DocuSealSubmission>("/submissions", {
      method: "POST",
      body: JSON.stringify({
        template_id: templateResponse.id,
        submitters: params.submitters.map((s) => ({
          email: s.email,
          name: s.name,
          role: s.role || "Customer",
          fields: s.fields,
        })),
        send_email: params.sendEmail ?? false,
        message: params.message,
      }),
    })
  }

  /**
   * Get a submission by ID
   */
  async getSubmission(submissionId: number): Promise<DocuSealSubmission> {
    return this.request<DocuSealSubmission>(`/submissions/${submissionId}`)
  }

  /**
   * Get signed documents for a submission
   */
  async getDocuments(submissionId: number): Promise<DocuSealDocument[]> {
    const submission = await this.getSubmission(submissionId)

    // The combined document URL contains the signed document
    if (submission.combined_document_url) {
      return [
        {
          id: submissionId,
          name: "Signed Documents",
          url: submission.combined_document_url,
        },
      ]
    }

    return []
  }

  /**
   * Get embed URL for inline signing
   * Returns the embed_src from the first submitter
   */
  async getEmbedUrl(submissionId: number): Promise<string | null> {
    const submission = await this.getSubmission(submissionId)
    const firstSubmitter = submission.submitters[0]
    return firstSubmitter?.embed_src || null
  }

  /**
   * Archive a submission
   */
  async archiveSubmission(submissionId: number): Promise<DocuSealSubmission> {
    return this.request<DocuSealSubmission>(`/submissions/${submissionId}`, {
      method: "DELETE",
    })
  }
}

// Singleton instance
let client: DocuSealClient | null = null

export function getDocuSealClient(): DocuSealClient {
  if (!client) {
    const apiKey = process.env.DOCUSEAL_API_KEY
    if (!apiKey) {
      throw new Error("DOCUSEAL_API_KEY environment variable is not set")
    }
    client = new DocuSealClient(apiKey)
  }
  return client
}

export { DocuSealClient }
