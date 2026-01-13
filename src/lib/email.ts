import nodemailer from "nodemailer"

// Email configuration - set these in .env.local
// For Gmail, use an App Password: https://support.google.com/accounts/answer/185833
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com"
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10)
const EMAIL_USER = process.env.EMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER

// Create transporter
function getTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("[Email] Email credentials not configured")
    return null
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
}

interface QuoteEmailData {
  to: string
  customerName: string
  company: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  speed: string
  mrc: number
  nrc: number
  quoteId: string
  carrierName?: string
}

export async function sendQuoteReadyEmail(data: QuoteEmailData): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log("[Email] Skipping email - not configured")
    return false
  }

  const speedFormatted = parseInt(data.speed, 10) >= 1000
    ? `${parseInt(data.speed, 10) / 1000} Gbps`
    : `${data.speed} Mbps`

  const mrcFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(data.mrc)

  const nrcFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(data.nrc)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your NetworkGPT Quote is Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050508; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Network<span style="color: #0066ff;">GPT</span>
              </h1>
              <p style="margin: 10px 0 0; color: #808090; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                Your Quote is Ready
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi ${data.customerName}!
              </p>
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 16px 0 0;">
                Great news! We've checked rates from 200+ carriers for your location and found the best price for your business internet.
              </p>
            </td>
          </tr>

          <!-- Price Box -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,212,255,0.1) 100%); border: 1px solid rgba(0,102,255,0.3); border-radius: 12px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <p style="margin: 0 0 8px; color: #808090; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Best Monthly Rate
                    </p>
                    <p style="margin: 0; color: #0066ff; font-size: 48px; font-weight: 700;">
                      ${mrcFormatted}<span style="font-size: 18px; font-weight: 400; color: #808090;">/mo</span>
                    </p>
                    ${data.nrc > 0 ? `
                    <p style="margin: 12px 0 0; color: #808090; font-size: 14px;">
                      + ${nrcFormatted} one-time setup fee
                    </p>
                    ` : ''}
                    ${data.carrierName ? `
                    <p style="margin: 8px 0 0; color: #b0b0c0; font-size: 14px;">
                      via ${data.carrierName}
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; color: #ffffff; font-size: 14px; font-weight: 600;">
                      Quote Details
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px;">Location</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">
                          ${data.streetAddress}<br>${data.city}, ${data.state} ${data.zipCode}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05);">Speed</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">${speedFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05);">Product</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">Dedicated Internet Access (DIA)</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05);">Quote ID</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255,255,255,0.05); font-family: monospace;">${data.quoteId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Ready to proceed? Let's schedule a call to discuss installation timeline and any additional services like SD-WAN or 5G backup.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://gomomentum.schedulehero.io/meet/rick-garcia/demo-83e0e10b"
                       style="display: inline-block; background: linear-gradient(135deg, #0066ff 0%, #00d4ff 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Book a Meeting
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: #505060; font-size: 12px; text-align: center;">
                Powered by <span style="color: #00c9a7;">Momentum</span>
              </p>
              <p style="margin: 10px 0 0; color: #505060; font-size: 12px; text-align: center;">
                Questions? Reply to this email or contact us anytime.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"NetworkGPT" <${EMAIL_FROM}>`,
      to: data.to,
      subject: `Your NetworkGPT Quote is Ready - ${mrcFormatted}/mo for ${speedFormatted}`,
      html,
    })

    console.log(`[Email] Quote ready email sent to ${data.to}`)
    return true
  } catch (error) {
    console.error("[Email] Failed to send email:", error)
    return false
  }
}

export async function sendOrderConfirmationEmail(data: QuoteEmailData): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log("[Email] Skipping email - not configured")
    return false
  }

  const speedFormatted = parseInt(data.speed, 10) >= 1000
    ? `${parseInt(data.speed, 10) / 1000} Gbps`
    : `${data.speed} Mbps`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - NetworkGPT</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050508; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Network<span style="color: #0066ff;">GPT</span>
              </h1>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(0,255,136,0.1); border-radius: 50%; display: inline-block; line-height: 80px;">
                <span style="color: #00ff88; font-size: 40px;">✓</span>
              </div>
              <h2 style="margin: 20px 0 0; color: #00ff88; font-size: 24px; font-weight: 600;">
                Order Confirmed!
              </h2>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
                Thank you, ${data.customerName}! Your order for ${speedFormatted} Dedicated Internet Access has been received.
              </p>
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 16px 0 0; text-align: center;">
                Our team will be in touch within 24 hours to confirm installation details.
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; color: #ffffff; font-size: 14px; font-weight: 600;">
                      Order Summary
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px;">Service</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right;">${speedFormatted} DIA</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05);">Location</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">
                          ${data.city}, ${data.state}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #808090; font-size: 14px; border-top: 1px solid rgba(255,255,255,0.05);">Order ID</td>
                        <td style="padding: 8px 0; color: #ffffff; font-size: 14px; text-align: right; border-top: 1px solid rgba(255,255,255,0.05); font-family: monospace;">${data.quoteId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: #505060; font-size: 12px; text-align: center;">
                Powered by <span style="color: #00c9a7;">Momentum</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"NetworkGPT" <${EMAIL_FROM}>`,
      to: data.to,
      subject: `Order Confirmed - ${speedFormatted} Internet for ${data.company}`,
      html,
    })

    console.log(`[Email] Order confirmation email sent to ${data.to}`)
    return true
  } catch (error) {
    console.error("[Email] Failed to send email:", error)
    return false
  }
}

interface BatchQuoteResult {
  streetAddress: string
  city: string
  state: string
  mrc: number | null
  status: string
  carrierName: string | null
}

interface BatchEmailData {
  to: string
  customerName: string
  company: string
  batchJobId: string
  totalCount: number
  successCount: number
  failedCount: number
  quotes: BatchQuoteResult[]
}

export async function sendBatchCompleteEmail(data: BatchEmailData): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log("[Email] Skipping batch email - not configured")
    return false
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const quotesHtml = data.quotes.map((q) => `
    <tr>
      <td style="padding: 12px; color: #ffffff; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        ${q.streetAddress}<br>
        <span style="color: #808090; font-size: 12px;">${q.city}, ${q.state}</span>
      </td>
      <td style="padding: 12px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
        ${q.status === "complete"
          ? '<span style="color: #00ff88; font-size: 12px;">&#10004; Complete</span>'
          : '<span style="color: #ff4444; font-size: 12px;">&#10008; Failed</span>'
        }
      </td>
      <td style="padding: 12px; text-align: right; color: ${q.status === "complete" ? "#00ff88" : "#808090"}; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.05);">
        ${q.status === "complete" ? formatCurrency(q.mrc) + "/mo" : "-"}
      </td>
      <td style="padding: 12px; text-align: right; color: #808090; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        ${q.carrierName || "-"}
      </td>
    </tr>
  `).join("")

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Bulk Quote Results Are Ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050508; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050508; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                Network<span style="color: #0066ff;">GPT</span>
              </h1>
              <p style="margin: 10px 0 0; color: #808090; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">
                Bulk Quote Results Ready
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 0;">
                Hi ${data.customerName}!
              </p>
              <p style="color: #b0b0c0; font-size: 16px; line-height: 1.6; margin: 16px 0 0;">
                Your bulk quote request is complete. We checked rates from 200+ carriers for all ${data.totalCount} locations.
              </p>
            </td>
          </tr>

          <!-- Summary Stats -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align: center; padding: 20px; background-color: #12121a; border-radius: 8px 0 0 8px;">
                    <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">${data.totalCount}</p>
                    <p style="margin: 4px 0 0; color: #808090; font-size: 12px;">Total</p>
                  </td>
                  <td width="34%" style="text-align: center; padding: 20px; background-color: #12121a;">
                    <p style="margin: 0; color: #00ff88; font-size: 32px; font-weight: 700;">${data.successCount}</p>
                    <p style="margin: 4px 0 0; color: #808090; font-size: 12px;">Successful</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 20px; background-color: #12121a; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; color: #ff4444; font-size: 32px; font-weight: 700;">${data.failedCount}</p>
                    <p style="margin: 4px 0 0; color: #808090; font-size: 12px;">Failed</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Results Table -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #12121a; border-radius: 12px;">
                <tr>
                  <th style="padding: 12px; color: #808090; font-size: 12px; text-align: left; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.1);">Location</th>
                  <th style="padding: 12px; color: #808090; font-size: 12px; text-align: center; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.1);">Status</th>
                  <th style="padding: 12px; color: #808090; font-size: 12px; text-align: right; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.1);">MRC</th>
                  <th style="padding: 12px; color: #808090; font-size: 12px; text-align: right; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.1);">Carrier</th>
                </tr>
                ${quotesHtml}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/bulk/${data.batchJobId}"
                       style="display: inline-block; background: linear-gradient(135deg, #0066ff 0%, #00d4ff 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      View Full Results
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; color: #505060; font-size: 12px; text-align: center;">
                Powered by <span style="color: #00c9a7;">Momentum</span>
              </p>
              <p style="margin: 10px 0 0; color: #505060; font-size: 12px; text-align: center;">
                Questions? Reply to this email or contact us anytime.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"NetworkGPT" <${EMAIL_FROM}>`,
      to: data.to,
      subject: `Bulk Quote Results Ready - ${data.successCount}/${data.totalCount} Successful`,
      html,
    })

    console.log(`[Email] Batch complete email sent to ${data.to}`)
    return true
  } catch (error) {
    console.error("[Email] Failed to send batch email:", error)
    return false
  }
}
