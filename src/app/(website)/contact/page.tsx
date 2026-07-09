import HeroSection from "@/components/common/hero-section";
import React from "react";
import ContactInformation from "./_components/contact-information";
import GoogleMap from "./_components/google-map";
import ContactGetInTouch from "./_components/contact-get-in-touch";

const ContactPage = () => {
  return (
    <div>
      <HeroSection
        title="Contact Us"
      />
      <ContactInformation />
      <ContactGetInTouch />
      <GoogleMap/>
    </div>
  );
};

export default ContactPage;
