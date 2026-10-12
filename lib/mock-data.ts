import { ChallengerPageData, MockPreset } from "./types";

export const MOCK_PRESET_GYM: ChallengerPageData = {
  id: "preset-gym-pulsefit",
  createdAt: 1718000000000,
  competitorName: "MegaGym Global",
  challengerName: "PulseFit Studio",
  hero: {
    badge: "Tired of MegaGym's Cancellation Maze & Broken Equipment?",
    headline: "The Anti-Gym That Respects Your Time, Money, and Sanity",
    subheadline:
      "No certified letters to cancel. No waiting 20 minutes for a bench. Just boutique strength & conditioning with capped memberships and zero sleazy fine print.",
    ctaPrimary: "Claim Your 14-Day Free Switcher Pass",
    ctaSecondary: "Compare Floor Specs & Pricing",
  },
  battlecards: [
    {
      id: "bc-gym-1",
      painPointCategory: "Predatory Billing & Cancellation Traps",
      competitorQuote:
        "\"Tried to cancel for 3 months after moving. They insisted I send a certified handwritten letter to an address in Texas or pay a $180 early termination fee. Charged me twice more anyway!\"",
      counterPitch:
        "1-Click In-App Cancellation with Zero Termination Fees. If you want to leave or freeze your membership, click one toggle in the app. No calls, no certified letters, no retention guilt trips.",
      iconName: "CreditCard",
    },
    {
      id: "bc-gym-2",
      painPointCategory: "Broken Equipment & Neglected Facilities",
      competitorQuote:
        "\"Half the cable machines have had 'Out of Order' signs taped to them since November. Locker room showers are moldy and freezing cold. Where does our $75/mo actually go?\"",
      counterPitch:
        "100% Commercial Grade Equipment with a 24-Hour Repair Guarantee. Rogue racks, Eleiko plates, and Concept2 rowers inspected daily. If a machine goes down, we fix or replace it within 24 hours.",
      iconName: "Wrench",
    },
    {
      id: "bc-gym-3",
      painPointCategory: "Dangerous Overcrowding & Zero Coaching",
      competitorQuote:
        "\"At 5:30 PM you literally cannot walk. People hovering over your shoulder waiting for barbells. Staff just sits behind the front desk scrolling TikTok while people drop weights dangerously.\"",
      counterPitch:
        "Capped Capacity (Max 35 Athletes per Hour) with Floor Coaches on Duty. Reserve your training block effortlessly. A certified strength coach is always on the floor to adjust form and spot lifts.",
      iconName: "Users",
    },
  ],
  comparisonMatrix: [
    {
      featureOrCapability: "Cancellation Policy",
      competitorExperience: "Certified mail or in-person manager interview with 60-day notice",
      challengerExperience: "1-Click instant cancellation in mobile app anytime",
      winner: "challenger",
    },
    {
      featureOrCapability: "Facility Peak Capacity",
      competitorExperience: "Uncapped passes; 150+ members crowding machines",
      challengerExperience: "Strict 35-person cap per workout window",
      winner: "challenger",
    },
    {
      featureOrCapability: "Equipment Maintenance",
      competitorExperience: "Months-long repair delays with generic cheap pulleys",
      challengerExperience: "Commercial Eleiko & Rogue gear with 24-hr fix guarantee",
      winner: "challenger",
    },
    {
      featureOrCapability: "Coaching & Form Support",
      competitorExperience: "$120/hr personal training upsell or completely ignored",
      challengerExperience: "Dedicated floor coach included on every workout block",
      winner: "challenger",
    },
    {
      featureOrCapability: "Guest & Travel Privileges",
      competitorExperience: "Restrictive regional check-in fees",
      challengerExperience: "Complimentary digital travel workouts & 2 monthly guest passes",
      winner: "challenger",
    },
  ],
  migrationFaq: [
    {
      question: "What if I still have time left on my MegaGym contract?",
      answer:
        "Bring in proof of your cancellation fee or remaining contract, and we will credit up to $100 toward your first two months of PulseFit training.",
    },
    {
      question: "How do I ensure I won't face crowds during peak after-work hours?",
      answer:
        "We cap our active membership base per studio and operate hourly reservation slots via our app. You will always have an open rack and dedicated barbell waiting.",
    },
    {
      question: "Are lockers, showers, and towel service included?",
      answer:
        "Yes, every membership includes complimentary luxury shower suites, Malin+Goetz toiletries, and freshly laundered towel service at no extra charge.",
    },
  ],
  finalCta: {
    headline: "Escape the MegaGym Trap Today",
    subheadline:
      "Join over 400 former big-box members who reclaimed their time and fitness goals this month.",
    buttonText: "Start Your 14-Day Risk-Free Trial",
  },
};

export const MOCK_PRESET_CRM: ChallengerPageData = {
  id: "preset-crm-echodesk",
  createdAt: 1718001000000,
  competitorName: "TitanCRM Enterprise",
  challengerName: "EchoDesk CRM",
  hero: {
    badge: "Exhausted by TitanCRM's Seat Taxes & 90-Day Implementation?",
    headline: "The High-Velocity Sales CRM Your Reps Will Actually Love Using",
    subheadline:
      "No annual lock-in. No $50,000 certified consultant fees. Get complete pipeline tracking, automated dialers, and clean analytics live in under 15 minutes.",
    ctaPrimary: "Start Free 14-Day Migration Trial",
    ctaSecondary: "Watch 2-Minute Workflow Demo",
  },
  battlecards: [
    {
      id: "bc-crm-1",
      painPointCategory: "Inhumane Annual Lock-in & Auto-Renewal Traps",
      competitorQuote:
        "\"We missed their 60-day written cancellation window by 48 hours and our rep automatically invoiced us $36,000 for another year of licenses we don't even use. Support refused to talk to us.\"",
      counterPitch:
        "Month-to-Month Flexibility with Transparent Fair-Billing. Upgrade, downgrade, or cancel whenever you choose. We only charge for active seats and refund unused team seats automatically.",
      iconName: "ShieldAlert",
    },
    {
      id: "bc-crm-2",
      painPointCategory: "Bloated Complexity & Required Implementation Consultants",
      competitorQuote:
        "\"It took 4 months and a $25k third-party agency just to set up custom lead routing. Our sales reps hated it so much they went back to tracking deals in private Google Sheets.\"",
      counterPitch:
        "Pre-Built Modern Pipelines That Go Live in 15 Minutes. Intuitive drag-and-drop workflow builder designed for operators, not specialized database engineers. Zero consulting invoices required.",
      iconName: "Zap",
    },
    {
      id: "bc-crm-3",
      painPointCategory: "Aggressive $60/User Seat Tax for Basic Features",
      competitorQuote:
        "\"Every useful feature (email sequences, call recording, pipeline forecasting) is locked behind their 'Enterprise Plus' tier. Our bill jumped from $2k/mo to $6k/mo without notice.\"",
      counterPitch:
        "All-Inclusive Transparent Pricing at $29/seat. Every plan includes AI call transcription, unlimited email sequences, bidirectional Gmail/Outlook sync, and predictive pipeline reporting.",
      iconName: "DollarSign",
    },
  ],
  comparisonMatrix: [
    {
      featureOrCapability: "Contract Commitment",
      competitorExperience: "Strict 12 to 36 month lock-in with mandatory auto-renew clause",
      challengerExperience: "100% month-to-month flexibility with zero cancellation penalty",
      winner: "challenger",
    },
    {
      featureOrCapability: "Setup & Onboarding Time",
      competitorExperience: "6 to 12 weeks with required certified implementation partner",
      challengerExperience: "Self-serve 1-click import completed in under 15 minutes",
      winner: "challenger",
    },
    {
      featureOrCapability: "Email Sequencing & Voice Calling",
      competitorExperience: "Add-on tier ($75/user/month additional cost)",
      challengerExperience: "Built-in natively with unlimited sequences on all plans",
      winner: "challenger",
    },
    {
      featureOrCapability: "User Experience & Speed",
      competitorExperience: "Laggy legacy enterprise UI with 4-second page reloads",
      challengerExperience: "Sub-100ms keyboard-first reactivity built for speed",
      winner: "challenger",
    },
    {
      featureOrCapability: "Customer Support SLA",
      competitorExperience: "3-5 business day email queue unless paying 20% support fee",
      challengerExperience: "Average 4-minute human live-chat response for all customers",
      winner: "challenger",
    },
  ],
  migrationFaq: [
    {
      question: "How difficult is it to migrate our contacts and deals from TitanCRM?",
      answer:
        "EchoDesk features a native 1-click TitanCRM importer. Authorize your API key or upload your CSV export, and our mapping engine transfers your contacts, deal stages, and historical activity logs in under 10 minutes.",
    },
    {
      question: "Can we run both CRMs concurrently while our reps get trained?",
      answer:
        "Yes! We offer 14 days of dual-sync capability so your team can test EchoDesk with zero risk to your active pipeline before cutting the cord.",
    },
    {
      question: "Do you support custom pipeline stages and custom fields?",
      answer:
        "Yes, create unlimited custom properties, dropdowns, formulas, and stage automations with simple drag-and-drop controls.",
    },
  ],
  finalCta: {
    headline: "Cut Your CRM Overhead by 60% This Quarter",
    subheadline:
      "Join over 1,200 fast-growing sales teams that switched from legacy enterprise bloat to EchoDesk.",
    buttonText: "Migrate from TitanCRM in 15 Minutes",
  },
};

export const MOCK_PRESET_COWORKING: ChallengerPageData = {
  id: "preset-coworking-hivework",
  createdAt: 1718002000000,
  competitorName: "Apex Executive Suites",
  challengerName: "HiveWork Commons",
  hero: {
    badge: "Done with Apex Suites' Dropped Calls & $15 Coffee Charges?",
    headline: "Modern Collaborative Workspace Designed for Real Builders",
    subheadline:
      "Enterprise-grade 1 Gbps fiber that never drops, soundproof phone booths without reservation fees, and transparent month-to-month desks with 24/7 biometric access.",
    ctaPrimary: "Book a Free 1-Day Trial Pass",
    ctaSecondary: "Tour Private Offices & Desks",
  },
  battlecards: [
    {
      id: "bc-cw-1",
      painPointCategory: "Cripplingly Slow & Dropped Wi-Fi Connections",
      competitorQuote:
        "\"Their advertised 'high-speed internet' tops out at 12 Mbps down and constantly disconnected during client Zoom presentations. When I complained, they tried to upsell me an $80/mo dedicated VLAN!\"",
      counterPitch:
        "Symmetric 1 Gbps Dedicated Fiber with Automatic Dual-ISP Failover. Never drop another investor or client pitch. Dedicated Ethernet ports at every standing desk and quiet pod.",
      iconName: "Wifi",
    },
    {
      id: "bc-cw-2",
      painPointCategory: "Nickel-and-Diming for Basic Amenities",
      competitorQuote:
        "\"They charge $4.50 per Nespresso pod, $45/hour for basic conference rooms, and 25 cents per black & white print. The end-of-month invoice was always $300 higher than expected.\"",
      counterPitch:
        "Unlimited Craft Roast Coffee, Free Printing, and 10 Free Conference Credits/Month. No surprise fees. Cold brew on tap, Oatly milk, and soundproof phone booths free for all members.",
      iconName: "Sparkles",
    },
    {
      id: "bc-cw-3",
      painPointCategory: "Draconian Multi-Year Commercial Leases",
      competitorQuote:
        "\"Locked our 4-person startup into a 24-month lease. When our company downsized, they sent debt collectors instead of working with us on a flexible room swap.\"",
      counterPitch:
        "True Month-to-Month Agility with Instant Room Scaling. Scale up or down from hot desks to a 10-person private suite with a simple 30-day notice. Built for nimble modern companies.",
      iconName: "Building2",
    },
  ],
  comparisonMatrix: [
    {
      featureOrCapability: "Internet Connectivity",
      competitorExperience: "12-25 Mbps throttled shared Wi-Fi; frequent Zoom drops",
      challengerExperience: "1 Gbps symmetric fiber with dual-carrier auto-failover",
      winner: "challenger",
    },
    {
      featureOrCapability: "Phone Booths & Call Privacy",
      competitorExperience: "Must reserve in advance or pay hourly room rental fees",
      challengerExperience: "12 walk-in soundproof Framery acoustic pods free 24/7",
      winner: "challenger",
    },
    {
      featureOrCapability: "Beverages & Pantry",
      competitorExperience: "Vending machines & billed per coffee capsule",
      challengerExperience: "Nitro cold brew, specialty teas, and kombucha complimentary",
      winner: "challenger",
    },
    {
      featureOrCapability: "Lease Flexibility",
      competitorExperience: "12 to 24 month binding commercial lease with personal guarantee",
      challengerExperience: "Month-to-month rolling membership; cancel anytime with 30 days notice",
      winner: "challenger",
    },
    {
      featureOrCapability: "Access Hours",
      competitorExperience: "Monday-Friday 8am-6pm; locked doors on weekends",
      challengerExperience: "24/7 frictionless smartphone & biometric NFC key access",
      winner: "challenger",
    },
  ],
  migrationFaq: [
    {
      question: "Can I use HiveWork as my official registered business mailing address?",
      answer:
        "Yes, dedicated desk and private office memberships include full commercial mail handling, package reception, and physical registered business address privileges.",
    },
    {
      question: "Are meeting room booking credits shared across our team?",
      answer:
        "All team members share a unified pooled bank of monthly meeting room credits that can be booked instantly through our Slack bot or mobile portal.",
    },
    {
      question: "Can I try working here for a day before committing?",
      answer:
        "Absolutely. Claim your complimentary day pass, bring your laptop, enjoy the coffee, and test our Wi-Fi speeds with zero obligations.",
    },
  ],
  finalCta: {
    headline: "Upgrade Your Workday to HiveWork Commons",
    subheadline:
      "Join over 250 founders, designers, and remote engineering teams thriving in our sunlit spaces.",
    buttonText: "Reserve Your Free Day Pass",
  },
};

export const MOCK_PRESETS: MockPreset[] = [
  {
    id: "preset-gym-pulsefit",
    name: "Boutique Gym vs Big-Box",
    description: "PulseFit Studio vs MegaGym Global (cancellation traps, broken machines, overcrowding)",
    category: "Fitness & Wellness",
    data: MOCK_PRESET_GYM,
  },
  {
    id: "preset-crm-echodesk",
    name: "Fair CRM vs Bloated Enterprise",
    description: "EchoDesk CRM vs TitanCRM (annual lock-in, $60 seat taxes, complicated setup)",
    category: "SaaS & Software",
    data: MOCK_PRESET_CRM,
  },
  {
    id: "preset-coworking-hivework",
    name: "Modern Coworking vs Suites",
    description: "HiveWork Commons vs Apex Suites (throttled Wi-Fi, nickel-and-diming, rigid leases)",
    category: "Real Estate & Co-Working",
    data: MOCK_PRESET_COWORKING,
  },
];
