# AGENTS.md — Fursuit Commission Quote Form

## 1. Overview
A conditional commission quote form that shows or hides sections based on the selected package and parts, and displays a live **estimated** price.

**Studio scope (do not add anything outside this):**
- Style: **toony only** (no kemono, no realistic).
- Head: **foam base only**. Always fully lined. No moving jaw.
- Paws: toony only.
- Parts offered: Head, Paws, Tail, Arm Sleeves.

---

## 2. Pricing

Currency is **IDR only**, formatted in Indonesian standard (`Rp 3.400.000`, use `Intl.NumberFormat('id-ID')`).

Always display this notice next to the price:
> *Estimate only. The actual price will be determined after your selections and reference sheet are reviewed.*

### Base prices (raw numbers, not display format)
| Option | Price (IDR) | Included parts |
| :--- | :--- | :--- |
| Partial | 3400000 | Head, Paws, Tail, Arm Sleeves |
| Mini Partial | 3000000 | Head, Paws, Tail |
| Per Parts: Head | 2000000 | Head |
| Per Parts: Paws | 600000 | Paws |
| Per Parts: Tail | 600000 | Tail |
| Per Parts: Arm Sleeves | 400000 | Arm Sleeves |

### Rules
- Partial / Mini Partial: use the fixed bundle price.
- Per Parts: sum the prices of the checked parts.
- **Tail size adjusts the tail price (±20%)**, applied to the tail's individual price (600000), then added to the total:
  - Nub / Small: −20% (−120000)
  - Standard: no change
  - Floor-Dragger: +20% (+120000)
- Add-ons, fur color count, and markings do **not** change the estimate (priced manually).
- Label the total **"Estimated Base Price"**.

---

## 3. Form Fields & Conditional Logic

### Step 1: Always visible
1. **Commission Package** (radio): `Partial`, `Mini Partial`, `Per Parts`.

### Step 2: Per Parts selector
- Show **only** when package is `Per Parts`.
- Checkboxes: `Head`, `Paws`, `Tail`, `Arm Sleeves`.

### Step 3: Part sections

#### A. Head
- **Show when:** Partial, Mini Partial, or Per Parts with Head checked.
- Fields:
  - Eye Style: `2D Flat Eyes` / `3D Follow-Me Eyes`
  - Mouth Type: `Static Open Mouth` / `Closed Mouth`
  - Head Add-ons: free-text field (optional)
  - Head Measurements (required): Head Circumference (cm), Head Height (cm)

#### B. Paws
- **Show when:** Partial, Mini Partial, or Per Parts with Paws checked.
- Fields:
  - Finger Count: `4-Finger` / `5-Finger`

#### C. Tail
- **Show when:** Partial, Mini Partial, or Per Parts with Tail checked.
- Fields:
  - Tail Size: `Nub / Small`, `Standard`, `Floor-Dragger`
    - Show a note under the selection: *"Tail size adjusts the estimated price (Nub −20%, Floor-Dragger +20% on the tail price)."*
  - Belt Attachment: `Elastic Belt Loops` / `Hidden Nylon Kidney Belt`
  - Tail Add-ons (checkboxes): Squeaker, Removable stuffing zipper/velcro

#### D. Arm Sleeves
- **Show when:** Partial, or Per Parts with Arm Sleeves checked. **Hidden for Mini Partial.**
- Fields:
  - Attachment Style: `Elastic Shoulder/Back Strap` / `Fitted Bicep Elastic`
  - Length: `Bicep-Length` / `Full Shoulder-Length`
  - Measurements (required): Arm Length (cm), Upper Arm Circumference (cm), Wrist Width (cm)

### Step 4: Always visible
1. **Character Name & Species** (text)
2. **Character Reference Sheet** (URL or file upload; front and back, unshaded)
3. **Fur Color Count:** `1–2`, `3–4`, `5+`
4. **Markings** (checkboxes): Stripes, Spots, Gradients / Airbrushing, Asymmetrical Design
5. **Artistic Liberty:** `Follow ref strictly` / `Allow minor adjustments for fur availability`
6. **Contact:** Name / Handle, Primary Contact (Discord, Telegram, or Email), Country / Shipping Destination
7. **Required checkbox:** I am 18+ and agree to the Terms of Service.

---

## 4. Implementation Guidelines
- Inspect the existing codebase first. Match its framework, styling system, and form submission handler.
- When asked to review or change architecture, confirm target files before writing code.
- **State cleanup:** when a part is unchecked or the package changes, clear the hidden section's values. Hidden fields must not appear in the submitted payload or the price.
- **Validation:** block submission if `Per Parts` has zero parts checked, if visible measurement fields are empty, or if contact or ToS fields are empty.