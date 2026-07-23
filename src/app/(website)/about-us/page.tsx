import HeroSection from "@/components/common/hero-section";
import React from "react";
import OurMission from "./_components/our-mission";
import AdvertiseWithUs from "./_components/advertise-with-us";
import Faq from "../_components/faq";

const AboutUsPage = () => {
  return (
    <div className="pb-4 md:pb-6">
      <HeroSection
        title="About Us"
        desc="Sidequote was started with the intention of people helping people in the community of blue collar work and human resources. SideQuote helps those that have little time for marketing and advertisements, one man shops or startup entrepreneurs who want to dabble in sole proprietorship as a supplement to their income stream. SideQuote is for users that are interested in passive income and have a hobby or expertise that want to monetize. The site is a business directory, search portal and job postings for help wanted."
        image="/assets/images/about_hero.jpg"
      />
      <OurMission />
      <AdvertiseWithUs />
      <Faq/>
    </div>
  );
};

export default AboutUsPage;
