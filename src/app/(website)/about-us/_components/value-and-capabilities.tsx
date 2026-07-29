import { SearchCheck, Target } from "lucide-react";

const coreValues = [
  {
    title: "Marketplace Penetration",
    description:
      "Connects operators directly with decentralized blue-collar and human resources talent.",
  },
  {
    title: "Zero-Overhead Marketing",
    description:
      "Eliminates advertising barriers for solo operators and early-stage entrepreneurs.",
  },
  {
    title: "Monetization Infrastructure",
    description:
      "Converts specialized skills and underutilized hobbies into structured, scalable revenue streams.",
  },
  {
    title: "Flexible Labor Solutions",
    description:
      "Facilitates agile workforce scaling through supplemental, independent contracts.",
  },
];

const platformCapabilities = [
  {
    title: "B2C Directory",
    description: "Centralized index categorized by industry expertise.",
  },
  {
    title: "Advanced Search Portal",
    description:
      "High-intent routing matching service buyers with optimized providers.",
  },
  {
    title: "Job Syndicate",
    description:
      "Active procurement board for project-based contracts, traditional requisitions and boutique jobs.",
  },
];

const ContentList = ({
  items,
}: {
  items: { title: string; description: string }[];
}) => (
  <ul className="mt-6 space-y-4">
    {items.map((item) => (
      <li key={item.title} className="flex items-start gap-3">
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4365D0]"
          aria-hidden="true"
        />
        <p className="text-sm font-medium leading-6 text-[#667481] md:text-base">
          <strong className="font-extrabold text-[#292E78]">
            {item.title}:
          </strong>{" "}
          {item.description}
        </p>
      </li>
    ))}
  </ul>
);

const ValueAndCapabilities = () => {
  return (
    <section className="bg-[#F4F8F8] py-14 sm:py-16 lg:py-24">
      <div className="container">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#4365D0]">
            The SideQuote Advantage
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-primary md:text-4xl lg:text-5xl">
            Built for Independent Growth
          </h2>
          <p className="mx-auto mt-4 max-w-[650px] text-sm font-medium leading-6 text-[#667481] md:text-base">
            A focused marketplace and practical platform infrastructure that
            help independent professionals connect, compete and grow.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <article className="rounded-[16px] border border-[#DEE7E7] bg-white p-6 shadow-[0_10px_30px_rgba(41,46,120,0.07)] sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#4365D0]">
              <Target className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-[#292E78]">
              Core Value Proposition
            </h3>
            <ContentList items={coreValues} />
          </article>

          <article className="rounded-[16px] border border-[#DEE7E7] bg-white p-6 shadow-[0_10px_30px_rgba(41,46,120,0.07)] sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8F6F4] text-[#28796E]">
              <SearchCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-[#292E78]">
              Platform Capabilities
            </h3>
            <ContentList items={platformCapabilities} />
          </article>
        </div>
      </div>
    </section>
  );
};

export default ValueAndCapabilities;
