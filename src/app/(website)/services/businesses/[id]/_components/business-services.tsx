type BusinessServicesProps = {
  services: string[];
};

const BusinessServices = ({ services }: BusinessServicesProps) => {
  return (
    <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
      <h2 className="text-[20px] font-extrabold leading-tight text-[#111827]">
        Services Offered
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service}
            className="flex min-h-[43px] items-center rounded-[6px] bg-[#EAF2F7] px-4 text-[13px] font-semibold text-[#111827]"
          >
            <span className="mr-2 text-[#336DFF]">•</span>
            {service}
          </div>
        ))}
      </div>
    </article>
  );
};

export default BusinessServices;
