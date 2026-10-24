// Vercel serverless function: keeps the EmailOctopus API key off the public site.
//
// Environment variables (set in Vercel project settings):
//   EMAILOCTOPUS_API_KEY  - your EmailOctopus API key
//   EMAILOCTOPUS_LIST_ID  - the ID of the list new subscribers join
//   ALLOWED_ORIGIN        - your Framer site, e.g. https://yoursite.framer.website
//                           (use * only while testing)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function setCors(res, origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

export default async function handler(req, res) {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "*"
    setCors(res, allowedOrigin)

    if (req.method === "OPTIONS") {
        return res.status(204).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ ok: false, message: "Method not allowed." })
    }

    const apiKey = process.env.EMAILOCTOPUS_API_KEY
    const listId = process.env.EMAILOCTOPUS_LIST_ID

    if (!apiKey || !listId) {
        console.error("Missing EMAILOCTOPUS_API_KEY or EMAILOCTOPUS_LIST_ID")
        return res
            .status(500)
            .json({ ok: false, message: "Newsletter is not configured yet." })
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}
    const email = String(body.email || "").trim().toLowerCase()

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
        return res
            .status(400)
            .json({ ok: false, message: "Please enter a valid email address." })
    }

    try {
        const response = await fetch(
            `https://emailoctopus.com/api/1.6/lists/${encodeURIComponent(listId)}/contacts`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: apiKey, email_address: email }),
            }
        )

        const data = await response.json().catch(() => ({}))

        // Already subscribed counts as success, so repeat sign-ups don't look like errors.
        if (response.ok || data.error?.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
            return res.status(200).json({ ok: true })
        }

        console.error("EmailOctopus error", response.status, data)
        return res
            .status(502)
            .json({ ok: false, message: "We couldn't add you right now. Please try again." })
    } catch (error) {
        console.error("EmailOctopus request failed", error)
        return res
            .status(502)
            .json({ ok: false, message: "We couldn't add you right now. Please try again." })
    }
}
