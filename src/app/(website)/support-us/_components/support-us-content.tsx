import { ArrowUpRight, HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";

const goFundMeUrl =
  "https://www.gofundme.com/f/help-launch-sidequote?attribution_id=a345f1f9-3be4-40db-84dc-d527a9413d9b";

const values = [
  {
    icon: ShieldCheck,
    title: "Transparency first",
    description: "Our balance sheet is fully open to the public.",
  },
  {
    icon: UsersRound,
    title: "Community-led growth",
    description: "We help businesses reach more people while keeping owners in control.",
  },
  {
    icon: HeartHandshake,
    title: "Built to collaborate",
    description: "We welcome partners who share our vision for sustainable growth.",
  },
];

const SupportUsContent = () => {
  return (
    <main className="overflow-hidden bg-[#F7FAFA] text-[#1B2234]">
      <section className="relative isolate overflow-hidden bg-[#22245F] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#7FC5BD]/20 blur-3xl" />
        <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[36px] border-white/10" />

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#DDEDEC]">
              Help shape what&apos;s next
            </p>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Support Us
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-[#E3EEEE] sm:text-lg">
              Together, we can build a more sustainable path for small businesses to grow.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-[#D8E6E5] bg-white p-6 shadow-[0_18px_55px_rgba(34,36,95,0.08)] sm:p-9 lg:p-12">
              <div className="space-y-6 text-base leading-8 text-[#4A5568] sm:text-[17px]">
                <p>
                  <strong className="font-semibold text-[#22245F]">
                    The traditional acquisition model often places a heavy burden on employees.
                  </strong>{" "}
                  When startups are absorbed by venture capital, private equity, or large corporations, workers frequently face increased workloads and tightening margins. Small businesses deserve a trusted, sustainable partner to help them scale effectively without sacrificing their bottom line.
                </p>

                <p>
                  <strong className="font-semibold text-[#22245F]">
                    SideQuote is a community-led, decentralized platform
                  </strong>{" "}
                  designed to streamline business growth. By providing a single, unified virtual presence, SideQuote empowers businesses to capture leads and engage broader audiences instantly. Our platform eliminates hours of laborious marketing, advertising, and customer service workflows, allowing owners to focus on what matters most.
                </p>

                <p>
                  To accelerate our launch and fund initial operational expenses,{" "}
                  <strong className="font-semibold text-[#22245F]">
                    SideQuote has initiated a GoFundMe campaign.
                  </strong>{" "}
                  We are committed to complete financial transparency; our balance sheet is fully open to the public. Additionally, we are pleased to share our comprehensive business plan, pro forma, and usage statements with any donor who supports our mission.
                </p>

                <p>
                  We are also{" "}
                  <strong className="font-semibold text-[#22245F]">
                    actively seeking strategic partners
                  </strong>{" "}
                  who can offer industry insights and help optimize our operational efficiency. If you share our vision and wish to collaborate, please visit our website and submit an inquiry through our{" "}
                  <Link href="/contact" className="font-semibold text-[#22245F] underline decoration-[#7FC5BD] decoration-2 underline-offset-4 transition-colors hover:text-[#4B8E87]">
                    Contact Us form
                  </Link>{" "}
                  and donate today.
                </p>
              </div>

              <div className="mt-9 border-t border-[#D8E6E5] pt-8">
                <a
                  href={goFundMeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#22245F] px-5 py-3.5 text-center text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#17194D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22245F] focus-visible:ring-offset-2 sm:w-auto"
                >
                  Donate through GoFundMe
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
                <p className="mt-3 text-sm leading-6 text-[#667085]">
                  Your support helps SideQuote launch and serve more small businesses.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {values.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-xl border border-[#D8E6E5] bg-[#EDF6F5] p-5">
                  <Icon className="h-6 w-6 text-[#22245F]" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-semibold text-[#22245F]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#52606D]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SupportUsContent;
