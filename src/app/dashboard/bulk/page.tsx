"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileDropzone } from "@/components/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { parseUploadedFile, submitBatchJob, getUserBatchJobs, type ParsedRow } from "./actions"

interface UserInfo {
  name: string
  company: string
  email: string
}

export default function BulkUploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[] | null>(null)
  const [summary, setSummary] = useState<{ validCount: number; invalidCount: number } | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [recentJobs, setRecentJobs] = useState<Array<{
    id: string
    status: string
    totalCount: number
    successCount: number
    failedCount: number
    fileName: string | null
    createdAt: Date
  }>>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, jobs] = await Promise.all([
          fetch("/api/auth/me"),
          getUserBatchJobs(),
        ])
        if (userRes.ok) {
          const data = await userRes.json()
          setUser(data.user)
        }
        setRecentJobs(jobs)
      } catch {
        // User not logged in - middleware should have redirected
      }
    }
    fetchData()
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setParsedRows(null)
    setSummary(null)
    setParseError(null)
    setSubmitError(null)
  }

  const handlePreview = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setParseError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const result = await parseUploadedFile(formData)

      if (result.error) {
        setParseError(result.error)
        setParsedRows(null)
        setSummary(null)
      } else {
        setParsedRows(result.rows)
        setSummary({ validCount: result.validCount, invalidCount: result.invalidCount })
      }
    } catch {
      setParseError("Failed to parse file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!parsedRows || !selectedFile) return

    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitBatchJob(validRows, selectedFile.name, notifyEmail)

      if (result.error) {
        setSubmitError(result.error)
      } else if (result.batchJobId) {
        router.push(`/dashboard/bulk/${result.batchJobId}`)
      }
    } catch {
      setSubmitError("Failed to submit batch. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-green-500/20 text-green-400">Complete</Badge>
      case "processing":
        return <Badge className="bg-blue-500/20 text-blue-400">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[#050508]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#808090] hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white">Bulk Quote Upload</h1>
          {user && (
            <p className="text-[#808090] mt-1">
              {user.company} &middot; {user.name}
            </p>
          )}
        </div>

        {/* Recent Jobs */}
        {recentJobs.length > 0 && !parsedRows && (
          <Card className="bg-[#0a0a0f] border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Batch Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/dashboard/bulk/${job.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#12121a] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusBadge(job.status)}
                      <span className="text-white text-sm">{job.fileName || "Unnamed"}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#808090]">
                      <span>{job.successCount}/{job.totalCount} successful</span>
                      <span>{formatDate(job.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Card */}
        <Card className="bg-[#0a0a0f] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Upload Spreadsheet</CardTitle>
            <CardDescription className="text-[#808090]">
              Upload a CSV or Excel file with business addresses to get bulk quotes.
              Maximum 100 addresses per upload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropzone onFileSelect={handleFileSelect} />

            {parseError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {parseError}
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button
                onClick={handlePreview}
                disabled={!selectedFile || isLoading}
                className="bg-electric-gradient shadow-electric hover:shadow-electric-lg transition-all"
              >
                {isLoading ? "Parsing..." : "Upload & Preview"}
              </Button>

              {selectedFile && !parsedRows && (
                <p className="text-sm text-[#808090]">
                  Ready to preview: {selectedFile.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expected Format */}
        {!parsedRows && (
          <Card className="bg-[#0a0a0f] border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Expected Format</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#808090] text-sm mb-4">
                Your spreadsheet should have columns for address, city, state, and zip code.
                Column names are flexible (case-insensitive).
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-[#808090]">street_address</TableHead>
                      <TableHead className="text-[#808090]">city</TableHead>
                      <TableHead className="text-[#808090]">state</TableHead>
                      <TableHead className="text-[#808090]">zip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10">
                      <TableCell className="text-white">123 Main Street</TableCell>
                      <TableCell className="text-white">New York</TableCell>
                      <TableCell className="text-white">NY</TableCell>
                      <TableCell className="text-white">10001</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10">
                      <TableCell className="text-white">456 Oak Avenue</TableCell>
                      <TableCell className="text-white">Los Angeles</TableCell>
                      <TableCell className="text-white">CA</TableCell>
                      <TableCell className="text-white">90001</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Results */}
        {parsedRows && summary && (
          <Card className="bg-[#0a0a0f] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Preview Results</CardTitle>
              <CardDescription className="text-[#808090]">
                <span className="text-green-400">{summary.validCount} valid</span>
                {summary.invalidCount > 0 && (
                  <span className="text-red-400 ml-2">{summary.invalidCount} invalid</span>
                )}
                <span className="ml-2">out of {parsedRows.length} total addresses</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-[#808090] w-16">Row</TableHead>
                      <TableHead className="text-[#808090]">Address</TableHead>
                      <TableHead className="text-[#808090]">City</TableHead>
                      <TableHead className="text-[#808090]">State</TableHead>
                      <TableHead className="text-[#808090]">Zip</TableHead>
                      <TableHead className="text-[#808090] w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRows.map((row) => (
                      <TableRow key={row.rowNumber} className="border-white/10">
                        <TableCell className="text-[#808090]">{row.rowNumber}</TableCell>
                        <TableCell className="text-white">{row.streetAddress || "-"}</TableCell>
                        <TableCell className="text-white">{row.city || "-"}</TableCell>
                        <TableCell className="text-white">{row.state || "-"}</TableCell>
                        <TableCell className="text-white">{row.zipCode || "-"}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                              Valid
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-help"
                              title={row.errors.join(", ")}
                            >
                              Invalid
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {submitError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {submitError}
                </div>
              )}

              {summary.validCount > 0 && (
                <div className="mt-6 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-[#1a1a24] text-[#0066ff] focus:ring-[#0066ff] focus:ring-offset-0"
                    />
                    <span className="text-white text-sm">Email me when complete</span>
                    {user && (
                      <span className="text-[#808090] text-sm">({user.email})</span>
                    )}
                  </label>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-electric-gradient shadow-electric hover:shadow-electric-lg transition-all"
                    >
                      {isSubmitting ? "Submitting..." : `Submit ${summary.validCount} Valid Addresses`}
                    </Button>
                    <p className="text-sm text-[#808090]">
                      Each quote takes ~2-3 minutes to process
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
