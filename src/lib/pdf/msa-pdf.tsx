import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const colors = {
  electricBlue: "#0066ff",
  deepBlack: "#1a1a1a",
  white: "#ffffff",
  gray: "#666666",
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.electricBlue,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.deepBlack,
  },
  logoAccent: {
    color: colors.electricBlue,
  },
  revision: {
    fontSize: 8,
    color: colors.gray,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: colors.deepBlack,
  },
  intro: {
    fontSize: 9,
    marginBottom: 15,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
  },
  sectionNumber: {
    fontWeight: "bold",
    marginRight: 5,
  },
  sectionTitle: {
    fontWeight: "bold",
    textDecoration: "underline",
  },
  section: {
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  indent: {
    marginLeft: 15,
    marginBottom: 6,
  },
  subSection: {
    marginLeft: 15,
    marginBottom: 8,
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 20,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: colors.deepBlack,
    marginBottom: 3,
  },
  signatureField: {
    fontSize: 7,
    color: colors.gray,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    fontSize: 7,
    color: colors.gray,
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 25,
    right: 40,
    fontSize: 8,
    color: colors.gray,
  },
})

export interface MsaPDFProps {
  customerName: string
  orderNumber: string
}

export function MsaPDF({ customerName, orderNumber }: MsaPDFProps) {
  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            Network<Text style={styles.logoAccent}>GPT</Text>
          </Text>
          <Text style={styles.revision}>Rev 1.0.0</Text>
        </View>

        <Text style={styles.title}>Master Services Agreement for Data Services</Text>

        <Text style={styles.intro}>
          This Master Services Agreement for Data Services ("Agreement") is entered by NetworkGPT ("NetworkGPT," "we," "our" or "us") and the customer signing below ("Customer," "user," "you," or "your") as of the date of last execution ("Effective Date"), and, together with any Customer Service Order(s) you executed with NetworkGPT ("Service Order"), constitutes the Agreement ("Agreement") between NetworkGPT and Customer with respect to NetworkGPT's business communications services and any related products or services (collectively, the "Service"). This Agreement governs both the Service and any equipment provided by NetworkGPT to be used in conjunction with the Service ("Equipment").
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>BY ACTIVATING OR USING THE SERVICE, YOU REPRESENT THAT YOU ARE AUTHORIZED TO ENTER INTO THIS AGREEMENT AND THAT YOU HAVE READ AND UNDERSTAND FULLY THIS AGREEMENT.</Text>
        </Text>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionTitle}>SERVICE</Text>
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>1.1 Term and Termination.</Text> The Term of this Agreement shall commence upon the Effective Date and continue so long as any Service Order is in effect. The Term for the Service at a given Location shall be as specified in the Service Order(s) for such Location. Unless otherwise provided in the Service Order, the Term of such Service Order will automatically renew for successive terms of one (1) month thereafter (in each case, a "Renewal Term"), until terminated in accordance with the remaining terms of this Agreement.
          </Text>

          <Text style={styles.indent}>
            (a) Either party may terminate a Service Order, for any reason or for no reason, (i) at the end of the Initial Term by providing the other party with written notice of termination not less than sixty (60) days prior to the end of the Initial Term or (ii) at the end of any Renewal Term by providing the other party with written notice of termination not less than thirty (30) days' prior to the end of the Renewal Term.
          </Text>

          <Text style={styles.indent}>
            (b) Either party may terminate this Agreement and/or any Service Order(s) if the other party has committed a material breach thereof and such breach is not cured within thirty (30) days of the date the party in breach receives written notice of the breach.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>1.2 Prohibited Uses.</Text> You agree to abide by NetworkGPT's Acceptable Use Policy. You shall not use the Service and the Equipment in any unlawful or improper manner, including, without limitation, conduct that is threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, invasive of another's privacy. We reserve the right to disconnect your Service, if, after investigation and in our reasonable discretion, we determine that you have used the Service or the Equipment in any such manner.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>1.3 Copyright; Trademark; License.</Text> The Service and Equipment and any firmware or software used to provide the Service are protected by trademark, copyright or other intellectual property laws and international treaty provisions. All NetworkGPT websites, corporate names, service marks, trademarks, trade names, logos and domain names are and will at all times remain our exclusive property.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionTitle}>EQUIPMENT</Text>
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>2.1 Customer Equipment.</Text> You shall not access the Service through any medium or Equipment which we have not authorized in writing, nor may any medium or Equipment by which the Service is provided be shared, moved, modified, interfaced, copied, broadcasted, reproduced, ported or otherwise routed with or to any other equipment without our prior written consent.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>2.2 Equipment Purchases.</Text> You may purchase telecom Equipment to utilize the Service. You are responsible for the shipping charges associated with the initial delivery of the Equipment. You will be deemed to have accepted the items five (5) days after each is delivered and installed, unless you notify us in writing to the contrary.
          </Text>
        </View>

        <Text style={styles.pageNumber}>Page 1 of 2</Text>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>
            Network<Text style={styles.logoAccent}>GPT</Text>
          </Text>
          <Text style={styles.revision}>Rev 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionTitle}>CHARGES; PAYMENTS; TAXES</Text>
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>3.1 Billing.</Text> Unless otherwise agreed in the Service Order, billing will commence on the Firm Order Commitment Date ("FOC Date") when the carrier releases the circuit to NetworkGPT. We will bill all charges for service and applicable surcharges, fees, and taxes monthly in advance.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>3.2 Payment and Collection.</Text> Invoices (or the undisputed portion thereof) shall be paid no later than thirty (30) days from the invoice date. Any payment not made when due may be subject to a late payment fee equivalent to the lesser of (i) one and a half percent (1.5%) per month; or (ii) the highest rate allowed by law.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>3.3 Taxes.</Text> You are responsible for all applicable federal, state, provincial, municipal, local or other governmental sales, use, excise, value-added, personal property, public utility or other taxes, fees or charges now in force or enacted in the future.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            <Text style={styles.sectionNumber}>4.</Text>
            <Text style={styles.sectionTitle}>LIMITATION OF LIABILITY; WARRANTIES</Text>
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>4.1 LIMITATION OF LIABILITY.</Text> IN NO EVENT WILL WE, OUR OFFICERS, DIRECTORS, EMPLOYEES, AFFILIATES OR AGENTS BE LIABLE FOR ANY INCIDENTAL, INDIRECT, SPECIAL, PUNITIVE, EXEMPLARY, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE SERVICE OR EQUIPMENT PROVIDED UNDER THIS AGREEMENT. NOTWITHSTANDING ANY OTHER PROVISION OF THIS AGREEMENT, OUR MAXIMUM LIABILITY SHALL IN NO EVENT EXCEED THE AMOUNTS PAID TO US BY YOU DURING THE TWELVE (12) MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE LIABILITY.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>4.2 Limited Warranty.</Text> NetworkGPT warrants to Customer that (a) it has the right to enter into this Agreement, (b) the use of the Service will not infringe on any intellectual property or other rights of a third party, and (c) the Service shall be performed in a professional and workmanlike manner.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            <Text style={styles.sectionNumber}>5.</Text>
            <Text style={styles.sectionTitle}>MISCELLANEOUS</Text>
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>5.1 Entire Agreement.</Text> The Service Order, this Agreement and all documents or website content expressly incorporated therein constitute the entire agreement between you and NetworkGPT and govern your use of the Service.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>5.2 Governing Law/Venue.</Text> This Agreement shall be governed by and construed in accordance with the laws of the state of Delaware without regard to principles of conflicts of laws.
          </Text>

          <Text style={styles.subSection}>
            <Text style={styles.bold}>5.3 Survival.</Text> All obligations of the parties under this Agreement, which, by their nature, would continue beyond the termination, cancellation, or expiration of this Agreement shall survive such termination.
          </Text>
        </View>

        {/* Signature Section */}
        <Text style={[styles.paragraph, { marginTop: 15 }]}>
          Each Party has caused this Agreement to be executed on its behalf by an authorized individual as of the date(s) set forth below.
        </Text>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>NETWORKGPT</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureField}>Signature</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureField}>Name</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureField}>Title</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureField}>Date</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>CUSTOMER: {customerName}</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureField}>Signature</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureField}>Name</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureField}>Title</Text>
            <View style={[styles.signatureLine, { marginTop: 12 }]} />
            <Text style={styles.signatureField}>Date</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Order Reference: {orderNumber} | NetworkGPT Master Services Agreement for Data Services
        </Text>
        <Text style={styles.pageNumber}>Page 2 of 2</Text>
      </Page>
    </Document>
  )
}
