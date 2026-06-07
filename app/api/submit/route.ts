import { NextResponse } from "next/server"
import crypto from "crypto"

// Simple in-memory rate limiter (resets on deploy/restart)
const submissionLog = new Map<string, { count: number; firstSubmit: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const maxSubmissions = 3

  const entry = submissionLog.get(ip)
  if (!entry) {
    submissionLog.set(ip, { count: 1, firstSubmit: now })
    return false
  }

  // Reset window if expired
  if (now - entry.firstSubmit > window) {
    submissionLog.set(ip, { count: 1, firstSubmit: now })
    return false
  }

  entry.count++
  return entry.count > maxSubmissions
}

// SHA-256 hash of a normalized PII string. Returns empty string when input
// is missing — Meta CAPI rejects fields hashed from empty strings, so callers
// MUST drop empty fields from the user_data object before sending.
function sha256(value: string): string {
  if (!value) return ""
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

// Extract one cookie's value from the raw Cookie header. Tolerant of
// surrounding whitespace and missing cookies.
function readCookie(cookieHeader: string | null, name: string): string {
  if (!cookieHeader) return ""
  const parts = cookieHeader.split(";")
  for (const p of parts) {
    const [k, ...v] = p.split("=")
    if (k.trim() === name) return decodeURIComponent(v.join("=").trim())
  }
  return ""
}

// Fire-and-await Meta Conversions API Lead event. Pairs with the browser-side
// fbq Lead via shared event_id so Meta dedupes the two and picks the more
// reliable signal. Hashes all PII. Includes IP/UA/fbp/fbc for match-quality.
// Never blocks longer than 3s — failures are logged and silently ignored.
async function sendCapiLead(args: {
  pixelId: string
  token: string
  eventId: string
  eventName: string  // "Lead" or "LeadLowIntent"
  value: number
  eventSourceUrl: string
  clientIp: string
  userAgent: string
  fbp: string
  fbc: string
  email: string
  phone: string
  firstName: string
  lastName: string
  city: string
  state: string
  zip: string
}): Promise<void> {
  const userData: Record<string, unknown> = {}
  if (args.email)     userData.em  = [sha256(args.email)]
  if (args.phone)     userData.ph  = [sha256(args.phone.replace(/\D/g, ""))]
  if (args.firstName) userData.fn  = [sha256(args.firstName)]
  if (args.lastName)  userData.ln  = [sha256(args.lastName)]
  if (args.city)      userData.ct  = [sha256(args.city)]
  if (args.state)     userData.st  = [sha256(args.state)]
  if (args.zip)       userData.zp  = [sha256(args.zip)]
  if (args.clientIp)  userData.client_ip_address = args.clientIp
  if (args.userAgent) userData.client_user_agent = args.userAgent
  if (args.fbp)       userData.fbp = args.fbp
  if (args.fbc)       userData.fbc = args.fbc

  const body = {
    data: [
      {
        event_name: args.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: args.eventId,
        action_source: "website",
        event_source_url: args.eventSourceUrl,
        user_data: userData,
        custom_data: {
          currency: "USD",
          value: args.value,
        },
      },
    ],
  }

  const url = `https://graph.facebook.com/v21.0/${args.pixelId}/events?access_token=${encodeURIComponent(args.token)}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      const text = await res.text()
      console.error("CAPI non-2xx:", res.status, text.slice(0, 500))
    }
  } catch (e) {
    console.error("CAPI error:", e)
  }
}

// Best-effort split of a free-text Google Places address into city/state/zip.
// Falls back to empty strings when the format isn't recognized — those fields
// get omitted from the CAPI user_data block.
function splitAddress(full: string): { city: string; state: string; zip: string } {
  const out = { city: "", state: "", zip: "" }
  if (!full) return out
  const parts = full.split(",").map((p) => p.trim())
  // Typical Google Places: "123 Main St, Arlington, VA 22201, USA"
  if (parts.length >= 3) {
    out.city = parts[parts.length - 3] || ""
    const stateZip = parts[parts.length - 2] || ""
    const m = stateZip.match(/^([A-Za-z]{2})\s+(\d{5})/)
    if (m) {
      out.state = m[1]
      out.zip = m[2]
    } else {
      out.state = stateZip
    }
  }
  return out
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"

    // Rate limit: max 3 submissions per IP per hour
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: 429 }
      )
    }

    const data = await request.json()

    // Server-side validation
    const phone = (data.phone || "").replace(/\D/g, "").replace(/^1/, "")
    if (phone.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid phone" }, { status: 400 })
    }

    const email = (data.email || "").trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 })
    }

    // Support both firstName/lastName (new) and name (legacy)
    if (!(data.firstName || data.name || "").trim()) {
      return NextResponse.json({ success: false, error: "Name required" }, { status: 400 })
    }

    if (!(data.address || "").trim()) {
      return NextResponse.json({ success: false, error: "Address required" }, { status: 400 })
    }

    // Add server IP to payload before forwarding to GHL
    const payload = { ...data, server_ip: ip }

    // 1) Forward to GHL/LeadConnector webhook
    const webhookUrl = process.env.WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } catch (e) {
        console.error("Webhook forward failed:", e)
      }
    }

    // 2) Fire Meta Conversions API Lead event (server-side, paired with the
    //    pixel-side Lead via shared event_id). This is what makes leads
    //    actually attribute in Ads Manager — pixel-only loses 30-50% to
    //    iOS/Safari/ad blockers without verified domain backing it up.
    const capiToken = process.env.META_CAPI_TOKEN
    const pixelId = process.env.META_PIXEL_ID
    if (capiToken && pixelId && data.meta_event_id) {
      const cookieHeader = request.headers.get("cookie")
      const fbp = readCookie(cookieHeader, "_fbp")
      const fbc = readCookie(cookieHeader, "_fbc")
      const addr = splitAddress(data.address || "")
      const eventSourceUrl = data.landing_page
        || request.headers.get("referer")
        || "https://va-homes.vercel.app/"
      const firstName = (data.firstName || (data.name || "").split(/\s+/)[0] || "").trim()
      const lastName = (data.lastName || (data.name || "").split(/\s+/).slice(1).join(" ") || "").trim()

      await sendCapiLead({
        pixelId,
        token: capiToken,
        eventId: data.meta_event_id,
        eventName: data.meta_event_name || "Lead",
        value: typeof data.meta_value === "number" ? data.meta_value : 0,
        eventSourceUrl,
        clientIp: ip,
        userAgent: request.headers.get("user-agent") || "",
        fbp,
        fbc,
        email,
        phone,
        firstName,
        lastName,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
