# Framer + EmailOctopus Newsletter

A newsletter signup form for a Framer site that adds subscribers to an EmailOctopus list. A small serverless proxy keeps your EmailOctopus API key off the public site.

```
┌──────────────┐   POST {email}   ┌──────────────────────┐   create contact   ┌─────────────┐
│ Framer site  │ ───────────────> │ api/subscribe (proxy)│ ─────────────────> │ EmailOctopus│
│ NewsletterForm│ <─────────────── │ holds API key        │ <───────────────── │ list        │
└──────────────┘   {ok, message}  └──────────────────────┘                    └─────────────┘
```

Subscribers added to the list trigger your EmailOctopus welcome automation (see [Setup](#4-set-up-the-welcome-automation)).

## Repository layout

```
.
├── api/
│   └── subscribe.js        # Serverless proxy: validates email, calls EmailOctopus
├── framer/
│   └── NewsletterForm.tsx  # Framer code component: the form UI
├── package.json            # Marks the project as ES modules
├── .gitignore
└── README.md
```

## Requirements

- A [Framer](https://framer.com) site
- An [EmailOctopus](https://emailoctopus.com) account with an API key and a list
- A [Vercel](https://vercel.com) account (free tier is enough), or another host that runs Node serverless functions

## Setup

### 1. Get your EmailOctopus credentials

1. Create an API key in your EmailOctopus account settings.
2. Open the list where new subscribers should go and copy its ID.

Never commit these values to the repository. They go into Vercel's environment variables (step 3).

### 2. Deploy the proxy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Before deploying, add these environment variables:

| Name | Value |
| --- | --- |
| `EMAILOCTOPUS_API_KEY` | Your EmailOctopus API key |
| `EMAILOCTOPUS_LIST_ID` | The ID of the list new subscribers join |
| `ALLOWED_ORIGIN` | Your Framer site, e.g. `https://yoursite.framer.website`. Use `*` only while testing |

4. Deploy. Vercel gives you a URL such as `https://your-project.vercel.app`.
5. Open `https://your-project.vercel.app/api/subscribe` in a browser. A "Method not allowed" message means the function is running.

### 3. Add the form to Framer

1. In Framer, open the **Assets** panel, choose **Code**, and create a new code file named `NewsletterForm`.
2. Paste in the contents of `framer/NewsletterForm.tsx`.
3. Replace `YOUR-PROXY.vercel.app` in `SUBSCRIBE_URL` with your Vercel domain.
4. Drag the component onto the page and adjust its text and colors in the property panel.
5. Publish the site.

### 4. Set up the welcome automation

1. In EmailOctopus, go to **Automations → Create**.
2. Choose the **Contact added** trigger.
3. Click **+** and add a **Send email** step. Write the email and save it.
4. Click **Start** to turn the automation on.

If your list uses double opt-in, subscribers must confirm before they're added, so the welcome email will only send after they confirm.

## Testing

1. Submit your own email on the published site. You should see the success message.
2. Check that the contact appears in your EmailOctopus list.
3. Check your inbox (and spam) for the welcome email.
4. Submit an invalid address such as `test@` and confirm the validation message appears.
5. Once everything works, change `ALLOWED_ORIGIN` from `*` to your exact site URL and redeploy.

## How it works

- **Validation** happens twice: in the browser (`NewsletterForm.tsx`) for fast feedback, and on the server (`subscribe.js`) so bad requests can't reach EmailOctopus.
- **Duplicates**: if someone signs up again, EmailOctopus reports the contact already exists. The proxy treats that as success, so repeat sign-ups don't show an error.
- **CORS**: `ALLOWED_ORIGIN` controls which site may call the proxy. Set it to your real site once testing is done.

## Troubleshooting

| Message or symptom | Likely cause |
| --- | --- |
| "Newsletter is not configured yet." | An environment variable is missing or misspelled, or you didn't redeploy after adding it |
| "We couldn't add you right now." | Check Vercel → your project → **Logs** for the EmailOctopus error. It usually names a wrong key or list ID |
| Success message, but no contact in EmailOctopus | Double opt-in is on, or you're looking at a different list |
| Browser CORS error | `ALLOWED_ORIGIN` doesn't exactly match your site URL, including `https://` |
| Form does nothing | `SUBSCRIBE_URL` in the component still contains `YOUR-PROXY` |

## Notes

- The proxy uses EmailOctopus API v1.6, the version in its public documentation. If your account uses a different version, the endpoint may need changing.
- The proxy doesn't set a contact status. Check your list's opt-in settings so you know what subscribers see after signing up.

## License

Released under the [MIT License](LICENSE). You are free to use, modify, and sell it, as long as the copyright notice is kept.
