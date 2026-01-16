import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

// NetworkGPT brand colors
const colors = {
  electricBlue: "#0066ff",
  cyan: "#00d4ff",
  deepBlack: "#1a1a1a",
  white: "#ffffff",
  gray: "#666666",
  lightGray: "#f5f5f5",
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.electricBlue,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.deepBlack,
  },
  logoAccent: {
    color: colors.electricBlue,
  },
  headerRight: {
    textAlign: "right",
  },
  headerLabel: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 2,
  },
  headerValue: {
    fontSize: 10,
    color: colors.deepBlack,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.deepBlack,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.electricBlue,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: "35%",
    fontSize: 9,
    color: colors.gray,
  },
  value: {
    width: "65%",
    fontSize: 10,
    color: colors.deepBlack,
  },
  locationBox: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  locationAddress: {
    fontSize: 12,
    color: colors.deepBlack,
    fontWeight: "bold",
  },
  pricingTable: {
    marginTop: 10,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pricingItem: {
    fontSize: 10,
    color: colors.deepBlack,
  },
  pricingQty: {
    fontSize: 10,
    color: colors.gray,
    width: 40,
    textAlign: "center",
  },
  pricingPrice: {
    fontSize: 10,
    color: colors.deepBlack,
    width: 80,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.electricBlue,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.deepBlack,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.electricBlue,
  },
  termsSection: {
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.deepBlack,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  termsText: {
    fontSize: 8,
    color: colors.gray,
    lineHeight: 1.4,
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 25,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.deepBlack,
    marginBottom: 5,
  },
  signatureField: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 3,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: colors.gray,
  },
})

export interface ServiceOrderPDFProps {
  quoteId: string
  orderNumber: string
  date: string
  validDays?: number
  customer: {
    name: string
    email: string
    phone: string
    company: string
  }
  technicalContact?: {
    name: string
    email: string
    phone: string
  }
  service: {
    streetAddress: string
    city: string
    state: string
    zipCode: string
    speed: string
    term: string
    mrc: number
    nrc: number
    carrierName: string | null
  }
  addOns: { name: string; price: number }[]
}

export function ServiceOrderPDF({
  quoteId,
  orderNumber,
  date,
  validDays = 30,
  customer,
  technicalContact,
  service,
  addOns,
}: ServiceOrderPDFProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const addOnsTotal = addOns.reduce((sum, addon) => sum + addon.price, 0)
  const totalMrc = service.mrc + addOnsTotal
  const termMonths = parseInt(service.term) || 36

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Network<Text style={styles.logoAccent}>GPT</Text>
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Order Number</Text>
            <Text style={styles.headerValue}>{orderNumber}</Text>
            <Text style={[styles.headerLabel, { marginTop: 8 }]}>Date</Text>
            <Text style={styles.headerValue}>{date}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Customer Service Order (Data)</Text>
        <Text style={styles.subtitle}>Customer: {customer.company}</Text>

        {/* Service Location */}
        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>Service Location</Text>
          <Text style={styles.locationAddress}>
            {service.streetAddress}, {service.city}, {service.state} {service.zipCode}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{customer.company}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Billing Contact</Text>
            <Text style={styles.value}>{customer.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{customer.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{customer.phone}</Text>
          </View>
          {technicalContact && (
            <>
              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={styles.label}>Technical Contact</Text>
                <Text style={styles.value}>{technicalContact.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Technical Email</Text>
                <Text style={styles.value}>{technicalContact.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Technical Phone</Text>
                <Text style={styles.value}>{technicalContact.phone}</Text>
              </View>
            </>
          )}
        </View>

        {/* Service Details & Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.pricingTable}>
            {/* Header row */}
            <View style={[styles.pricingRow, { backgroundColor: colors.lightGray }]}>
              <Text style={[styles.pricingItem, { fontWeight: "bold", flex: 1 }]}>Item</Text>
              <Text style={[styles.pricingQty, { fontWeight: "bold" }]}>Qty</Text>
              <Text style={[styles.pricingPrice, { fontWeight: "bold" }]}>One-Time</Text>
              <Text style={[styles.pricingPrice, { fontWeight: "bold" }]}>Monthly</Text>
            </View>

            {/* Internet Access */}
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingItem, { flex: 1 }]}>
                Internet Access {service.speed} Mb (DIA)
              </Text>
              <Text style={styles.pricingQty}>1</Text>
              <Text style={styles.pricingPrice}>{formatCurrency(0)}</Text>
              <Text style={styles.pricingPrice}>{formatCurrency(service.mrc)}</Text>
            </View>

            {/* IP Block */}
            <View style={styles.pricingRow}>
              <Text style={[styles.pricingItem, { flex: 1 }]}>/29 IP Block - 5 Usable IPv4</Text>
              <Text style={styles.pricingQty}>1</Text>
              <Text style={styles.pricingPrice}>{formatCurrency(0)}</Text>
              <Text style={styles.pricingPrice}>Included</Text>
            </View>

            {/* Circuit Activation */}
            {service.nrc > 0 && (
              <View style={styles.pricingRow}>
                <Text style={[styles.pricingItem, { flex: 1 }]}>Circuit Activation Fee</Text>
                <Text style={styles.pricingQty}>1</Text>
                <Text style={styles.pricingPrice}>{formatCurrency(service.nrc)}</Text>
                <Text style={styles.pricingPrice}>{formatCurrency(0)}</Text>
              </View>
            )}

            {/* Add-ons */}
            {addOns.map((addon, index) => (
              <View key={index} style={styles.pricingRow}>
                <Text style={[styles.pricingItem, { flex: 1 }]}>{addon.name}</Text>
                <Text style={styles.pricingQty}>1</Text>
                <Text style={styles.pricingPrice}>{formatCurrency(0)}</Text>
                <Text style={styles.pricingPrice}>{formatCurrency(addon.price)}</Text>
              </View>
            ))}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={{ flexDirection: "row" }}>
                <Text style={[styles.totalValue, { marginRight: 30 }]}>
                  {formatCurrency(service.nrc)}
                </Text>
                <Text style={styles.totalValue}>{formatCurrency(totalMrc)}/mo</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Term & Carrier */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Term (months)</Text>
            <Text style={styles.value}>{termMonths}</Text>
          </View>
          {service.carrierName && (
            <View style={styles.row}>
              <Text style={styles.label}>Carrier</Text>
              <Text style={styles.value}>{service.carrierName}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Quote ID</Text>
            <Text style={styles.value}>{quoteId}</Text>
          </View>
        </View>

        {/* Terms Reference */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            THIS CUSTOMER SERVICE ORDER ("CSO") IS SUBJECT TO THE MASTER SERVICES AGREEMENT FOR DATA SERVICES ("MSA") SEPARATELY EXECUTED BY THE PARTIES. THIS CSO (INCLUDING ANY EXHIBITS AS MAY BE REFERENCED HEREIN) AND THE MSA TOGETHER CONSTITUTE A SINGLE AGREEMENT WHICH IS INTENDED BY THE PARTIES TO SET FORTH THE TERMS OF SERVICE TO BE PROVIDED BY NETWORKGPT TO THE UNDERSIGNED CUSTOMER AND CONSTITUTES THE ENTIRE AGREEMENT BETWEEN US CONCERNING THE SUBJECT MATTER OF THIS CSO.
          </Text>
          <Text style={[styles.termsText, { marginTop: 8 }]}>
            Term: This CSO shall have an initial term of {termMonths} months beginning on the date that the Service is activated. Following the initial Term, this Agreement will automatically renew for successive one (1) month terms unless terminated in accordance with the terms of this Agreement.
          </Text>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>NetworkGPT</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureField}>Signature</Text>
            <View style={[styles.signatureLine, { marginTop: 15 }]} />
            <Text style={styles.signatureField}>Name / Title / Date</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>{customer.company}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureField}>Signature</Text>
            <View style={[styles.signatureLine, { marginTop: 15 }]} />
            <Text style={styles.signatureField}>Name / Title / Date</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Quote prepared on {date} | Pricing valid for {validDays} days | Powered by NetworkGPT
        </Text>
      </Page>
    </Document>
  )
}
