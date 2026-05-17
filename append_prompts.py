import os

NEW_SECTIONS = """
## 5. Global App Navigation Rule (Paste this before your code)

--------------------------------------------------
**App Navigation & Routing Context:**
Please ensure that all generated sidebar links, header links, and internal buttons use Next.js `<Link href='/path'>` components instead of static `<button>` tags, and explicitly route to these exact paths:
- Dashboard -> `/dashboard`
- Inbox (Messages/Call Logs) -> `/inbox`
- Calls -> `/calls`
- Contacts -> `/contacts`
- Analytics -> `/analytics`
- Reviews -> `/reviews`
- Campaigns -> `/campaigns`
- Settings -> `/settings`

Do NOT break existing `onClick` handlers or `useState` hooks. If my code has an `onClick={handleSave}`, make sure your redesigned button keeps that exact `onClick`.
--------------------------------------------------

## 6. Omnichannel Inbox (SMS, WhatsApp, Facebook, Instagram)

--------------------------------------------------
### Global Design & Spacing Rules
> **Micro-Design & Spacing Rules:** 
> - **Buttons:** Use generous padding (e.g., `px-5 py-2.5` or `px-6 py-3`). Buttons must have slightly rounded corners (`rounded-lg` or `rounded-xl`), smooth hover states (`hover:-translate-y-0.5 hover:shadow-md transition-all`), and clear focus rings. 
> - **Spacing:** Maintain strict visual hierarchy. Use ample whitespace (`gap-6` or `gap-8`) between major sections, and tight spacing (`gap-2` or `gap-3`) for related micro-elements.
> - **Cards:** All cards should have uniform padding (e.g., `p-6`), subtle inner borders (`border border-slate-200/50`), and soft shadows.

Design an 'Omnichannel Inbox' page for a SaaS app.
Layout: 
1. The left sidebar should list all active conversations. Above the conversation list, add pill-shaped filter buttons for channel types: All, SMS, WhatsApp, Facebook, Instagram. Use the appropriate brand colors for these filters (e.g., green for WhatsApp, blue for Facebook, gradient for Instagram).
2. The middle panel should display the chat thread. The message bubbles should indicate which channel they came from using a tiny icon (e.g., an Instagram logo next to the timestamp).
3. The right panel should show contact details (name, phone number, and placeholder social profiles).
4. The message input box should have a dropdown to select which channel the business is replying from.

Please rewrite my existing code below to use this new design. **Keep all of my React state (`conversations`, `apiFetch` calls, etc.) exactly the same.** Only change the Tailwind CSS, HTML structure, and UI layout. Add the new UI elements for the Facebook/Instagram tabs as non-functional placeholders for now.

Here is my existing code:

```tsx
"""

out_lines = [NEW_SECTIONS]

try:
    with open("app/inbox/page.tsx", "r", encoding="utf-8") as f:
        code = f.read()
        out_lines.append(code)
except Exception as e:
    out_lines.append(f"// Error reading file app/inbox/page.tsx: {e}")
    
out_lines.append("\n```\n")
out_lines.append("--------------------------------------------------\n\n")

with open("READY_PROMPTS.md", "a", encoding="utf-8") as f:
    f.writelines(out_lines)

print("Appended new sections to READY_PROMPTS.md successfully!")
