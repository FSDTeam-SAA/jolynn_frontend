import Link from "next/link";

const NoBusinessResults = () => (
  <div className="h-full flex flex-col items-center justify-center bg-white px-6 py-14 text-center">
    <p className="text-[13px] font-medium text-[#667085]">Oops!</p>
    <h2 className="mt-1 text-[14px] font-medium text-[#667085]">
      Your search results are not found
    </h2>
    <Link
      href="/job-posts/create"
      className="mt-7 inline-flex min-h-10 items-center justify-center rounded-[5px] bg-[#292E78] px-5 text-[11px] font-extrabold text-white transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2"
    >
      Post what service you need
    </Link>
  </div>
);

export default NoBusinessResults;
