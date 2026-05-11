# GEO Intake Form Setup Instructions

This directory contains the standalone `geo-intake.html` file designed to be hosted on Vercel. It collects data for the PIB GEO Audit and submits it directly to an **Airtable Incoming Webhook**.

## Architecture
- **Frontend:** Single-file HTML using Vue.js (via CDN) and Tailwind CSS (via CDN).
- **Backend/Logic:** Submitted directly to an Airtable Automation webhook.
- **Hosting:** Vercel.

---

## Step 1: How to View the Form Locally (Testing Before Deployment)

If you double-click `geo-intake.html` to open it in your browser, you will likely see a message saying: **"This intake link has expired or is invalid."**

**This is normal and expected.** The form is designed with a security check to prevent abuse. It will *only* load if it detects a valid `token` and `email` in the URL (which will eventually be provided by the ConvertKit email after a Stripe purchase).

To view and test the form on your computer:

1. Open `geo-intake.html` in your web browser. The URL in your address bar will look something like this:
   `file:///Users/yourname/Downloads/geo-intake/geo-intake.html`
2. **Add dummy parameters to the end of the URL.** Click into your browser's address bar and append `?token=test_token_123&email=test@example.com` to the very end.
3. Your new URL should look like this:
   `file:///Users/yourname/Downloads/geo-intake/geo-intake.html?token=test_token_123&email=test@example.com`
4. Press **Enter** to reload the page. The form will now bypass the security check and display normally!

*(Note: Remember the Standing Protocol: Never test against real buyer email addresses).*

---

## Step 2: Configure Airtable Automation

Before deploying the form to production, you must set up an Airtable Automation to catch the data.

1. Go to your **Airtable PIB GEO base**.
2. Click **Automations** and create a new one.
3. For the Trigger, select **"When a webhook is received"**.
4. Airtable will generate a unique Webhook URL (it looks like `https://hooks.airtable.com/workflows/v1/genericWebhook/...`). **Copy this URL.**
5. To map your data, you must send a test payload. Open the form locally (following Step 1 above), fill it out with dummy data, and click Submit.
6. In Airtable, click **Test Trigger**. Airtable will catch the dummy data, showing you the structure.
7. Add an **Action** to your Automation:
   - Select **"Find records"** to find the existing GEO Clients record matching the incoming `token` (Order ID).
   - Add another Action to **"Update record"** using the Record ID found in the previous step. Map all the incoming webhook variables to their respective fields (Client Name, Brand Name, Industry, etc.).
   - Ensure you update the Status field to `Ready for Audit`.
8. *Note: If ConvertKit tagging is required, you must add an action script in Airtable or ensure a secondary process catches the 'Ready for Audit' status change to apply the tag.*
9. Turn the Automation **ON**.

---

## Step 3: Update the Form Code

1. Open `geo-intake.html` in your code editor.
2. Scroll down to the `<script>` section (around line 250).
3. Find the following line:
   ```javascript
   const WEBHOOK_URL = 'https://hooks.airtable.com/workflows/v1/genericWebhook/YOUR_WEBHOOK_ID_HERE'; // REPLACE THIS WITH YOUR AIRTABLE WEBHOOK URL
   ```
4. Replace the generic URL string with the actual **Airtable Webhook URL** you copied in Step 2.
5. Save the file.

---

## Step 4: Deploy to Vercel

1. Commit `geo-intake.html` to your GitHub repository (or use the Vercel CLI).
2. Connect the repository to Vercel.
3. Ensure Vercel serves the `geo-intake.html` file at the desired path. (If the file is named `geo-intake.html` in the root, it will be available at `your-domain.com/geo-intake.html`. If you want it available at `/geo-intake`, you may need to configure a `vercel.json` rewrite, or simply rename the file to `index.html` inside a `geo-intake` folder).

---

## Step 5: Final Production Testing

Once deployed to Vercel, generate a test URL pointing to your live Vercel domain with a valid token and email.
- Format: `https://your-vercel-domain.com/geo-intake.html?token=test_token_123&email=test@example.com&name=TestUser`

Fill out the form and verify:
- The frontend shows the success screen.
- Airtable updates to "Ready for Audit".
