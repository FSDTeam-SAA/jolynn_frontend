import LegalPage, { type LegalSection } from "@/components/common/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | SideQuote",
  description: "Read the terms that apply when you access or use SideQuote.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    paragraphs: [
      "By accessing or using SideQuote, you agree to these Terms and Conditions and our Privacy Policy. If you do not agree, please do not use the platform. If you use SideQuote for a business or organization, you confirm that you have authority to accept these terms on its behalf.",
    ],
  },
  {
    id: "platform-role",
    title: "What SideQuote provides",
    paragraphs: [
      "SideQuote is an online directory and connection platform that helps customers discover service professionals, view business information, request quotes, and share reviews. SideQuote is not the provider of the services listed and is not a party to agreements made between customers and service professionals.",
      "We do not guarantee that a listing, credential, review, quote, availability, price, or service outcome is accurate or suitable for your needs. Users are responsible for carrying out their own checks before hiring or performing work.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts and eligibility",
    bullets: [
      "You must be at least 18 years old and legally able to enter into a contract.",
      "Information provided to SideQuote must be accurate, current, and complete.",
      "You are responsible for protecting your login details and for activity under your account.",
      "Tell us promptly if you suspect unauthorized account access or another security issue.",
    ],
  },
  {
    id: "business-listings",
    title: "Business listings and professionals",
    paragraphs: [
      "Business owners must have the authority to represent the listed business and must keep their profile, licenses, insurance information, prices, availability, and service details accurate. Any verification badge or review performed by SideQuote reflects information available at the time and is not a continuing guarantee.",
      "Professionals are solely responsible for their work, quotes, contracts, permits, taxes, insurance, legal compliance, customer communications, and any warranties they offer.",
    ],
  },
  {
    id: "customer-responsibilities",
    title: "Customer responsibilities",
    paragraphs: [
      "Customers should review a professional’s qualifications, insurance, licenses, experience, references, pricing, and written terms before agreeing to services. You are responsible for providing accurate project details and for paying professionals according to your agreement with them.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    paragraphs: ["You agree not to misuse SideQuote or interfere with another person’s use of it."],
    bullets: [
      "Do not post false, misleading, defamatory, unlawful, discriminatory, or harmful content.",
      "Do not impersonate others, create fraudulent listings or reviews, or manipulate ratings.",
      "Do not scrape, copy, reverse engineer, overload, disrupt, or bypass security controls on the platform.",
      "Do not use SideQuote to send spam, distribute malware, violate privacy, or infringe intellectual property rights.",
    ],
  },
  {
    id: "reviews-content",
    title: "Reviews and user content",
    paragraphs: [
      "You retain ownership of content you submit. By posting it, you grant SideQuote a worldwide, non-exclusive, royalty-free license to host, use, reproduce, format, publish, and display that content for operating, promoting, and improving the platform.",
      "Reviews must reflect genuine experiences and remain fair and relevant. We may moderate, refuse, or remove content that violates these terms, but we are not required to review every submission.",
    ],
  },
  {
    id: "third-parties",
    title: "Third-party services and links",
    paragraphs: [
      "SideQuote may include links to third-party websites, tools, or services. We do not control or endorse them and are not responsible for their content, availability, security, or privacy practices. Your use of third-party services is governed by their own terms.",
    ],
  },
  {
    id: "availability",
    title: "Platform availability and changes",
    paragraphs: [
      "We may modify, suspend, or discontinue any part of SideQuote, including features or listings, at any time. We work to keep the platform available and accurate but do not promise uninterrupted, error-free, or fully secure service.",
    ],
  },
  {
    id: "disclaimers-liability",
    title: "Disclaimers and limitation of liability",
    paragraphs: [
      "SideQuote is provided on an “as is” and “as available” basis to the extent permitted by law. We disclaim implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.",
      "To the maximum extent permitted by law, SideQuote will not be liable for indirect, incidental, special, consequential, or punitive damages, loss of profits or data, or disputes, injuries, property damage, or losses arising from services arranged through the platform. Nothing in these terms excludes liability that cannot legally be excluded.",
    ],
  },
  {
    id: "suspension",
    title: "Suspension and termination",
    paragraphs: [
      "You may stop using SideQuote at any time. We may restrict, suspend, or terminate access, remove content, or close accounts where we reasonably believe these terms, the law, or the rights and safety of others have been violated. Provisions that should logically continue after termination will remain in effect.",
    ],
  },
  {
    id: "changes-contact",
    title: "Changes and contact",
    paragraphs: [
      "We may revise these terms to reflect changes to SideQuote, our practices, or applicable law. Updated terms will be posted on this page with a revised date. Your continued use after an update means you accept the revised terms.",
      "For questions about these Terms and Conditions, please contact us through the Contact Us page.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Clear terms, better connections"
      title="Terms and Conditions"
      description="These terms explain the rules for using SideQuote and the responsibilities of customers, businesses, and our platform."
      lastUpdated="July 22, 2026"
      sections={sections}
      variant="terms"
    />
  );
}
