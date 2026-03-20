# Design Guidelines: PPC & PTC Advertising Platform

## Design Approach

**Selected Framework**: Design System Approach with Fintech/SaaS References  
**Primary Inspiration**: Stripe Dashboard + Linear's Clean Aesthetics + Google Ads Interface Patterns  
**Rationale**: This platform handles financial transactions and complex campaign data requiring trust, clarity, and information density. The design must prioritize usability and credibility while maintaining modern visual appeal.

## Core Design Principles

1. **Trust Through Clarity**: Clean layouts with clear visual hierarchy to build user confidence in financial operations
2. **Data-First Design**: Information should be scannable, organized, and actionable
3. **Contextual Depth**: Surface critical info at a glance, details on demand
4. **Dual-Interface Harmony**: User and Admin dashboards share visual DNA but serve different needs

---

## Color Palette

### Light Mode

- **Primary Brand**: 220 90% 56% (Professional Blue - trust and stability)
- **Primary Hover**: 220 90% 48%
- **Surface**: 0 0% 100% (Pure white cards/panels)
- **Background**: 220 15% 97% (Subtle warm gray)
- **Success/Earnings**: 142 71% 45% (Green for positive financial actions)
- **Warning/Pending**: 38 92% 50% (Amber for pending states)
- **Error/Rejected**: 0 72% 51% (Red for critical actions)
- **Text Primary**: 220 15% 15%
- **Text Secondary**: 220 10% 45%
- **Border**: 220 15% 88%

### Dark Mode

- **Primary Brand**: 220 90% 62%
- **Primary Hover**: 220 90% 70%
- **Surface**: 220 15% 12%
- **Background**: 220 15% 8%
- **Success**: 142 71% 48%
- **Warning**: 38 92% 55%
- **Error**: 0 72% 55%
- **Text Primary**: 220 15% 95%
- **Text Secondary**: 220 10% 65%
- **Border**: 220 15% 20%

**Accent Colors** (Use sparingly):

- **Highlight/Badge**: 270 70% 60% (Purple for premium features, subscription badges)

---

## Typography

**Primary Font**: Inter (Google Fonts - professional, highly legible for data)  
**Monospace**: JetBrains Mono (for wallet addresses, transaction IDs)

### Type Scale

- **Display (Hero)**: 3xl (30px) / 4xl (36px) - font-bold
- **H1 (Page Titles)**: 2xl (24px) - font-semibold
- **H2 (Section Headers)**: xl (20px) - font-semibold
- **H3 (Card Headers)**: lg (18px) - font-medium
- **Body**: base (16px) - font-normal
- **Small/Meta**: sm (14px) - font-normal
- **Caption/Labels**: xs (12px) - font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16  
**Common Patterns**:

- Card padding: p-6
- Section spacing: space-y-6 or space-y-8
- Page margins: px-6 md:px-8 lg:px-12
- Component gaps: gap-4 or gap-6

**Grid System**:

- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stats/metrics: grid-cols-2 md:grid-cols-4
- Content max-width: max-w-7xl mx-auto

**Sidebar Navigation**:

- Desktop: Fixed 256px width (w-64)
- Mobile: Slide-over drawer (full width)

---

## Component Library

### Dashboard Cards

- White/surface background with subtle border (border border-gray-200 dark:border-gray-800)
- Rounded corners (rounded-lg)
- Subtle shadow (shadow-sm hover:shadow-md transition)
- Header with icon + title, body with data, optional footer with action

### Data Tables

- Stripe-inspired design: zebra striping on hover only
- Sticky headers on scroll
- Sortable columns with subtle indicators
- Row actions (approve/reject/view) on hover
- Mobile: Stack cards instead of tables

### Stats Cards

- Large number display (text-3xl font-bold)
- Colored indicator dot for status
- Trend arrow (up/down with percentage)
- Micro-chart sparkline optional

### Forms & Inputs

- Floating labels or top-aligned labels
- Focus: ring-2 ring-primary
- Validation states with inline icons and messages
- Multi-step forms use progress indicator

### Buttons

- **Primary**: Solid primary color, white text, rounded-md
- **Secondary**: Outline with primary color
- **Ghost**: Transparent with hover background
- **Sizes**: sm (px-3 py-1.5), default (px-4 py-2), lg (px-6 py-3)

### Navigation

- **Top Bar**: Platform logo, search, notifications bell, user avatar dropdown
- **Sidebar**: Icon + label pattern, active state with primary background/text, section dividers
- **Breadcrumbs**: For admin deep navigation

### Modals & Overlays

- Backdrop: bg-black/50
- Panel: Centered, max-w-2xl, rounded-lg, shadow-2xl
- Close button: top-right, ghost style
- Actions: Bottom-aligned with primary + cancel buttons

---

## Feature-Specific Patterns

### Wallet Interface

- Large balance display at top (text-4xl font-bold)
- Quick action buttons: Deposit / Withdraw (prominent)
- Transaction table with type indicators (deposit/withdrawal/commission/click)
- Filterable by date range and type

### Ad Viewing (PTC)

- Card-based grid of available ads
- Each card shows: advertiser name, payout amount, estimated time
- Timer overlay during ad view (circular progress)
- "Complete" button activates only when timer done

### Campaign Management

- Campaign cards with status badges (Active/Paused/Completed)
- Inline metrics: clicks, spent, remaining budget
- Quick toggle for pause/resume
- Drill-down for detailed analytics (charts showing daily performance)

### Referral Tree Visualization

- Hierarchical tree or network graph
- Color-coded by level (Level 1/2/3)
- Node shows: avatar, name, earnings contributed
- Commission breakdown table below

### KYC Document Review (Admin)

- Split view: Document preview on left, approval form on right
- Image zoom capability
- Comparison with user profile data
- Approve/Reject with reason textarea

### Support Tickets

- List view with status badges (Open/In Progress/Resolved)
- Conversation thread UI (chat-style)
- Rich text editor for replies
- File attachment support

---

## Animations & Interactions

**Minimal & Purposeful**:

- Page transitions: Fade in (200ms)
- Hover states: Scale 1.02 or subtle shadow lift (150ms)
- Loading states: Skeleton screens (not spinners) for data tables
- Success actions: Subtle checkmark animation + green flash
- Avoid: Elaborate scroll animations, complex parallax

---

## Images

### Where to Use Images:

1. **User Dashboard Hero** (Optional): Abstract financial/growth graphic or empty state illustration when no data
2. **Empty States**: Custom illustrations for "No ads available", "No transactions yet", "No referrals"
3. **KYC Documents**: User-uploaded ID photos (displayed with zoom)
4. **User Avatars**: Profile pictures throughout (with fallback initials)
5. **Ad Previews**: Banner/thumbnail images shown in campaign cards

**No Large Hero Images**: This is a dashboard-first application, prioritize data visibility over marketing imagery

---

## Responsive Behavior

- **Desktop (1024px+)**: Sidebar + main content, 3-column card grids
- **Tablet (768-1023px)**: Collapsible sidebar, 2-column grids
- **Mobile (<768px)**: Bottom nav bar, single column, stacked cards replace tables

---

## Accessibility & Polish

- WCAG AA contrast ratios minimum
- Keyboard navigation for all actions
- Screen reader labels for icons
- Focus indicators prominent (ring-2)
- Error states clearly communicated
- Loading states for async actions
- Consistent dark mode across all inputs and components
