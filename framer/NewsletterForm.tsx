import { useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// Set this to your deployed proxy URL, e.g. https://your-project.vercel.app/api/subscribe
const SUBSCRIBE_URL = "https://YOUR-PROXY.vercel.app/api/subscribe"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function NewsletterForm(props) {
    const {
        buttonText,
        placeholder,
        successMessage,
        errorMessage,
        textColor,
        inputBackground,
        inputBorder,
        focusBorder,
        buttonBackground,
        buttonTextColor,
        borderRadius,
        // Named fieldHeight on purpose: Framer reserves `height` for the
        // layer's own size, which overrides a control with that name and
        // collapses the field to its content height.
        fieldHeight,
        font,
    } = props

    const [email, setEmail] = useState("")
    const [status, setStatus] = useState("idle") // idle | loading | success | error
    const [message, setMessage] = useState("")
    const [focused, setFocused] = useState(false)
    const [hovered, setHovered] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        const trimmed = email.trim()

        if (!trimmed) {
            setStatus("error")
            setMessage("Please enter your email address.")
            return
        }

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
    const size = Number(fieldHeight) || 48

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
                boxSizing: "border-box",
                ...font,
                color: textColor,
            }}
        >
            {/* Wraps on narrow screens: the button drops below the field and fills the row */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    width: "100%",
                }}
            >
                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        if (status === "error") {
                            setStatus("idle")
                            setMessage("")
                        }
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-label="Email address"
                    aria-invalid={status === "error"}
                    style={{
                        flex: "100 1 240px",
                        minWidth: 0,
                        height: size,
                        padding: "0 18px",
                        border: `1px solid ${focused ? focusBorder : inputBorder}`,
                        borderRadius,
                        background: inputBackground,
                        color: textColor,
                        font: "inherit",
                        outline: "none",
                        boxShadow: focused
                            ? "0 0 0 3px rgba(255, 255, 255, 0.12)"
                            : "none",
                        transition:
                            "border-color 0.15s ease, box-shadow 0.15s ease",
                        boxSizing: "border-box",
                    }}
                />
                <button
                    type="submit"
                    disabled={disabled}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        flex: "1 0 120px",
                        height: size,
                        padding: "0 24px",
                        border: "none",
                        borderRadius,
                        background: buttonBackground,
                        color: buttonTextColor,
                        font: "inherit",
                        fontWeight: 600,
                        cursor: disabled ? "default" : "pointer",
                        opacity: disabled ? 0.7 : hovered ? 0.88 : 1,
                        transition: "opacity 0.15s ease",
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
    focusBorder: { type: ControlType.Color, defaultValue: "#737373" },
    buttonBackground: { type: ControlType.Color, defaultValue: "#f8f9fa" },
    buttonTextColor: { type: ControlType.Color, defaultValue: "#000000" },
    borderRadius: { type: ControlType.String, defaultValue: "12px" },
    fieldHeight: {
        type: ControlType.Number,
        title: "Field Height",
        defaultValue: 48,
        min: 36,
        max: 72,
        step: 2,
        unit: "px",
        displayStepper: true,
    },
    font: {
        type: ControlType.Font,
        controls: "extended",
        defaultValue: { fontSize: 16 },
    },
})
