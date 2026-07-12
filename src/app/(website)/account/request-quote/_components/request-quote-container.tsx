import { quoteRequests } from "../../_components/account-data";
import { AccountPageShell } from "../../_components/account-ui";

const RequestQuoteContainer = () => {
  return (
    <AccountPageShell active="request-quote" showProfileCard={false}>
      <div className="overflow-x-auto rounded-[8px] border border-[#9BA3AF] bg-white">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1fr_0.8fr_1.6fr] border-b border-[#9BA3AF] bg-white text-center text-[11px] font-medium text-[#667085]">
            <div className="px-4 py-3">Company</div>
            <div className="px-4 py-3">Service</div>
            <div className="px-4 py-3">Details</div>
          </div>

          {quoteRequests.map((quote) => (
            <div
              key={quote.id}
              className="grid grid-cols-[1fr_0.8fr_1.6fr] border-b border-[#9BA3AF] text-center text-[12px] font-medium text-[#667085] last:border-b-0"
            >
              <div className="px-4 py-5">{quote.company}</div>
              <div className="px-4 py-5">{quote.service}</div>
              <div className="px-4 py-5 leading-relaxed">{quote.details}</div>
            </div>
          ))}
        </div>
      </div>
    </AccountPageShell>
  );
};

export default RequestQuoteContainer;
