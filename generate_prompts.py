import os

PROMPT_HEADER = """### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.
"""

PAGES = [
    {
        "name": "Client Dashboard",
        "file": "app/dashboard/page.tsx",
        "prompt": """Design the main Client Dashboard for "Ringo", a SaaS app that automatically texts back missed calls. 
Aesthetics: Professional, clean, and data-rich. Use white cards with very subtle borders and soft drop shadows on a very light gray background (`#F8FAFC`). Use the "Trusted Professional" design language (Blue & Slate).
Please rewrite my existing code below to use this new design. **Keep all of my React state, `apiFetch` calls, intervals, and components exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    },
    {
        "name": "Client Settings (Including WhatsApp)",
        "file": "app/settings/page.tsx",
        "prompt": """Design a highly organized Settings page for a SaaS application.
Layout: A left-hand vertical sub-navigation with the tabs: Profile, Business Info, Your Number, SMS & Voice, WhatsApp, and Notifications. The right side should contain the settings form for the active tab.
Use standard SaaS styling: crisp borders, clear labels, and a sticky "Save Changes" button.
Please rewrite my existing code below to use this new design. **Keep all of my React state, `apiFetch` calls, and logic exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    },
    {
        "name": "Admin Dashboard",
        "file": "app/admin/dashboard/page.tsx",
        "prompt": """Design an Admin/Superuser Dashboard for a multi-tenant SaaS application.
Aesthetics: Sleek, high-density, and highly analytical. 
Please rewrite my existing code below to use this new design. **Keep all of my React state, API fetches, and logic exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    },
    {
        "name": "Sidebar Component",
        "file": "components/ringo/Sidebar.tsx",
        "prompt": """Create the main layout shell and sidebar for a B2B SaaS application called "Ringo". 
Aesthetics: "Trusted Professional". Use Slate Gray (`#0F172A`) for the sidebar background, Trust Blue (`#2563EB`) for active states, and crisp white for the text.
Please rewrite my existing code below to use this new design. **Keep all of my React state, mapping logic, and routing exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout."""
    }
]

out_lines = ["# READY TO COPY & PASTE PROMPTS\n\n"]
out_lines.append("Copy everything between the dashed lines for each page and paste it directly into v0 or Stitch AI.\n\n")

for p in PAGES:
    out_lines.append(f"## {p['name']}\n\n")
    out_lines.append("--------------------------------------------------\n")
    out_lines.append(PROMPT_HEADER + "\n")
    out_lines.append(p["prompt"] + "\n\n")
    out_lines.append("Here is my existing code:\n\n```tsx\n")
    
    try:
        with open(p["file"], "r", encoding="utf-8") as f:
            code = f.read()
            out_lines.append(code)
    except Exception as e:
        out_lines.append(f"// Error reading file {p['file']}: {e}")
        
    out_lines.append("\n```\n")
    out_lines.append("--------------------------------------------------\n\n")

with open("READY_PROMPTS.md", "w", encoding="utf-8") as f:
    f.writelines(out_lines)

print("Generated READY_PROMPTS.md successfully!")
