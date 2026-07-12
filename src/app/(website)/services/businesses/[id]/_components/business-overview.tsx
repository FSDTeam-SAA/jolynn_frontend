import { Clock3, MapPin } from "lucide-react";
import type { BusinessProfile } from "./business-profile-data";

type BusinessOverviewProps = {
  overview: BusinessProfile["overview"];
};

const BusinessOverview = ({ overview }: BusinessOverviewProps) => {
  return (
    <div className="space-y-5">
      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
        <h2 className="text-[20px] font-extrabold leading-tight text-[#111827]">
          About This Business
        </h2>
        <p className="mt-3 text-[14px] font-medium leading-[1.45] text-[#111827]">
          {overview.about}
        </p>
      </article>

      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
        <h2 className="text-[20px] font-extrabold leading-tight text-[#111827]">
          Business Hours
        </h2>
        <div className="mt-3 flex items-start gap-2 text-[13px] font-medium leading-relaxed text-[#667085]">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#244D7B]" />
          <span>{overview.hours}</span>
        </div>
      </article>

      <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
        <h2 className="text-[20px] font-extrabold leading-tight text-[#111827]">
          Service Area
        </h2>
        <div className="mt-3 flex items-start gap-2 text-[13px] font-medium leading-relaxed text-[#667085]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#244D7B]" />
          <span>{overview.serviceArea}</span>
        </div>
      </article>
    </div>
  );
};

export default BusinessOverview;
