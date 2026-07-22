import LegalPage, { type LegalSection } from "@/components/common/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SideQuote",
  description: "Learn how SideQuote collects, uses, and protects your information.",
};

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: [
      "We collect information you provide directly when you create an account, add a business, request a quote, leave a review, contact us, or otherwise use SideQuote.",
    ],
    bullets: [
      "Account and contact details, such as your name, email address, phone number, and password.",
      "Business profile information, including services, service areas, opening hours, photos, and business contact details.",
      "Quote requests, reviews, messages, and other content you choose to submit.",
      "Technical information such as IP address, browser type, device information, pages visited, and approximate location derived from your device or IP address.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use your information",
    paragraphs: ["We use information to provide, maintain, protect, and improve the SideQuote platform."],
    bullets: [
      "Create and manage accounts and business listings.",
      "Connect customers with relevant local service professionals and process quote requests.",
      "Send service messages, account updates, security alerts, and support responses.",
      "Personalize search results, measure performance, prevent fraud, and improve our services.",
      "Meet legal obligations and enforce our Terms and Conditions.",
    ],
  },
  {
    id: "sharing-information",
    title: "How information is shared",
    paragraphs: [
      "We do not sell your personal information. We share information only when needed to operate the platform, fulfill your request, comply with law, or protect SideQuote and its users.",
    ],
    bullets: [
      "With service professionals when you request a quote or choose to contact a listed business.",
      "With vendors that support hosting, analytics, communications, security, and other platform operations.",
      "With authorities or other parties when required by law or reasonably necessary to prevent harm, fraud, or misuse.",
      "As part of a merger, financing, acquisition, or sale of assets, subject to appropriate confidentiality protections.",
    ],
  },
  {
    id: "public-content",
    title: "Public profiles and content",
    paragraphs: [
      "Business listings, reviews, ratings, profile images, service details, and other information intended for publication may be visible to anyone and may appear in search engine results. Please avoid posting sensitive personal information in public areas of SideQuote.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and analytics",
    paragraphs: [
      "SideQuote may use cookies and similar technologies to keep you signed in, remember preferences, understand platform usage, and improve performance. You can manage cookies through your browser settings, although disabling essential cookies may affect some features.",
    ],
  },
  {
    id: "data-security",
    title: "Data security and retention",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect your information. No online system is completely secure, so we cannot guarantee absolute security.",
      "We retain information for as long as needed to provide our services, maintain legitimate business records, resolve disputes, prevent abuse, and meet legal requirements. Retention periods may vary depending on the type of information.",
    ],
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, or restrict the use of your personal information. You may update certain account details from your dashboard or contact us to submit a request. We may need to verify your identity before completing it.",
    ],
  },
  {
    id: "children",
    title: "Children’s privacy",
    paragraphs: [
      "SideQuote is not intended for children under 18, and we do not knowingly collect personal information from children. If you believe a child has provided information to us, please contact us so we can review and remove it where appropriate.",
    ],
  },
  {
    id: "policy-changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy as SideQuote evolves or legal requirements change. We will post the revised version here and update the date at the top. Continued use of SideQuote after an update means the revised policy applies to your future use.",
    ],
  },
  {
    id: "contact",
    title: "Contact us",
    paragraphs: [
      "If you have questions, concerns, or a privacy request, please use our Contact Us page. Include enough detail for us to understand and respond to your request.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Your privacy matters"
      title="Privacy Policy"
      description="This policy explains what information SideQuote collects, why we use it, and the choices available to you."
      lastUpdated="July 22, 2026"
      sections={sections}
      variant="privacy"
    />
  );
}
