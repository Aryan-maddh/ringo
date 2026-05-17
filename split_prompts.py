import os
import shutil

PROMPT_HEADER = """### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

### Global App Navigation Rule
> **App Navigation & Routing Context:**
> Please ensure that all generated sidebar links, header links, and internal buttons use Next.js `<Link href='/path'>` components instead of static `<button>` tags, and explicitly route to these exact paths:
> - Dashboard -> `/dashboard`
> - Inbox (Messages/Call Logs) -> `/inbox`
> - Calls -> `/calls`
> - Contacts -> `/contacts`
> - Analytics -> `/analytics`
> - Reviews -> `/reviews`
> - Campaigns -> `/campaigns`
> - Settings -> `/settings`
> 
> Do NOT break existing `onClick` handlers or `useState` hooks. If my code has an `onClick={handleSave}`, make sure your redesigned button keeps that exact `onClick`.

--------------------------------------------------
"""

PAGES = [
    {
        "filename": "1_Sidebar.md",
        "name": "Sidebar Component",
        "file": "components/ringo/Sidebar.tsx",
        "prompt": """Create the main layout shell and sidebar for a B2B SaaS application called "Ringo". 
Aesthetics: "Trusted Professional". Use Slate Gray (`#0F172A`) for the sidebar background, Trust Blue (`#2563EB`) for active states, and crisp white for the text.
Please rewrite my existing code below to use this new design. **Keep all of my React state, mapping logic, and routing exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    },
    {
        "filename": "2_Client_Dashboard.md",
        "name": "Client Dashboard",
        "file": "app/dashboard/page.tsx",
        "prompt": """Design the main Client Dashboard for "Ringo", a SaaS app that automatically texts back missed calls. 
Aesthetics: Professional, clean, and data-rich. Use white cards with very subtle borders and soft drop shadows on a very light gray background (`#F8FAFC`). Use the "Trusted Professional" design language (Blue & Slate).
Please rewrite my existing code below to use this new design. **Keep all of my React state, `apiFetch` calls, intervals, and components exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    },
    {
        "filename": "3_Client_Settings.md",
        "name": "Client Settings (Including WhatsApp)",
        "file": "app/settings/page.tsx",
        "prompt": """Design a highly organized Settings page for a SaaS application.
Layout: A left-hand vertical sub-navigation with the tabs: Profile, Business Info, Your Number, SMS & Voice, WhatsApp, and Notifications. The right side should contain the settings form for the active tab.
Use standard SaaS styling: crisp borders, clear labels, and a sticky "Save Changes" button.
Please rewrite my existing code below to use this new design. **Keep all of my React state, `apiFetch` calls, and logic exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    },
    {
        "filename": "4_Omnichannel_Inbox.md",
        "name": "Omnichannel Inbox (SMS, WhatsApp, FB, Instagram)",
        "file": "app/inbox/page.tsx",
        "prompt": """Design an 'Omnichannel Inbox' page for a SaaS app.
Layout: 
1. The left sidebar should list all active conversations. Above the conversation list, add pill-shaped filter buttons for channel types: All, SMS, WhatsApp, Facebook, Instagram. Use the appropriate brand colors for these filters (e.g., green for WhatsApp, blue for Facebook, gradient for Instagram).
2. The middle panel should display the chat thread. The message bubbles should indicate which channel they came from using a tiny icon (e.g., an Instagram logo next to the timestamp).
3. The right panel should show contact details (name, phone number, and placeholder social profiles).
4. The message input box should have a dropdown to select which channel the business is replying from.

Please rewrite my existing code below to use this new design. **Keep all of my React state (`conversations`, `apiFetch` calls, etc.) exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout. Add the new UI elements for the Facebook/Instagram tabs as non-functional placeholders for now."""
    },
    {
        "filename": "5_Admin_Dashboard.md",
        "name": "Admin Dashboard",
        "file": "app/admin/dashboard/page.tsx",
        "prompt": """Design an Admin/Superuser Dashboard for a multi-tenant SaaS application.
Aesthetics: Sleek, high-density, and highly analytical. 
Please rewrite my existing code below to use this new design. **Keep all of my React state, API fetches, and logic exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    }
]

out_dir = "ai_prompts"
if os.path.exists(out_dir):
    shutil.rmtree(out_dir)
os.makedirs(out_dir)

for p in PAGES:
    lines = []
    lines.append(f"# Prompt for: {p['name']}\n\n")
    lines.append("Copy the ENTIRE contents of this file (CTRL+A) and paste it directly into your AI generator (v0 or Stitch AI).\n\n")
    lines.append("--------------------------------------------------\n")
    lines.append(PROMPT_HEADER + "\n")
    lines.append(f"### Specific Page Prompt\n> {p['prompt']}\n\n")
    lines.append("--------------------------------------------------\n")
    lines.append("### My Existing Code:\n\n```tsx\n")
    
    try:
        with open(p["file"], "r", encoding="utf-8") as f:
            code = f.read()
            lines.append(code)
    except Exception as e:
        lines.append(f"// Error reading file {p['file']}: {e}")
        
    lines.append("\n```\n")
    
    with open(os.path.join(out_dir, p["filename"]), "w", encoding="utf-8") as f:
        f.writelines(lines)

print(f"Generated {len(PAGES)} individual prompt files in '{out_dir}/' successfully!")
