import LegalPage, { type LegalSection } from "@/components/common/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | SideQuote",
  description: "Read the terms that apply when you access or use SideQuote.",
};

const sections: LegalSection[] = [
  {
    id: "intellectual-property-rights",
    title: "Intellectual Property Rights",
    paragraphs: [
      "All content on this Site—including text, graphics, logos, and code—is our property or the property of our licensors. It is protected by international copyright, trademark, and intellectual property laws. You may not copy, reproduce, or distribute any content without our prior written consent.",
    ],
  },
  {
    id: "acceptable-use-policy",
    title: "Acceptable Use Policy",
    bullets: [
      "Agree not to use the Site for any unlawful purpose.",
      "Agree not to post or transmit harassing, defamatory, harmful, or obscene content.",
      "Agree not to attempt to breach the security or hack any part of the Site.",
      "Agree not to scrape data or use automated systems to extract information from the Site.",
      "Agree to use the REPORT link to report any abuse, fraud or breach to these terms of usage, so that the site can respond and take appropriate action.",
      "Agree to be part of the SideQuote community and behave in the manner of HELPING THE COMMUNITY.",
    ],
  },
  {
    id: "user-accounts",
    title: "User Accounts",
    paragraphs: [
      "If you register for an account, you are responsible for maintaining password confidentiality. You accept responsibility for all actions occurring under your account credentials. We reserve the right to suspend or terminate accounts at our sole discretion. It is your responsibility to make sure you delete content that you’ve added and conduct due diligence in maintaining password security such as rotating, changing and updating passwords when your security is compromised.",
    ],
  },
  {
    id: "limitation-of-liability-disclaimers",
    title: "Limitation of Liability & Disclaimers",
    paragraphs: [
      'This Site and its contents are provided on an "as-is" and "as-available" basis. We make no warranties that the site will be error-free or uninterrupted. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use this Site. We make no guarantees that vulnerabilities will not be exposed due to third party negligence or oversight.',
    ],
  },
  {
    id: "external-links",
    title: "External Links",
    paragraphs: [
      "Our Site may contain links to third-party websites that we do not own or control. We assume no responsibility for the content, privacy policies, or practices of any third-party websites including Sponsored Advertisements that we have no control over.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    paragraphs: [
      "These Terms shall be governed by and construed in accordance with the laws of Las Vegas., State of Nevada, United States, without regard to its conflict of law provisions. All litigation will be within the Nevada laws of arbitration process.",
    ],
  },
  {
    id: "changes-to-these-terms",
    title: "Changes to These Terms",
    paragraphs: [
      "We reserve the right to modify these Terms at any time with or without notice. Any changes will be posted on this page with an updated effective date. Your continued use of the Site after modifications indicates your acceptance. Third party software, partners and middleware will be subject to its own terms of usage and held accountable to them.",
    ],
  },
  {
    id: "contact-information",
    title: "Contact Information",
    paragraphs: [
      "If you have any questions about these Terms, please contact us at:",
      "Email : info@sidequote.com",
      "Address:\nVaingo Enterprises/SideQuote\n8414 Farm Road\nSte 180 PMB 1105\nLas Vegas, NV 89131",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      description={'Welcome to SideQuote (the "Site"), operated by Vaingo Enterprises, LLC ("we," "us," or "our"). By accessing or using our Site, you agree to be bound by these Terms and Conditions. Please read them carefully. If you do not agree, do not use the Site.'}
      lastUpdated="August 31, 2026"
      dateLabel="Effective Date"
      sections={sections}
      variant="terms"
      showContactCta={false}
    />
  );
}
