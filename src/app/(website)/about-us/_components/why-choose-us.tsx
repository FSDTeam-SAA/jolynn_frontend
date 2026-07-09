import Image from "next/image";
import React from "react";

const WhyChooseUs = () => {
  return (
    <div className="py-10 md:py-16 lg:py-20">
      <div className="container">
        <h3 className="text-2xl md:text-[28px] lg:text-[32px] font-semibold text-primary leading-[150%]">
          Discover the heart of our practice — our mission, our story, and the friendly team behind your orthodontic care.
        </h3>

        <div className=" grid grid-cols-1 md:grid-cols-7 gap-8 md:gap-11 lg:gap-[53px] pt-6 md:pt-10 lg:pt-11">
          <div className="md:col-span-3">
            <Image
              src="/assets/images/about-why-us.jpg"
              alt="about-us"
              width={1000}
              height={1000}
              className="object-cover rounded-[20px]"
            />
          </div>
          <div className="md:col-span-4 flex flex-col justify-center">
            <h2 className="text-2xl md:text-[28px] lg:text-[32px] font-semibold text-primary leading-[150%]">
              Why Choose Us
            </h2>
            <p className="text-base md:text-lg font-normal pt-2">
              At <strong>Perrystown Orthodontics,</strong> we treat every patient like family,
              because that’s exactly how we see you. Our friendly team is
              passionate about creating beautiful, confident smiles in a warm
              and relaxed environment where children, teens, and adults all feel
              at home. <br /> <br />
              Our doctors are <strong>Registered Specialist Orthodontists with the Irish
              Dental Council,</strong> so you can trust that your smile is in expert
              hands. We’re dedicated to continually improving the quality of
              care we provide through ongoing professional training and
              development. This commitment keeps us at the forefront of our
              field and ensures we can offer you the latest and most effective
              specialist treatments available. <br /> <br />
              We believe great orthodontic care starts with <strong>kindness, clear
              communication, and genuine care.</strong> From your first visit to your
              final smile reveal, we take the time to listen, explain, and make
              every step of your treatment comfortable and stress-free. <br />{" "}
              <br />
              Using the <strong>latest technology and a personalized approach,</strong> we design
              every treatment plan around your individual needs and lifestyle.
              Whether it’s braces for your child or clear aligners for you, our
              goal is simple - to make you smile, inside and out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
