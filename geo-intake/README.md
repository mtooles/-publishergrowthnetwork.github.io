# GEO Intake Form Setup Instructions

This directory contains the standalone `geo-intake.html` file designed to be hosted on Vercel. It collects data for the PIB GEO Audit and submits it directly to an N8N webhook.

## Architecture
- **Frontend:** Single-file HTML using Vue.js (via CDN) and Tailwind CSS (via CDN).
- **Backend/Logic:** All routing, validation, Airtable updates, and ConvertKit tagging are handled by a dedicated N8N webhook.
- **Hosting:** Vercel.

---

## Step 1: Configure N8N

Before deploying the form, you must set up the N8N workflow to catch the data.

1. Create a new N8N workflow (or edit your existing GEO Intake workflow).
2. Add a **Webhook** node as the trigger.
   - Set HTTP Method to `POST`.
   - Set Path to something like `geo-intake`.
   - Copy the **Production URL** of this webhook.
3. In the N8N workflow, the incoming JSON payload will contain the following keys (map these to Airtable/ConvertKit as specified in your docs):
   - `clientName` (maps to `fldtnp3DizTc8evL3`)
   - `brandName` (maps to `fldNbF918zi7HhY2m`)
   - `websiteUrl` (maps to `fldmDs5EcVQfkKyXd`)
   - `industry` (maps to `fldxKinaPg5XJzx4d`)
   - `coreService` (maps to `fldsEzzz0ugl91WTM`)
   - `niche` (maps to `fldQWj9So76r8a5QA`)
   - `mainProblem` (maps to `fldbD3ZHGvhfZdsc5`)
   - `competitors` (maps to `fldsSqq9hNXgZoNcf`)
   - `activeChannels` (maps to `fld5AZIsSSxAeSfBE`) - *Comma-separated string*
   - `hasCrunchbase` (Boolean)
   - `hasWikipedia` (Boolean)
   - `token` (String) - *Use this to verify the Stripe Order ID*
   - `customerEmail` (String) - *Use this to update ConvertKit*
   - `customerName` (String)
   - `submissionTimestamp` (ISO String)

4. **Add Logic to N8N:**
   - **Validation:** Check if the `token` is valid and hasn't expired. If invalid, the workflow should ideally respond with an HTTP 400 or 401 status so the frontend shows the "Link Expired" screen.
   - **Airtable:** Update the GEO Clients record matched by the Order ID (derived from the token). Set Status to `Ready for Audit`.
   - **ConvertKit:** Apply the `form-completed-geo-audit` tag. Update custom fields `pib_geo_brand_name` and `pib_geo_tier`.

5. **CRITICAL: Republish the N8N workflow.** (N8N changes do not take effect on the production webhook URL until activated/published).

---

## Step 2: Update the Form Code

1. Open `geo-intake.html` in your code editor.
2. Scroll down to the `<script>` section (around line 250).
3. Find the following line:
   ```javascript
   const WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE_URL/webhook/geo-intake';
   ```
4. Replace `'https://YOUR_N8N_INSTANCE_URL/webhook/geo-intake'` with the actual **Production Webhook URL** you copied from N8N in Step 1.
5. Save the file.

---

## Step 3: Deploy to Vercel

1. Commit `geo-intake.html` to your GitHub repository (or use the Vercel CLI).
2. Connect the repository to Vercel.
3. Ensure Vercel serves the `geo-intake.html` file at the desired path. (If the file is named `geo-intake.html` in the root, it will be available at `your-domain.com/geo-intake.html`. If you want it available at `/geo-intake`, you may need to configure a `vercel.json` rewrite, or simply rename the file to `index.html` inside a `geo-intake` folder).

---

## Step 4: Testing

1. Generate a test URL with a valid token and email.
   - Format: `https://your-vercel-domain.com/geo-intake.html?token=test_token_123&email=test@example.com&name=TestUser`
   - *(Note: Remember the Standing Protocol: Never test against real buyer email addresses).*
2. Open the URL. The form should load (it will show "Invalid link" if `token` and `email` are missing from the URL).
3. Fill out the form and click Submit.
4. Verify:
   - The frontend shows the success screen ("Thank you. Your audit is running.").
   - Check N8N executions to ensure the webhook received the payload successfully.
   - Check Airtable to confirm the record updated and Status flipped to "Ready for Audit".
   - Check ConvertKit to ensure the dummy test email received the tag.
