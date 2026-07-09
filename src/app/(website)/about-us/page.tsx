import HeroSection from "@/components/common/hero-section";
import React from "react";
import MeetTheTeam from "./_components/meet-the-team";
import WhyChooseUs from "./_components/why-choose-us";

const AboutUsPage = () => {
  return (
    <div>
      <HeroSection
        title="About Us"
      />
      <section id="why-us">
        <WhyChooseUs />
      </section>

      <section id="meet-the-team">
        <MeetTheTeam />
      </section>
   
    </div>
  );
};

export default AboutUsPage;
