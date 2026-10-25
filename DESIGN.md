---
version: alpha
name: Kantong
description: Calm, number-first design system for a personal dual-currency (IDR + NTD) money management PWA on iPhone.
colors:
  primary: "#111827"
  on-primary: "#FFFFFF"
  on-accent: "#FFFFFF"
  background: "#F4F5F9"
  surface: "#FFFFFF"
  surface-muted: "#EEF0F4"
  outline: "#E3E6EC"
  text-primary: "#0F172A"
  text-secondary: "#475569"
  text-disabled: "#94A3B8"
  income: "#15803D"
  expense: "#B91C1C"
  expense-container: "#FEE2E2"
  transfer: "#475569"
  interest: "#047857"
  interest-container: "#D1FAE5"
  warning: "#B45309"
  warning-container: "#FEF3C7"
  currency-idr: "#0369A1"
  currency-idr-container: "#E0F2FE"
  currency-ntd: "#7C3AED"
  currency-ntd-text: "#6D28D9"
  currency-ntd-container: "#EDE9FE"
  primary-dark: "#F8FAFC"
  on-primary-dark: "#0B0F17"
  background-dark: "#0B0F17"
  surface-dark: "#151A23"
  surface-muted-dark: "#1E2430"
  outline-dark: "#2A3140"
  text-primary-dark: "#F1F5F9"
  text-secondary-dark: "#94A3B8"
  income-dark: "#4ADE80"
  expense-dark: "#F87171"
  interest-dark: "#34D399"
  warning-dark: "#FBBF24"
  currency-idr-dark: "#075985"
  currency-ntd-dark: "#6D28D9"
typography:
  display-amount:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum'"
  amount-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "'tnum'"
  amount-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: "'tnum'"
  amount-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: "'tnum'"
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.35
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.2
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.06em
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  gutter: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 52px
    padding: 16px
  button-primary-disabled:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-disabled}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 52px
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 52px
    padding: 16px
  button-destructive:
    backgroundColor: "{colors.expense-container}"
    textColor: "{colors.expense}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 52px
  fab-add:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 56px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: 16px
  card-balance-idr:
    backgroundColor: "{colors.currency-idr}"
    textColor: "{colors.on-accent}"
    typography: "{typography.display-amount}"
    rounded: "{rounded.xl}"
    padding: 20px
  card-balance-ntd:
    backgroundColor: "{colors.currency-ntd}"
    textColor: "{colors.on-accent}"
    typography: "{typography.display-amount}"
    rounded: "{rounded.xl}"
    padding: 20px
  card-goal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.amount-md}"
    rounded: "{rounded.lg}"
    padding: 16px
  limit-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.amount-lg}"
    rounded: "{rounded.lg}"
    padding: 16px
  badge-idr:
    backgroundColor: "{colors.currency-idr-container}"
    textColor: "{colors.currency-idr}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-ntd:
    backgroundColor: "{colors.currency-ntd-container}"
    textColor: "{colors.currency-ntd-text}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: 4px
  badge-interest:
    backgroundColor: "{colors.interest-container}"
    textColor: "{colors.interest}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-neutral:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-warning:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.warning}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 6px
  chip-filter:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 32px
    padding: 12px
  chip-filter-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 32px
    padding: 12px
  chip-favorite:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 12px
  segmented-control:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 2px
  segmented-control-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
  input-field:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    height: 48px
    padding: 12px
  list-row-transaction:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    height: 64px
    padding: 16px
  list-row-scheduled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    height: 64px
    padding: 16px
  list-row-debt:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    height: 72px
    padding: 16px
  category-icon:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.md}"
    size: 40px
  keypad-key:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    typography: "{typography.amount-lg}"
    rounded: "{rounded.md}"
    height: 56px
  stepper:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
    typography: "{typography.amount-md}"
    rounded: "{rounded.full}"
    height: 36px
  stepper-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    size: 32px
  amount-income:
    textColor: "{colors.income}"
    typography: "{typography.amount-md}"
  amount-expense:
    textColor: "{colors.expense}"
    typography: "{typography.amount-md}"
  amount-transfer:
    textColor: "{colors.transfer}"
    typography: "{typography.amount-md}"
  progress-track:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.full}"
    height: 8px
  progress-fill-ok:
    backgroundColor: "{colors.income}"
    rounded: "{rounded.full}"
    height: 8px
  progress-fill-warning:
    backgroundColor: "{colors.warning}"
    rounded: "{rounded.full}"
    height: 8px
  progress-fill-over:
    backgroundColor: "{colors.expense}"
    rounded: "{rounded.full}"
    height: 8px
  progress-fill-idr:
    backgroundColor: "{colors.currency-idr}"
    rounded: "{rounded.full}"
    height: 8px
  progress-fill-ntd:
    backgroundColor: "{colors.currency-ntd}"
    rounded: "{rounded.full}"
    height: 8px
  progress-pace-marker:
    backgroundColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    width: 2px
    height: 14px
  banner-warning:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.warning}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: 12px
  toast:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: 12px
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: 24px
  tab-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-caps}"
    height: 84px
---

# Kantong — Design System

## Overview

Kantong is a **personal money management app for one person on iPhone**, installed as a PWA from Safari ("Add to Home Screen") and running full-screen like a native app. The user manages money in **two currencies**:

- **Indonesian Rupiah (IDR)**: several savings accounts across banks (BCA, SeaBank, Bank Jago). Some earn **daily interest**.
- **New Taiwan Dollar (NTD)**: cash ("Dompet NT$") and a bank account ("Bank NT$").

Core features: accounts per currency, quick transaction entry with favorites, cross-currency transfers, automatic daily interest, monthly spending limits, savings goals, scheduled bills, debts & receivables, cash counting, and reports with net worth.

The feel is **calm, tidy, and number-first**, like a well-kept paper ledger rebuilt with iOS sensibilities. It should look close to a native iOS app: large titles, grouped lists, bottom sheets, a bottom tab bar, and generous whitespace. Money amounts are the hero of every screen. Decoration is minimal.

**All UI copy is in Bahasa Indonesia.** Number formatting always uses Indonesian separators:
- Rupiah: `Rp1.250.000`
- NTD: `NT$1.250`
- Expense: `−Rp45.000` (minus sign + red). Income: `+NT$32.000` (plus sign + green). Transfer: `NT$5.000 → Rp2.550.000` (slate)
- Approximate converted totals are always prefixed with `≈`
- Hidden balances: `Rp•••••`

All sample data in mockups comes from **PRD.md, Lampiran A**. Reference moment: **Sabtu, 24 Okt 2026**, exchange rate **1 NT$ = Rp512**.

Personality keywords: *tenang (calm), jelas (clear), rapi (tidy), personal, trustworthy.*

## Colors

The palette is mostly neutral: an off-white background, white surfaces, and near-black ink. Color is reserved for **meaning**.

- **Primary (ink `#111827`)**: primary buttons, the center "+" button, selected chips, toasts, and the pace marker. In dark mode it flips to near-white `#F8FAFC` with dark text.
- **Currency identity**: each currency has its own accent so the user always knows which currency they are looking at.
  - **IDR = blue `#0369A1`**: IDR balance card, IDR badges, IDR chart series, progress of IDR savings goals.
  - **NTD = violet `#7C3AED`**: NTD balance card, NTD badges, NTD chart series, progress of NTD savings goals.
  - The balance hero cards use the solid accent with white text. Badges use the light container tint with accent-colored text.
- **Semantic money colors**:
  - **Income `#15803D`** (green) for income amounts, receivables totals, and healthy limit/budget progress (< 80%).
  - **Expense `#B91C1C`** (red) for expense amounts, debt totals, over-limit progress (≥ 100%), and destructive actions.
  - **Transfer `#475569`** (slate) for transfers, balance adjustments, and debt/receivable payment rows, which are neutral and are not income or spending.
  - **Interest `#047857`** (emerald) with its light container `#D1FAE5` for daily interest ("Bunga") badges and highlights. It is a special kind of income and always appears with a small "%" or sparkle icon.
  - **Warning `#B45309`** (amber) with container `#FEF3C7` for limits/budgets at 80–99%, goals behind schedule, and the backup banner.
- **Dark mode** follows the iPhone system setting. Use the `*-dark` tokens: background `#0B0F17`, surfaces `#151A23` and `#1E2430`, lighter semantic tints (income `#4ADE80`, expense `#F87171`, interest `#34D399`, warning `#FBBF24`), and slightly deeper currency card colors (IDR `#075985`, NTD `#6D28D9`) so white text stays readable. Light container tints become dark tints in dark mode (interest `#0D2E24`, warning `#33260B`, expense `#3B1518`, IDR `#0C2A3D`, NTD `#241B3D`), and currency text brightens to IDR `#38BDF8` / NTD `#C4B5FD`.

All text/background pairs meet WCAG AA (≥ 4.5:1). The only exception is `text-disabled`, which is used only for disabled controls.

## Typography

A single family, **Plus Jakarta Sans** (a typeface designed in Jakarta), keeps the app feeling local and friendly while staying very legible.

- **Amounts always use tabular numerals** (`tnum`) so digits line up in lists and don't jump when values change.
- `display-amount` (34px bold) is used only for the main total on a balance card and the amount being typed on the Add Transaction screen.
- `amount-lg` (22px) is for account balances, limit cards, and keypad keys. `amount-md` (16px) is for list amounts. `amount-sm` (13px) is for secondary amounts under a row.
- `headline-lg` (28px) is the iOS-style large title at the top of each tab screen ("Beranda", "Transaksi", "Rekening", "Laporan", "Pengaturan").
- `title-md` (17px semibold) is for section headers and row titles. `body-md` / `body-sm` are for secondary details (account name, time, note).
- `label-caps` (11px, tracked) is for currency badges ("IDR", "NTD"), section overlines ("RUPIAH · IDR"), and tab bar labels.
- Every text input uses at least **16px** (`body-lg`) so iOS Safari does not auto-zoom on focus.
- Use at most two weights per component. Bold is for numbers and titles, regular for supporting text.

## Layout

- **Base frame: iPhone, 390 × 844 pt**, portrait only. Respect the safe areas (status bar/Dynamic Island at the top, home indicator at the bottom).
- **Horizontal gutter: 16px.** Spacing follows a 4px scale (4, 8, 12, 16, 24, 32).
- **Bottom tab bar** (84px including home indicator) with 5 slots: **Beranda · Transaksi · [ + ] · Rekening · Laporan**. The center slot is a raised, circular 56px "+" button that opens the Add Transaction screen. Settings ("Pengaturan") is a gear icon in the top-right of Beranda.
- Tab screens start with a **large title** that collapses into a compact centered title on scroll. Directly under the title, some tabs have a **segmented control**:
  - Transaksi: **Riwayat · Terjadwal**
  - Rekening: **Rekening · Target · Utang**
  - Laporan: **Ringkasan · Budget**
- Content is a single column of **cards and grouped lists**. Related rows are grouped inside one rounded card with hairline dividers, inset by 16px, as in iOS Settings.
- The IDR and NTD **balance cards sit side by side in a horizontal snap carousel** on Beranda, with page dots.
- Secondary flows (Sesuaikan Saldo, Hitung Uang, Sisihkan, Atur Batas, pickers, filters, confirmations) open as **bottom sheets** with a grab handle.
- Lists are grouped by **date headers** ("Hari ini", "Kemarin", "Selasa, 20 Okt") with a per-day net subtotal on the right.
- Toasts float 12px above the tab bar.
- Touch targets are at least 44 × 44pt.
- Mockups are plain screens exactly 390px wide: no device frame, no phone mockup, no presentation background, no desktop canvas. Long screens may be taller than 844px.

## Elevation & Depth

Depth comes mostly from **tonal layering**, not shadows: the background is `#F4F5F9`, and cards are white with a 1px `#E3E6EC` outline (no outline in dark mode; use the lighter surface instead).

Only four things cast shadows:
1. The center **"+" button**: soft shadow `0 8px 24px rgba(15, 23, 42, 0.18)`.
2. **Bottom sheets**: `0 -8px 32px rgba(15, 23, 42, 0.12)` with a dimmed backdrop (40% black).
3. **Toasts**: `0 8px 24px rgba(15, 23, 42, 0.24)`.
4. **Balance cards**: a very soft colored glow in their own accent at 20% opacity.

The tab bar uses a translucent surface with background blur (iOS material) and a hairline top border.

## Shapes

- Cards, grouped lists, toasts, and banners: **16px** radius.
- Balance hero cards and bottom sheets (top corners): **24px**.
- Buttons, inputs, keypad keys, and category icon tiles: **12px**.
- Chips, badges, progress bars, steppers, the "+" button, and avatars: **fully rounded (pill/circle)**.
- Icons: **outlined, 1.75px stroke, rounded caps** (SF Symbols / Lucide style), 20–24px. Category icons sit inside a 40px rounded-square tile tinted with the category color at 15% opacity.
- Person avatars (debts) are 40px circles with the person's initial on a muted tint.

## Components

- **Balance card (`card-balance-idr` / `card-balance-ntd`)**: solid currency accent, white text. Top row: currency badge ("IDR" / "NTD") + label "Total Saldo". Middle: big total in `display-amount` (e.g. "Rp32.175.000"). Bottom row: balance change this month ("+Rp1.513.240 bulan ini") and the number of accounts ("3 rekening").
- **Account row**: 40px bank/cash icon tile, account name (`title-md`), type + currency underneath (`body-sm`, secondary), and the balance right-aligned (`amount-md`). Interest-bearing accounts show an emerald **interest badge** ("4% p.a. · +Rp1.280/hari"). Accounts with goal allocations show a secondary line "NT$6.000 dialokasikan ke target".
- **Transaction row (`list-row-transaction`)**: category icon tile, category name + note/account (secondary), and the amount right-aligned with sign and semantic color, with time under the amount. Small neutral tags: "Otomatis" (interest), "Terjadwal" (from a schedule). Interest rows for the same day are grouped into one expandable row ("Bunga Tabungan · 2 rekening · +Rp1.880").
- **Add Transaction screen**: segmented control on top (**Pengeluaran · Pemasukan · Transfer**), then a horizontally scrollable row of **favorite chips** (`chip-favorite`: white pill, 1px outline, star icon, label + amount, e.g. "☆ Bento NT$120"; the last chip is "+ Kelola"). Below: the large amount display with the currency prefix from the selected account, an account selector pill, a scrollable category grid, date and note rows, a "☆ Simpan sebagai favorit" toggle row, a **custom numeric keypad** (3×4 grid of `keypad-key`: 1–9, "000", "0", backspace), and a full-width primary **Simpan** button (`button-primary-disabled` while the amount is 0).
- **Segmented control**: muted track, selected segment is a white raised pill.
- **Chips (`chip-filter`)**: filter by currency, account, category, and type. The selected chip is ink with white text.
- **Monthly limit card (`limit-card`, "Batas bulan ini")**: one per currency. Currency badge + label "Batas pengeluaran NTD", the spent amount in `amount-lg` followed by "/ NT$15.000" in secondary text, and the percentage on the right in the status color. Below is a 10px progress bar (green < 80%, amber 80–99%, red ≥ 100%) with a thin ink **pace marker** (`progress-pace-marker`) at today's position in the month (77% on 24 Okt), then the caption "Sisa NT$2.520 · NT$315/hari · di atas jadwal". Over the limit, the caption becomes "Lewat Rp30.000" in red.
- **Budget row** (per category): category icon, name, "NT$4.380 / NT$6.000", and an 8px progress bar with the same colors, with "Sisa NT$1.620 · NT$202/hari" below.
- **Goal card (`card-goal`)**: icon + goal name (`title-md`), currency badge, mode caption ("Ikuti saldo SeaBank" / "Disisihkan dari Bank NT$"), "Rp14.600.000 / Rp20.000.000", the percentage, and an 8px progress bar filled with the **goal's currency color** (`progress-fill-idr` / `progress-fill-ntd`). Footer: deadline, needed per month, and a status badge: "Sesuai jadwal" (`badge-interest`) or "Di belakang jadwal" (`badge-warning`), plus "Estimasi tercapai: Jun 2027".
- **Scheduled row (`list-row-scheduled`)**: category icon tile, name ("Sewa kamar"), rule + account in secondary text ("Tiap tgl 1 · Bank NT$"), the amount right-aligned with sign and color, the next date below ("1 Nov · 8 hari lagi"), a neutral badge for the posting mode ("Otomatis" / "Konfirmasi dulu"), and a small calendar icon when a Calendar reminder was added.
- **Debt row (`list-row-debt`)**: 40px avatar with the initial, the person's name, direction in secondary text ("Piutang · dari Dompet NT$" / "Utang · ke BCA"), the remaining amount right-aligned (receivables in green, debts in red), a thin progress bar showing how much has been paid, and the due date ("Jatuh tempo 10 Nov · 17 hari lagi") with a status badge ("Sebagian" / "Belum dibayar").
- **Cash counter (Hitung Uang sheet)**: one row per denomination ("NT$1.000", "NT$500", … "NT$1"), with banknotes and coins in two groups. Each row has a `stepper` pill with − / + `stepper-button`s and the count in the middle, and the row subtotal right-aligned. The sticky footer shows "Total dihitung NT$3.585", "Saldo di Kantong NT$3.600", and "Selisih −NT$15", plus a primary button "Simpan sebagai Penyesuaian".
- **Charts**: a donut for spending by category (center label shows the total; at most 5 slices, the rest merged into "Lainnya"), grouped bars for monthly income vs expense (income green, expense red), a **net worth line chart** (ink line with a soft 10% ink area fill, last point highlighted with a dot and value label), and a mini emerald bar chart for interest per month. Charts are clean, with minimal gridlines and labels in `body-sm`.
- **Buttons**: primary (ink, full width, 52px), secondary (muted), destructive (light red container with red text), and disabled (muted with `text-disabled` text).
- **Toast**: ink background, white text, 16px radius, a leading status icon (amber for warnings, green check for success), an optional second line at 70% white, and one text action on the right ("Lihat" / "Urungkan"). Auto-dismisses after **5 seconds**.
- **Banner (`banner-warning`)**: a light amber container with an icon, e.g. "Sudah 9 hari belum backup · Backup sekarang". It is shown only when the last backup was more than 7 days ago.
- **Launch intro**: once per app launch. The app icon (112px, 26px radius) sits centred exactly where the static first frame in index.html put it, then the pocket mascot does a squash-and-bounce "hug" (0.75s), three warm yellow (#FBBF24) four-point sparkles twinkle around it, and "Kantong" (`headline-lg`) with the tagline "Rupiah & NT$ dalam satu kantong" rises from below. After about 1.5s the whole layer fades out with a slight zoom. Tap skips it; Reduce Motion turns the animation off.
- **App icon**: the "Si Kantong" mascot: a navy fabric pocket with cream stitching hugging a blue coin with a kawung motif (IDR, Indonesia) and a violet coin with a plum blossom (NTD, Taiwan), on a lavender-to-sky gradient. Source in `design/logo/`.
- **Empty states**: a simple line illustration, one sentence, and one primary button (e.g. "Belum ada target · Buat target pertama").

## Do's and Don'ts

- Do always show the currency prefix (`Rp` or `NT$`) on every amount. Never show a bare number.
- Do keep IDR and NTD visually separate (blue vs violet). Only combine them in totals marked with `≈` and the exchange rate used.
- Do use a sign (+/−) and an icon in addition to color for income and expense. Color is never the only signal.
- Do use tabular numerals for all amounts and right-align amounts in lists.
- Do show limit, budget, and goal status with text as well as color ("83%", "Lewat Rp30.000", "Di belakang jadwal"), and show the remaining amount per day for limits.
- Do keep the add flow to ≤ 4 taps, and a favorite to 2 taps (tap "+", then tap the chip).
- Do use Bahasa Indonesia for all labels and messages.
- Do take sample numbers from PRD.md Lampiran A so every screen agrees with every other screen.
- Don't use the currency accent colors for anything other than currency identity (balance cards, currency badges, chart series, goal progress).
- Don't add decorative gradients, stock photos, or illustrations on data screens.
- Don't put more than one primary (ink) button on a screen.
- Don't use text smaller than 11px, or input text smaller than 16px.
- Do maintain WCAG AA contrast (4.5:1) in both light and dark mode.
