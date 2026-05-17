# AI UI Generation Prompts: Premium Voice App (Backend Aligned)

Use these prompts one by one in your AI design tool to generate the remaining screens. These prompts are specifically tailored to match the actual data models and capabilities of your Flask backend.

---

## 1. Call Logs & Emergency Dashboard

**Prompt:**
> Design the "Call Log" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Keep the dark sidebar and top navigation.
> **Main Content:** A data table to display call history based on the database schema.
> **Columns:** Date/Time, Caller (Name & Number), Duration (Seconds), Status (pills for: answered, missed, voicemail). 
> **Crucial Feature:** Add an "Emergency" column. Based on the backend, some calls trigger an emergency flag (using keywords). Show a red siren icon or "Yes/No" badge for emergency calls.
> **Click Action (Slide-out Panel):** When clicking a row, a right-side panel slides out showing the "SMS Log" for that specific call. Show a timeline of automated text messages sent to this caller after they missed the call, including the message status (sent/delivered).

---

## 2. Settings (Business Configuration)

**Prompt:**
> Design the "Settings" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** Create a multi-tab or sectioned layout for business configuration.
> **Section 1 - General & Hours:** Fields for Timezone, Owner Phone, and a Booking URL input. Include a weekly schedule selector for "Business Hours" (Mon-Sun, Open/Close times).
> **Section 2 - Auto-Responders:** Toggle switches for "Call Forwarding Enabled", "Auto-SMS Enabled", and "Auto-WhatsApp Enabled". Below these, provide large text area inputs for "Voice Message" (what the robot reads), "SMS Message", and "WhatsApp Message".
> **Section 3 - Emergency Keywords:** An input area where users can add/remove keywords (like "flood", "fire", "urgent") as pill-shaped tags.
> **Section 4 - Integrations:** Show connected "Twilio Number" and "WhatsApp Number".

---

## 3. Campaigns (Automated Follow-ups)

**Prompt:**
> Design the "Campaigns" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** A dashboard to manage automated messaging campaigns based on triggers.
> **Top Section:** A "+ Create Campaign" button.
> **Table/Cards:** List of campaigns showing: Campaign Name, Status (Active/Paused), Trigger Type (e.g., dropdown showing "Missed Call"), and Delay Hours (e.g., "Send after 24 hours").
> **Metrics:** For each campaign, show a mini-dashboard of its success: "Sent", "Replied", and "Booked" counts. Add a "Message Template" preview snippet.

---

## 4. Reviews (Reputation Management)

**Prompt:**
> Design the "Reviews" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** A table managing review requests sent to customers.
> **Top Section:** Metrics for "Total Requests Sent" and "Average Rating". A button for "Manual Request".
> **Data Table Columns:** Sent Date, Caller Name, Phone Number, Platform (e.g., Google logo), Status (Sent/Pending), and Rating (1-5 stars if they replied). If a review URL exists, show a "View Review" link.

---

## 5. Billing & Usage

**Prompt:**
> Design the "Billing" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** 
> **Top Section (Usage):** A progress bar showing "SMS Count This Month" against the plan's limit.
> **Middle Section (Plans):** Three pricing tier cards: "Starter", "Growth", and "Pro". Highlight the currently active plan. Show a badge if the account is "Suspended".
> **Bottom Section:** Stripe integration details—show a "Manage Subscription" button that would redirect to Stripe.

---

## 6. Messages (SMS & WhatsApp Inbox)

**Prompt:**
> Design the "Messages" screen for the "Premium Voice Enterprise Admin" dashboard. 
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** A "Unified Inbox" interface, but restricted to SMS and WhatsApp (no social media based on current backend). Split into two columns. 
> **Left Column (Chat List):** A list of recent conversations showing user avatar, name, last message snippet, and a small icon indicating the channel (SMS or WhatsApp).
> **Right Column (Active Chat):** The open conversation view with chat bubbles. Provide a simple input area at the bottom to reply manually via SMS/WhatsApp.

---

## 7. Contacts (Address Book)

**Prompt:**
> Design the "Contacts" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** A clean, searchable address book built from the call history.
> **Top Section:** A large search bar to find contacts by name or phone number, and an "Export CSV" button.
> **Data Table Columns:** Avatar (initials), Caller Name, Phone Number, Total Calls (a small numerical badge), and Last Contacted Date.
> **Style:** Make the layout feel like a lightweight CRM. Clicking a contact row should open a modal showing their recent call history.

---

## 8. Analytics (Deep Dive)

**Prompt:**
> Design the "Analytics" screen for the "Premium Voice Enterprise Admin" dashboard.
> **Layout:** Dark sidebar and top navigation.
> **Main Content:** A robust data visualization page expanding on the dashboard metrics.
> **Top Section:** A sophisticated date range picker (Today, 7 Days, 30 Days, 90 Days).
> **Charts Area:** 
> 1. A large full-width line chart showing "Call Volume over Time" with two lines: Total Calls and Missed Calls.
> 2. Below it, two half-width cards: 
>   - Card A: A Donut chart showing "Call Outcomes" (Answered, Missed, Voicemail). 
>   - Card B: A large metric display for "Estimated Revenue Recovered" (showing dollars saved by the auto-SMS follow-up).
