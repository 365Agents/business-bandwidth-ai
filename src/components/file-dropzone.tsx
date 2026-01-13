"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  className?: string
}

export function FileDropzone({
  onFileSelect,
  accept = ".csv,.xlsx,.xls",
  maxSizeMB = 5,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const validateFile = useCallback(
    (file: File): string | null => {
      const validExtensions = accept.split(",").map((ext) => ext.trim().toLowerCase())
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

      if (!validExtensions.includes(fileExtension)) {
        return `Invalid file type. Please upload ${accept}`
      }

      if (file.size > maxSizeBytes) {
        return `File too large. Maximum size is ${maxSizeMB}MB`
      }

      return null
    },
    [accept, maxSizeBytes, maxSizeMB]
  )

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setSelectedFile(null)
        return
      }

      setError(null)
      setSelectedFile(file)
      onFileSelect(file)
    },
    [validateFile, onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed cursor-pointer transition-all",
          isDragging
            ? "border-[#0066ff] bg-[#0066ff]/10"
            : "border-white/20 bg-[#12121a] hover:border-white/30 hover:bg-[#1a1a24]",
          error && "border-red-500/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#0066ff]/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#0066ff]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-sm text-[#808090]">{formatFileSize(selectedFile.size)}</p>
            </div>
            <p className="text-xs text-[#0066ff]">Click to change file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#808090]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                Drop your spreadsheet here
              </p>
              <p className="text-sm text-[#808090]">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-[#505060]">
              CSV or Excel, max {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
