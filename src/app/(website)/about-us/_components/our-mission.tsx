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

            <div className="mt-5 space-y-4 text-sm md:text-base font-medium leading-[1.45] text-[#667481] lg:max-w-[520px]">
              <p>
            To be the “Google” for blue collar postings and business directory for just about anything that people are looking for in terms of getting help in areas needing subject matter experts to amateur assistance such as errand running, to customer cabinets. The site is not intended for corporations or established businesses that already have marketing and advertising solutions and this platform will not advertise corporations or large scale enterprises that undercut wages and discriminate against the average worker. 
              </p>

              <p>
                The site works on community outreach which means that donations, sweat equity and bartering are encouraged to keep the platform unbiased in labor from corporate undertaking. If you want to help SideQuote grow please email us at info@sidequote.com with the word Mission in the subject line.
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[700px]">
            <div className="relative aspect-[7/5] overflow-hidden rounded-[16px]">
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
