import Link from "next/link";
import Layout from "@/components2/usefull/Layout";
import { DASHBOARD_BREADCRUMBS } from "@/lib/constants/dashboard";
import FaqListings from "@/components/main/faq-listings";
import { ArrowUpRight, BookOpen, HelpCircle, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SUPPORT_HIGHLIGHTS = [
  {
    label: "Support hours",
    value: "Mon – Fri · 9am – 6pm ET",
  },
  {
    label: "Avg. response time",
    value: "Under 24 hours",
  },
  {
    label: "Direct email",
    value: "support@koajo.com",
  },
];

type SupportCard = {
  title: string;
  description: string;
  helper: string;
  actionLabel: string;
  actionHref: string;
  icon: LucideIcon;
};

const SUPPORT_CARDS: SupportCard[] = [
  {
    title: "Email Support",
    description:
      "Report account issues, payment errors, identity questions, or any concerns with your pods.",
    helper: "Our team prioritizes account-affecting issues.",
    actionLabel: "support@koajo.com",
    actionHref: "mailto:support@koajo.com",
    icon: Mail,
  },
  {
    title: "Guides & FAQs",
    description:
      "Browse the curated knowledge base for detailed walkthroughs on pods, security, and payouts.",
    helper: "Updated each launch to include new questions.",
    actionLabel: "Browse help topics",
    actionHref: "#faq",
    icon: BookOpen,
  },
];

export default function HelpCenterPage() {
  return (
    <Layout
      title="Help Center"
      breadcrumbs={DASHBOARD_BREADCRUMBS.HELP_AND_CENTER}
    >
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#031C1E] via-[#062D31] to-[#041114] p-6 md:p-8 text-white shadow-lg">
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <HelpCircle className="size-5 text-primary" />
              Support
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                How can we help you today?
              </h1>
              <p className="text-base md:text-lg text-white/70 max-w-2xl">
                Search the knowledge base, get answers to common questions, and
                reach our team for personalized support. We&apos;re here to make
                sure your pods run smoothly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#faq"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-white/90"
              >
                Explore FAQs
              </Link>
              <a
                href="mailto:support@koajo.com"
                className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Email Support
              </a>
            </div>
          </div>
          <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-3">
            {SUPPORT_HIGHLIGHTS.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  {highlight.label}
                </p>
                <p className="mt-1 text-lg font-semibold">{highlight.value}</p>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-primary/30 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-tertiary-100/40 blur-[120px]" />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {SUPPORT_CARDS.map((card) => {
            const Icon = card.icon;
            const isMailLink = card.actionHref.startsWith("mailto:");
            const actionClasses =
              "inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors";

            const actionContent = (
              <>
                {card.actionLabel}
                <ArrowUpRight className="size-4" />
              </>
            );

            return (
              <div
                key={card.title}
                className="flex h-full flex-col gap-4 rounded-2xl border border-text-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.title}
                    </h3>
                    <p className="text-sm text-text-500">{card.description}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-text-400">
                  {card.helper}
                </p>
                <div className="mt-auto">
                  {isMailLink ? (
                    <a href={card.actionHref} className={actionClasses}>
                      {actionContent}
                    </a>
                  ) : (
                    <Link href={card.actionHref} className={actionClasses}>
                      {actionContent}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <div id="faq" className="scroll-mt-32">
          <FaqListings
            variant="dashboard"
            wrapperClassName="bg-transparent pt-2 pb-0 md:pb-6"
            containerClassName="px-0"
            searchPlaceholder="Search the help center"
          />
        </div>
      </div>
    </Layout>
  );
}
