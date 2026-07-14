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
                Our mission is to connect homeowners with trusted, skilled
                professionals, making home services simple, reliable, and
                stress-free through quality workmanship and exceptional customer
                care.
              </p>

              <p>
                We&apos;re committed to simplifying home maintenance by providing
                access to dependable professionals and outstanding service for
                every home.
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
