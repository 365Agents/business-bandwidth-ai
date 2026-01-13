import * as XLSX from "xlsx"

export interface ParsedRow {
  rowNumber: number
  streetAddress: string
  city: string
  state: string
  zipCode: string
  isValid: boolean
  errors: string[]
}

interface RawRow {
  [key: string]: string | number | undefined
}

const MAX_ROWS = 100

// Column name mappings (normalized to lowercase)
const STREET_COLUMNS = ["street_address", "streetaddress", "address", "street", "address1", "address_1"]
const CITY_COLUMNS = ["city", "town", "municipality"]
const STATE_COLUMNS = ["state", "province", "region", "st"]
const ZIP_COLUMNS = ["zip", "zip_code", "zipcode", "postal_code", "postalcode", "postal"]

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_")
}

function findColumnValue(row: RawRow, possibleNames: string[]): string {
  for (const key of Object.keys(row)) {
    const normalized = normalizeColumnName(key)
    if (possibleNames.includes(normalized)) {
      const value = row[key]
      return value !== undefined && value !== null ? String(value).trim() : ""
    }
  }
  return ""
}

function validateRow(row: Omit<ParsedRow, "isValid" | "errors">): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!row.streetAddress) {
    errors.push("Missing street address")
  }

  if (!row.city) {
    errors.push("Missing city")
  }

  if (!row.state) {
    errors.push("Missing state")
  } else if (row.state.length !== 2) {
    errors.push("State must be 2-letter code")
  }

  if (!row.zipCode) {
    errors.push("Missing zip code")
  } else if (!/^\d{5}(-\d{4})?$/.test(row.zipCode)) {
    errors.push("Invalid zip code format")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function parseSpreadsheet(buffer: ArrayBuffer): ParsedRow[] {
  const workbook = XLSX.read(buffer, { type: "array" })

  // Get first sheet
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error("No sheets found in spreadsheet")
  }

  const sheet = workbook.Sheets[sheetName]
  const rawRows: RawRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })

  if (rawRows.length === 0) {
    throw new Error("No data rows found in spreadsheet")
  }

  if (rawRows.length > MAX_ROWS) {
    throw new Error(`Too many rows. Maximum is ${MAX_ROWS}, found ${rawRows.length}`)
  }

  const parsedRows: ParsedRow[] = []

  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i]

    const streetAddress = findColumnValue(rawRow, STREET_COLUMNS)
    const city = findColumnValue(rawRow, CITY_COLUMNS)
    const state = findColumnValue(rawRow, STATE_COLUMNS).toUpperCase()
    const zipCode = findColumnValue(rawRow, ZIP_COLUMNS).replace(/\D/g, "").slice(0, 5)

    const rowData = {
      rowNumber: i + 2, // +2 because row 1 is headers, and we're 0-indexed
      streetAddress,
      city,
      state,
      zipCode,
    }

    const validation = validateRow(rowData)

    parsedRows.push({
      ...rowData,
      ...validation,
    })
  }

  return parsedRows
}
