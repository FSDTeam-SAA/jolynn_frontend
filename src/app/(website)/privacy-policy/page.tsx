import LegalPage, { type LegalSection } from "@/components/common/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SideQuote",
  description: "Learn how SideQuote collects, uses, and protects your information.",
};

const sections: LegalSection[] = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    paragraphs: [
      "We may collect information about you in a variety of ways, including:",
      "Personal Data: Voluntarily provided details such as your name, email address, phone number, and shipping or business address when you register, subscribe, or contact us.",
      "Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, browser type, operating system, access times, and pages viewed.",
      "Financial Data: Limited data related to your payment method (such as card brand and expiration date) if you make purchases. We do not store full financial details; all payments are processed by our payment processor, [Processor Name, e.g., Stripe / PayPal].",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    bullets: [
      "Deliver and manage your account registration.",
      "Fulfill and manage purchases, orders, payments, and other transactions.",
      "Email you regarding your account, orders, or marketing updates (which you can opt out of at any time).",
      "Improve our Site's functionality, security, and performance based on user usage patterns.",
    ],
  },
  {
    id: "sharing-and-disclosure",
    title: "Sharing and Disclosure of Information",
    paragraphs: [
      "We do not sell your personal data. We may share information we have collected about you in certain situations:",
      "Third-Party Service Providers: We may share your data with third parties that perform services for us, such as payment processing, data analysis, email delivery, and hosting services.",
      "By Law or to Protect Rights: If we believe disclosure is necessary to respond to legal process, investigate potential violations, or protect the safety and rights of others.",
    ],
  },
  {
    id: "tracking-technologies",
    title: "Tracking Technologies (Cookies)",
    paragraphs: [
      "We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. Most browsers are set to accept cookies by default. You can remove or reject cookies in your browser settings, but be aware that such action could affect the availability and functionality of the Site.",
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    paragraphs: [
      "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.",
    ],
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    paragraphs: [
      "We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.",
    ],
  },
  {
    id: "your-privacy-rights",
    title: "Your Privacy Rights",
    paragraphs: [
      "Depending on your location, you may have specific rights regarding your personal data, including the right to access, correct, or request the deletion of the data we hold about you. You can exercise these rights by contacting us using the information below.",
    ],
  },
  {
    id: "contact-information",
    title: "Contact Information",
    paragraphs: [
      "If you have questions or comments about this Privacy Policy, please contact us at:",
      "If you have any questions about these Terms, please contact us at:",
      "Email: info@sidequote.com",
      "Address:\nVaingo Enterprises/SideQuote\n8414 Farm Road\nSte 180 PMB 1105\nLas Vegas, NV 89131 United States",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={'SideQuote ("we," "us," or "our") operates https://www.sidequote.com (the "Site"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Site. Please read this policy carefully. If you do not agree with its terms, please discontinue use of the Site.'}
      lastUpdated="August 31, 2026"
      dateLabel="Effective Date"
      sections={sections}
      variant="privacy"
      showContactCta={false}
    />
  );
}
