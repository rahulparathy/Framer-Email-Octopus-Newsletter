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
        textColor,
        inputBackground,
        inputBorder,
        buttonBackground,
        buttonTextColor,
        borderRadius,
        height,
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
                gap: 12,
                width: "100%",
                boxSizing: "border-box",
                fontFamily: font?.fontFamily,
                fontSize: font?.fontSize,
                fontWeight: font?.fontWeight,
                color: textColor,
            }}
        >
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
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
                        height,
                        padding: "0 18px",
                        border: `1px solid ${inputBorder}`,
                        borderRadius,
                        background: inputBackground,
                        color: textColor,
                        font: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
                <button
                    type="submit"
                    disabled={disabled}
                    style={{
                        height,
                        padding: "0 28px",
                        border: "none",
                        borderRadius,
                        background: buttonBackground,
                        color: buttonTextColor,
                        font: "inherit",
                        fontWeight: 700,
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.7 : 1,
                        whiteSpace: "nowrap",
                        boxSizing: "border-box",
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
                        color: status === "error" ? "#ff6b6b" : textColor,
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
    textColor: { type: ControlType.Color, defaultValue: "#ffffff" },
    inputBackground: { type: ControlType.Color, defaultValue: "#141414" },
    inputBorder: { type: ControlType.Color, defaultValue: "#262626" },
    buttonBackground: { type: ControlType.Color, defaultValue: "#f8f9fa" },
    buttonTextColor: { type: ControlType.Color, defaultValue: "#000000" },
    borderRadius: { type: ControlType.String, defaultValue: "12px" },
    height: { type: ControlType.String, defaultValue: "56px" },
    font: { type: ControlType.Font, defaultValue: { fontSize: 16 } },
})
