import {
  UserCog, Calendar, Dumbbell, Apple, TrendingUp, Wrench,
  Package, Megaphone, Award, Activity, Sparkles, Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PremiumTier = "PRO" | "SOON";

export interface PremiumFeature {
  slug: string;
  title: string;
  shortLabel: string;
  icon: LucideIcon;
  tier: PremiumTier;
  release: string;
  tagline: string;
  bullets: string[];
  why: string;
}

export const premiumFeatures: PremiumFeature[] = [
  {
    slug: "trainers",
    title: "Trainer Management",
    shortLabel: "Trainer Management",
    icon: UserCog,
    tier: "PRO",
    release: "Q1 2026",
    tagline: "Assign trainers to members, track schedules, commissions and performance.",
    bullets: [
      "Per-trainer member assignments with session counts",
      "Commission and payout tracking per trainer",
      "Monthly performance report (retention, revenue, ratings)",
      "Trainer availability calendar",
    ],
    why: "Gyms with dedicated trainer tracking see up to 30% higher member retention and can scale to 10+ trainers without spreadsheets.",
  },
  {
    slug: "classes",
    title: "Class Scheduling",
    shortLabel: "Class Scheduling",
    icon: Calendar,
    tier: "PRO",
    release: "Q1 2026",
    tagline: "Run group classes — Yoga, CrossFit, Zumba — with capacity and bookings.",
    bullets: [
      "Weekly recurring class schedule with trainer assignment",
      "Member bookings, waitlist and capacity limits",
      "Attendance mark per class slot",
      "Automatic reminders on WhatsApp",
    ],
    why: "Group classes are the #1 retention driver in modern gyms. This turns your gym from a weight-lifting room into a full fitness studio.",
  },
  {
    slug: "workouts",
    title: "Workout Plans",
    shortLabel: "Workout Plans",
    icon: Dumbbell,
    tier: "PRO",
    release: "Q2 2026",
    tagline: "Give each member a personalised routine — from beginner to athlete.",
    bullets: [
      "Template library (strength, fat-loss, bodybuilding, functional)",
      "Assign plans to members with weekly splits",
      "Progression tracking with weight and reps",
      "Print or WhatsApp plan to member",
    ],
    why: "Members with a written workout plan are 2x more likely to stay past 6 months. This is the highest-retention feature you can add.",
  },
  {
    slug: "diet",
    title: "Diet & Nutrition",
    shortLabel: "Diet & Nutrition",
    icon: Apple,
    tier: "PRO",
    release: "Q2 2026",
    tagline: "Assign meal plans, track macros and daily calorie targets.",
    bullets: [
      "Indian meal plan templates (veg / non-veg / keto / high-protein)",
      "Daily macro targets per member based on goal",
      "Weekly food log with photo uploads",
      "Auto-generated shopping list per member",
    ],
    why: "Diet tracking commands premium pricing — gyms that offer it charge 40-60% more per membership with minimal extra cost.",
  },
  {
    slug: "progress",
    title: "Progress Tracking",
    shortLabel: "Progress Tracking",
    icon: TrendingUp,
    tier: "PRO",
    release: "Q2 2026",
    tagline: "Log weight, body fat, measurements and before/after photos.",
    bullets: [
      "Weekly weight and measurement entries",
      "Before/after photo gallery per member",
      "Auto-generated progress charts",
      "Goal milestones and streak tracking",
    ],
    why: "Visual progress is the single biggest motivator. Members who see measurable change renew their membership at 3x the rate.",
  },
  {
    slug: "equipment",
    title: "Equipment Management",
    shortLabel: "Equipment",
    icon: Wrench,
    tier: "PRO",
    release: "Q2 2026",
    tagline: "Track every machine, service schedule, warranty and depreciation.",
    bullets: [
      "Full equipment registry with purchase and warranty info",
      "Preventive maintenance reminders",
      "Repair cost tracking per asset",
      "Depreciation report for accounting",
    ],
    why: "Equipment failures cost thousands per incident. Preventive tracking pays for itself in the first avoided breakdown.",
  },
  {
    slug: "inventory",
    title: "Inventory / Store",
    shortLabel: "Inventory / Store",
    icon: Package,
    tier: "PRO",
    release: "Q2 2026",
    tagline: "Sell supplements, protein, gym gear and merchandise from the counter.",
    bullets: [
      "Product catalogue with stock and pricing",
      "Point-of-sale checkout for walk-in purchases",
      "Low-stock alerts",
      "Integrated with member billing",
    ],
    why: "Supplement and merch sales add 15-25% to monthly revenue with almost zero extra operating cost.",
  },
  {
    slug: "marketing",
    title: "Marketing Campaigns",
    shortLabel: "Marketing",
    icon: Megaphone,
    tier: "PRO",
    release: "Q1 2026",
    tagline: "Run bulk WhatsApp and SMS offers — festival, renewal, win-back.",
    bullets: [
      "Segmented audiences (expiring soon, lapsed, active)",
      "Pre-built campaign templates",
      "Scheduled broadcast campaigns",
      "Delivery and read-rate tracking",
    ],
    why: "A single Diwali or New Year campaign typically generates 20-40 new memberships. This pays for itself instantly.",
  },
  {
    slug: "loyalty",
    title: "Loyalty & Rewards",
    shortLabel: "Loyalty & Rewards",
    icon: Award,
    tier: "PRO",
    release: "Q3 2026",
    tagline: "Reward long-term members with points, free months and VIP tiers.",
    bullets: [
      "Earn points for payments, check-ins and referrals",
      "Redeem for discounts, PT sessions or merch",
      "Silver / Gold / Platinum member tiers",
      "Birthday and anniversary auto-rewards",
    ],
    why: "Loyal members refer 2-3 friends per year. A loyalty program turns your best customers into your most effective marketing channel.",
  },
  {
    slug: "occupancy",
    title: "Live Occupancy",
    shortLabel: "Live Occupancy",
    icon: Activity,
    tier: "SOON",
    release: "Q3 2026",
    tagline: "Real-time gym capacity meter showing how busy the floor is right now.",
    bullets: [
      "Live check-in counter on the dashboard",
      "Peak-hour predictions based on history",
      "Member-facing busyness indicator",
      "Space optimisation insights",
    ],
    why: "Members plan workouts around peak hours. Showing them live occupancy reduces crowding complaints and improves the gym experience.",
  },
  {
    slug: "ai",
    title: "AI Insights",
    shortLabel: "AI Insights",
    icon: Sparkles,
    tier: "SOON",
    release: "Q4 2026",
    tagline: "Predict which members are about to quit — before they actually do.",
    bullets: [
      "Churn prediction with confidence scores",
      "Auto-suggested retention offers",
      "Revenue forecasting 30 / 60 / 90 days out",
      "Personalised workout recommendations per member",
    ],
    why: "Retaining one member costs 5x less than acquiring a new one. AI-powered churn prevention is the single highest-ROI feature a gym can deploy.",
  },
  {
    slug: "portal",
    title: "Member Portal",
    shortLabel: "Member Portal",
    icon: Globe,
    tier: "SOON",
    release: "Q4 2026",
    tagline: "Members log in to see their plan, pay dues and book classes.",
    bullets: [
      "Self-service member login",
      "View membership status, payments and receipts",
      "Pay dues online (UPI / card / netbanking)",
      "Book classes and freeze requests",
    ],
    why: "Self-service portals cut admin workload by 40% and let members engage with your gym on their own time.",
  },
];

export function getPremiumFeature(slug: string): PremiumFeature | undefined {
  return premiumFeatures.find((f) => f.slug === slug);
}
