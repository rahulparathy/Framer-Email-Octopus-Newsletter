import { useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// Set this to your deployed proxy URL, e.g. https://your-project.vercel.app/api/subscribe
const SUBSCRIBE_URL = "https://YOUR-PROXY.vercel.app/api/subscribe"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function NewsletterForm(props) {
    const {
        buttonText,
        placeholder,
        successMessage,
        errorMessage,
        background,
        textColor,
        accentColor,
        borderRadius,
        font,
    } = props

    const [email, setEmail] = useState("")
    const [status, setStatus] = useState("idle") // idle | loading | success | error
    const [message, setMessage] = useState("")

    async function handleSubmit(event) {
        event.preventDefault()
        const trimmed = email.trim()

        if (!EMAIL_PATTERN.test(trimmed)) {
            setStatus("error")
            setMessage("Please enter a valid email address.")
            return
        }

        setStatus("loading")
        setMessage("")

        try {
            const response = await fetch(SUBSCRIBE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmed }),
            })

            const data = await response.json().catch(() => ({}))

            if (response.ok && data.ok) {
                setStatus("success")
                setMessage(successMessage)
                setEmail("")
            } else {
                setStatus("error")
                setMessage(data.message || errorMessage)
            }
        } catch (error) {
            setStatus("error")
            setMessage(errorMessage)
        }
    }

    const disabled = status === "loading" || status === "success"

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                width: "100%",
                fontFamily: font?.fontFamily,
                fontSize: font?.fontSize,
                fontWeight: font?.fontWeight,
                color: textColor,
                background,
                padding: 16,
                boxSizing: "border-box",
            }}
        >
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    required
                    disabled={disabled}
                    aria-label="Email address"
                    style={{
                        flex: 1,
                        minWidth: 0,
                        padding: "12px 14px",
                        border: `1px solid ${textColor}33`,
                        borderRadius,
                        background: "transparent",
                        color: textColor,
                        font: "inherit",
                        outline: "none",
                    }}
                />
                <button
                    type="submit"
                    disabled={disabled}
                    style={{
                        padding: "12px 18px",
                        border: "none",
                        borderRadius,
                        background: accentColor,
                        color: background,
                        font: "inherit",
                        fontWeight: 600,
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.7 : 1,
                        whiteSpace: "nowrap",
                    }}
                >
                    {status === "loading" ? "Subscribing..." : buttonText}
                </button>
            </div>

            {message && (
                <p
                    role="status"
                    aria-live="polite"
                    style={{
                        margin: 0,
                        fontSize: "0.9em",
                        color: status === "error" ? "#d93025" : textColor,
                    }}
                >
                    {message}
                </p>
            )}
        </form>
    )
}

addPropertyControls(NewsletterForm, {
    buttonText: { type: ControlType.String, defaultValue: "Subscribe" },
    placeholder: { type: ControlType.String, defaultValue: "you@example.com" },
    successMessage: {
        type: ControlType.String,
        defaultValue: "Thanks! Check your inbox.",
    },
    errorMessage: {
        type: ControlType.String,
        defaultValue: "Something went wrong. Please try again.",
    },
    background: { type: ControlType.Color, defaultValue: "#ffffff" },
    textColor: { type: ControlType.Color, defaultValue: "#111111" },
    accentColor: { type: ControlType.Color, defaultValue: "#111111" },
    borderRadius: { type: ControlType.String, defaultValue: "8px" },
    font: { type: ControlType.Font, defaultValue: { fontSize: 16 } },
})
