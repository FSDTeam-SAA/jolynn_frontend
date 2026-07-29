import { ArrowRight } from "lucide-react";
import Link from "next/link";

const AdvertiseWithUs = () => {
  return (
    <section className="bg-white pb-14 sm:pb-16 lg:pb-24">
      <div className="container">
        <div className=" rounded-[8px] bg-primary px-5 py-9 text-center shadow-[0_16px_35px_rgba(41,45,115,0.18)] sm:px-8 sm:py-11 lg:px-12">
          <p className="text-sm md:text-base font-normal leading-normal text-white">
            For Business Owners
          </p>

          <h2 className="mt-2 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-normal text-white">
            Advertise with Us
          </h2>

           <p className="mt-2 text-sm md:text-base font-normal leading-normal text-white">
            Create a professional profile, showcase your work, earn your
            SideQuote email address, and <br className="hidden md:block"/> connect with customers actively
            searching for your services.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              href="/contact"
              className="inline-flex h-10 md:h-12 items-center justify-center gap-2 rounded-[5px] bg-white px-6 text-sm md:text-base font-bold leading-normal text-primary shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-[#F2F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#292D73]"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdvertiseWithUs;
