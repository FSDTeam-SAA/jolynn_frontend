import { ArrowRight } from "lucide-react";
import Link from "next/link";

const AdvertiseWithUs = () => {
  return (
    <section className="bg-white pb-14 sm:pb-16 lg:pb-24">
      <div className="container">
        <div className=" rounded-[8px] bg-[#292D73] px-5 py-9 text-center shadow-[0_16px_35px_rgba(41,45,115,0.18)] sm:px-8 sm:py-11 lg:px-12">
          <p className="text-[12px] font-medium leading-tight text-white/90 sm:text-[13px]">
            For Business Owners
          </p>

          <h2 className="mt-4 text-[30px] font-extrabold leading-tight text-white sm:text-[38px] lg:text-[42px]">
            Advertise with Us
          </h2>

          <p className="mx-auto mt-4 max-w-[650px] text-[12px] font-medium leading-[1.35] text-white/90 sm:text-[13px] md:text-[14px]">
            Create a professional profile, showcase your work, earn your
            SideQuote email address, and connect with customers actively
            searching for your services.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] bg-white px-6 text-[12px] font-extrabold text-[#292D73] shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#F2F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#292D73]"
            >
              Contact Us
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertiseWithUs;
