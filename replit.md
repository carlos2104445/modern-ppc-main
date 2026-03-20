# AdConnect PPC/PTC Platform

## Overview

AdConnect is a comprehensive Pay-Per-Click (PPC) and Paid-To-Click (PTC) advertising platform designed to enable users to earn money by viewing ads and advertisers to create and manage campaigns. It features a complete admin panel for operational management and uses Ethiopian Birr (ETB) as its primary currency. The project aims to deliver a robust, modern advertising solution with a fintech/SaaS aesthetic, focusing on business vision, market potential, and project ambitions to provide a modern and robust advertising solution.

## User Preferences

I prefer iterative development with clear communication at each stage. Please use simple, direct language in explanations. For coding, I favor a functional programming style where appropriate. Before implementing any major architectural changes or new features, please ask for my approval. Ensure all interactive elements have unique test IDs for automated testing.

## System Architecture

### Design System

- **Primary Color:** Professional Blue (220 90% 56%).
- **Aesthetic:** Fintech/SaaS, inspired by Stripe Dashboard, Linear, and Google Ads.
- **Typography:** Inter (UI), JetBrains Mono (monospace).
- **Theme:** Full dark mode support with a theme toggle.

### Technical Implementation

- **Frontend:** React + TypeScript with Vite, Tailwind CSS, and Shadcn UI components.
- **Routing:** Wouter.
- **State Management:** TanStack Query (React Query).
- **Backend:** Express.js for API routes.
- **Storage:** In-memory storage (MemStorage) with future plans for database integration.
- **Currency:** All monetary values are formatted and displayed in Ethiopian Birr (ETB).
- **Responsiveness:** Fully responsive design.
- **Form Validation:** Zod.
- **User Feedback:** Toast notifications.
- **User Registration:** Requires phone number to prevent multiple sign-ups; date of birth is optional for security.

### Feature Specifications

#### Public Pages

- **Landing Page:** Hero section, feature highlights, testimonials, statistics, CTAs, trust badges, pricing preview, enhanced footer with legal links.
- **Authentication:** Sign In, Register with real-time validations, social login.
- **Pricing Page:** Three tiers (Free, Premium, Business) with feature comparison and FAQ.
- **About Page:** Company information and mission.
- **Blog:** Public-facing blog with categories, search, and SEO optimization.
- **Legal Pages:** Privacy Policy, Terms of Service, Cookie Policy, GDPR compliance pages.
- **FAQ Page:** Searchable and category-filtered FAQs with an accordion UI.

#### User Dashboard

- **Overview:** Earnings summary, quick stats, recent activity.
- **Earn Money:** Ad viewer dialog for multi-format ads, ads grid.
- **Campaigns:** Campaign creation dialog (Link, YouTube, Banner), live preview, budget, targeting, campaign management.
- **Wallet:** Balance, deposit/withdraw dialogs, transaction history.
- **Payment Methods:** Full CRUD for saved cards and bank accounts, set default payment method, masked sensitive information.
- **Referrals:** Invite dialog, shareable links, referral tree, commission structure.
- **Support:** Create ticket dialog, ticket management.
- **Settings:** Profile, KYC document upload, security, notifications.
- **Notifications Center:** In-app bell icon with unread count badge, dropdown panel with notification list (earning, campaign, withdrawal, referral types), mark as read functionality (individual and bulk), relative timestamps, empty state, and "View All" navigation.

#### Admin Panel

- **Authentication:** Admin login, password reset, protected routes, session management.
- **Admin Dashboard:** Overview metrics, activity, quick actions.
- **Customer Management:** User list with advanced filtering, customer details, activity logs, administrative actions.
- **KYC Management:** Pending reviews, review dialog, rejection reasons, resubmission tracking.
- **Roles & Staff:** CRUD system for roles with granular permissions, staff management.
- **Ad Approval:** Admin ad preview, approve/reject workflow with reasons.
- **Financials:** Revenue dashboard, withdrawal/deposit request management, transaction logs with search, configurable tax and fee percentages.
- **Subscription Plans:** CRUD management for subscription plans with pricing tiers, feature lists, usage limits (daily ad views, campaigns, active ads), withdrawal fee discounts, referral bonus multipliers, priority support/ad review flags, and display order control.
- **Support Tickets:** Ticket reply dialog, conversation history, status updates.
- **Communications:** Email composer with audience segmentation and scheduling.
- **Blog Management:** CRUD for posts, rich text editor, scheduling, categories, SEO.
- **Admin Campaigns:** Create platform-wide campaigns, budget, CPC, status control, click tracking.
- **FAQ Management:** Full CRUD operations for FAQs, category management, order control, publish toggles.
- **Audit Logs:** System tracking of all admin actions with timestamp, action type, resource, admin details, IP address, user agent, filtering by resource/action/admin, CSV export functionality.

#### Gamification System

- **Data Schema Implemented:**
  - Achievements with multi-condition JSON triggers, rarity levels, category-based organization
  - User achievement progress tracking with unique constraints
  - Daily/weekly challenges with timestamp-based scheduling and auto-repeat
  - User challenge progress tracking
  - Levels system with XP thresholds and earnings boost percentages
  - Special events with multipliers and scheduling (Weekend Warrior, Happy Hour, etc.)
  - Leaderboard settings with configurable prizes and eligibility
  - Streak tracking integrated into user profiles (current/longest streak, freeze protections)
  - Performance indexes on all high-volume lookup tables
- **Features Planned:**
  - Achievement badges (Common, Rare, Epic, Legendary)
  - Leaderboards: Top Earners, Advertisers, Referrers, Current Streaks
  - Daily challenges with rewards
  - XP and level progression with benefits
  - Limited-time events and tournaments
  - Admin control panel for all gamification aspects

## External Dependencies

The current implementation uses mock data. Future integrations will include:

- **Database:** PostgreSQL with Drizzle ORM.
- **Authentication System:** To be integrated.
- **Payment Gateway:** To be integrated.
- **Email Service:** For communication features.
