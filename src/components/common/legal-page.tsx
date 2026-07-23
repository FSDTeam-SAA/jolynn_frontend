import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  lastUpdated: string;
  dateLabel?: string;
  sections: LegalSection[];
  variant: "privacy" | "terms";
  showContactCta?: boolean;
};

const LegalPage = ({
  eyebrow,
  title,
  description,
  lastUpdated,
  dateLabel = "Last updated",
  sections,
  variant,
  showContactCta = true,
}: LegalPageProps) => {
  const Icon = variant === "privacy" ? ShieldCheck : FileText;

  return (
    <div className="bg-[#F7FAFC]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#292D73_0%,#1767A2_58%,#0082D7_100%)] text-white">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-36 -left-16 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="container relative px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:px-10">
          <div className="max-w-3xl">
            {eyebrow && (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-sm sm:text-sm">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {eyebrow}
              </div>
            )}
            <h1 className="text-balance text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base md:text-lg">
              {description}
            </p>
            <p className="mt-6 text-xs font-medium text-white/70 sm:text-sm">
              {dateLabel}: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 xl:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-12">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <p className="text-sm font-bold text-[#292D73]">On this page</p>
            <nav className="mt-4" aria-label={`${title} sections`}>
              <ol className="space-y-1.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex gap-2.5 rounded-lg px-2.5 py-2 text-xs leading-5 text-slate-600 transition hover:bg-[#EEF6FA] hover:text-[#292D73] sm:text-sm"
                    >
                      <span className="font-semibold text-[#0082D7]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <main className="min-w-0 rounded-2xl border border-slate-200 bg-white px-5 py-2 shadow-sm sm:px-8 md:px-10">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border-b border-slate-200 py-8 last:border-0 sm:py-10"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FB] text-xs font-bold text-[#0875B9]">
                    {index + 1}
                  </span>
                  <h2 className="text-xl font-bold leading-8 text-slate-900 sm:text-2xl">
                    {section.title}
                  </h2>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:text-[15px] sm:leading-8">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="space-y-3 pl-1">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0082D7]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </main>
        </div>

        {showContactCta && (
          <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#DDEDEC] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-[#292D73] sm:text-xl">
                Have a question about this document?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Contact the SideQuote team and we’ll be happy to help.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#292D73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#20245F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2"
            >
              Contact us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPage;
