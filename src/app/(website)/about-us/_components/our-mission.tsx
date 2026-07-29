import Image from "next/image";

const OurMission = () => {
  return (
    <section className="bg-white py-14 sm:py-16 lg:py-24">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20 xl:gap-28">
          <div className="mx-auto max-w-[520px] text-center lg:mx-0 lg:max-w-[570px] lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-normal text-primary ">
              Our Mission
            </h2>

            <div className="mt-5 text-sm font-medium leading-[1.45] text-[#667481] md:text-base lg:max-w-[540px]">
              <p>
                <strong className="font-extrabold text-[#292E78]">
                  SideQuote is a decentralized B2B network designed to capture
                  the underserved market of independent contractors,
                  micro-enterprises, and micro-labor.
                </strong>{" "}
                We are positioning our platform to become the premier search
                engine and service procurement directory for specialized
                non-corporate labor. By explicitly excluding enterprise
                competitors, we insulate and protect a highly loyal, agile
                ecosystem of local subject matter experts and independent
                workers.
              </p>

              <div className="my-6 h-px bg-[#D0D5DD]" aria-hidden="true" />

              <h3 className="text-xl font-bold text-[#292E78]">
                Investment Highlights
              </h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-left marker:text-[#292E78]">
                <li>
                  <strong className="font-extrabold text-[#344054]">
                    Unrivaled Market Capture:
                  </strong>{" "}
                  Captures the fragmented gig and micro-labor economy.
                </li>
                <li>
                  <strong className="font-extrabold text-[#344054]">
                    Defensible Competitive Moat:
                  </strong>{" "}
                  Excludes corporate advertising to eliminate wage
                  undercutting.
                </li>
                <li>
                  <strong className="font-extrabold text-[#344054]">
                    High Ecosystem Retention:
                  </strong>{" "}
                  Fosters long-term loyalty via community-centric incentives.
                </li>
                <li>
                  <strong className="font-extrabold text-[#344054]">
                    Alternative Value Exchange:
                  </strong>{" "}
                  Integrates sweat equity and bartering protocols.
                </li>
              </ul>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[700px]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] sm:aspect-[6/5] lg:aspect-auto lg:h-[560px]">
              <Image
                src="/assets/images/our-mission.png"
                alt="Home service professional helping a customer"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
