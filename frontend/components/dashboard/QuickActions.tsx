import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, MessageSquare, Settings, CreditCard } from "lucide-react";

const STRIPE_DASHBOARD_URL = "https://dashboard.stripe.com";

const actions = [
  {
    href: "/owner/listings/new",
    label: "Create New Listing",
    desc: "Post a room for seekers to find",
    icon: <Plus className="w-5 h-5" />,
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
    external: false,
  },
  {
    href: "/messages",
    label: "View Messages",
    desc: "Chat with interested seekers",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-50)] dark:bg-[var(--color-primary)]/10",
    external: false,
  },
  {
    href: "/dashboard/owner-profile",
    label: "Edit Profile",
    desc: "Update your owner details",
    icon: <Settings className="w-5 h-5" />,
    color: "text-[var(--color-primary)]",
    bg: "bg-[var(--color-primary-soft)] dark:bg-[var(--color-primary)]/10",
    external: false,
  },
  {
    href: STRIPE_DASHBOARD_URL,
    label: "Payouts",
    desc: "View your Stripe dashboard",
    icon: <CreditCard className="w-5 h-5" />,
    color: "text-[var(--color-accent)]",
    bg: "bg-[var(--color-accent-soft)] dark:bg-[var(--color-accent)]/10",
    external: true,
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action, i) => {
        const inner = (
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ duration: 0.15 }}
            className="card p-4 rounded-xl hover:shadow-md dark:hover:shadow-2xl group cursor-pointer h-full"
          >
            <div
              className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
            >
              {action.icon}
            </div>
            <h3 className="font-bold text-[var(--color-ink)] text-sm">
              {action.label}
            </h3>
            <p className="text-xs text-[var(--color-ink-3)] mt-0.5">
              {action.desc}
            </p>
          </motion.div>
        );

        if (action.external) {
          return (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {inner}
            </a>
          );
        }

        return (
          <Link key={action.label} href={action.href}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
