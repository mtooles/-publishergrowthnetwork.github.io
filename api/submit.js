const Airtable = require('airtable');

const cleanObj = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
            delete obj[key];
        }
    });
    return obj;
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const payload = req.body;

        // Ensure API key is configured
        if (!process.env.AIRTABLE_API_KEY) {
            console.error("Missing AIRTABLE_API_KEY environment variable");
            return res.status(500).json({ error: 'Server misconfiguration: Missing Airtable API Key.' });
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('appGm32pwuxPlQIqW');

        // Step 1: Create Brokerage Submissions parent row
        const submissionData = cleanObj({
            "full_name": payload.submission.full_name,
            "email": payload.submission.email,
            "questionnaire_date": payload.submission.questionnaire_date,
            "has_website": payload.submission.has_website,
            "total_monthly_revenue_combined": payload.submission.total_monthly_revenue_combined,
            "monthly_revenue_goal": payload.submission.monthly_revenue_goal,
            "anything_else": payload.submission.anything_else,
            "Submission Status": "New"
        });

        const submissionRecords = await base('tblseyuGjcpCYUOKb').create([
            { fields: submissionData }
        ]);

        const submissionRecordId = submissionRecords[0].getId();

        // Step 2: Loop through pages[] and create Brokerage Pages rows
        if (payload.pages && payload.pages.length > 0) {
            const pagesToCreate = payload.pages.map((page, index) => {
                const positionStr = index < 4 ? `Page ${index + 1}` : `Page 5+`;

                const fields = cleanObj({
                    "Submission": [submissionRecordId],
                    "Page Position in Submission": positionStr,
                    "facebook_page_url": page.facebook_page_url,
                    "followers": page.followers,
                    "usa_percent": page.usa_percent,
                    "other_tier1_percent": page.other_tier1_percent,
                    "cm_status": page.cm_status,
                    "cm_earnings_per_month": page.cm_earnings_per_month,
                    "page_niche": page.page_niche,
                    "fldrRIzH7Opf5AbMi": page.page_niche_category, // Page Niche Category
                    "recent_performance_trend": page.recent_performance_trend,
                    "active_violations": page.active_violations,
                    "violation_description": page.violation_description,
                    "payout_settings_status": page.payout_settings_status,
                    "suspended_or_banned": page.suspended_or_banned
                });

                return { fields };
            });

            // Chunking array into batches of 10
            for (let i = 0; i < pagesToCreate.length; i += 10) {
                const chunk = pagesToCreate.slice(i, i + 10);
                await base('tblNomXW8JwVmk7SK').create(chunk);
            }
        }

        // Step 3: If has_website = "Yes", create Brokerage Websites rows
        if (payload.submission.has_website === 'Yes' && payload.websites && payload.websites.length > 0) {
            const websitesToCreate = payload.websites.map((site, index) => {
                const positionStr = index < 4 ? `Website ${index + 1}` : `Website 5+`;

                const fields = cleanObj({
                    "Submission": [submissionRecordId],
                    "Website Position in Submission": positionStr,
                    "website_url": site.website_url,
                    "monthly_ad_revenue": site.monthly_ad_revenue,
                    "rpm": site.rpm,
                    "rpm_unknown": site.rpm_unknown,
                    "ad_network": site.ad_network,
                    "ad_network_other": site.ad_network_other,
                    "traffic_facebook_percent": site.traffic_facebook_percent,
                    "traffic_google_percent": site.traffic_google_percent,
                    "traffic_pinterest_percent": site.traffic_pinterest_percent,
                    "traffic_email_percent": site.traffic_email_percent,
                    "traffic_ai_percent": site.traffic_ai_percent,
                    "traffic_other_percent": site.traffic_other_percent,
                    "analytics_unavailable": site.analytics_unavailable,
                    "revenue_streams": site.revenue_streams,
                    "revenue_streams_other": site.revenue_streams_other,
                    "content_creation_method": site.content_creation_method,
                    "website_topic": site.website_topic,
                    "website_topic_other": site.website_topic_other,
                    "fld49YrCNrWho8OlE": site.web_niche_category, // Web Niche Category
                    "website_performance_trend": site.website_performance_trend,
                    "active_penalties": site.active_penalties,
                    "penalty_description": site.penalty_description,
                    "monthly_visitors": site.monthly_visitors
                });

                return { fields };
            });

            for (let i = 0; i < websitesToCreate.length; i += 10) {
                const chunk = websitesToCreate.slice(i, i + 10);
                await base('tblrA0Q9n7kESOZgY').create(chunk);
            }
        }

        // Return success response to the frontend
        return res.status(200).json({ success: true, message: 'Submission successful', submissionId: submissionRecordId });

    } catch (error) {
        console.error("Airtable API Error:", error);
        return res.status(500).json({ error: 'Failed to process submission. Please try again later.' });
    }
}