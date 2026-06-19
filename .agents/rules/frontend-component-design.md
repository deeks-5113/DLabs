---
trigger: always_on
---

# Skill: Generate DLabs Component

## Description
Generates React components strictly following the clinical Light Mode brand guidelines of DLabs, utilizing precise Tailwind hex codes, split typography, and preventative UX states. Trigger this skill whenever the user asks to build, design, or scaffold a new frontend UI element.

## Goal
Ensure all generated frontend code automatically adheres to the DLabs design philosophy (no pure black, specific serif/sans-serif fonts, and soft semantic colors) without requiring manual CSS revisions.

## Constraints
- **NO Pure Black:** Never use `#000000`. Use `#3F3A3A` for dark elements.
- **NO Generic Tailwind Colors:** Never use `bg-green-500`. Use `#3CB577` (Primary) and `#9FF279` (Accent).
- **NO Dark Mode:** The application is strictly Light Mode. Use `#EDEDED` or `#F8F9FA` for app backgrounds.
- **NO Side-by-Side Splits for Inputs:** Keep forms linear unless explicitly told otherwise.

## Instructions
1. **Analyze the Request:** Determine the type of component (Dashboard, Table, Form) the user needs.
2. **Setup the Surface:** Place the primary content inside a pure white card (`bg-white shadow-sm rounded-lg border border-gray-100`) sitting on the light gray app background.
3. **Apply Typography:** - Apply the serif font (`font-serif`, `Gentium Plus`) to the main headers.
   - Apply the sans-serif font (`font-sans`, `Inter`) to all dense data, inputs, and buttons.
   - Ensure numbers use `tabular-nums`.
4. **Style Actions:** - Primary buttons must be `bg-[#3CB577] text-white`.
   - Ensure buttons that rely on prerequisites have disabled states (`opacity-50 cursor-not-allowed grayscale`).
5. **Format Localization:** Ensure dates default to `DD/MM/YYYY` and currencies default to the `₹` symbol with Indian comma separation.
6. **Output the Code:** Generate the final React component code cleanly without extra placeholder text.