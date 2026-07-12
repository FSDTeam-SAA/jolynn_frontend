export type AccountSection =
  | "profile"
  | "change-password"
  | "save-services"
  | "request-quote";

export const accountUser = {
  name: "Olivia Rhye",
  email: "bessieedwards@gmail.com",
  avatar: "/assets/images/review1.png",
  phone: "+1 (555) 123-4567",
  location: "1234 Oak Avenue, San Francisco, CA 94102A",
  since: "14 August, 2025",
};

export const accountNavItems = [
  {
    id: "profile",
    label: "Profile",
    href: "/account/profile",
  },
  {
    id: "change-password",
    label: "Changes Password",
    href: "/account/change-password",
  },
  {
    id: "save-services",
    label: "Save Services",
    href: "/account/save-services",
  },
  {
    id: "request-quote",
    label: "Request Quote",
    href: "/account/request-quote",
  },
] as const;

export const savedBusinesses = [
  {
    id: 1,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/1",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 2,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/2",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 3,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/3",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 4,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/4",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 5,
    name: "Anderson Electric Co.",
    category: "Electricians",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    description:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects...",
    accentColor: "#4D2077",
    profileUrl: "/services/businesses/5",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
  {
    id: 6,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    rating: 4.8,
    reviews: 127,
    location: "Denver, CO",
    description:
      "Family-owned plumbing company serving Denver since 2009. We specialize in drain cleaning, water heater installation...",
    accentColor: "#176F39",
    profileUrl: "/services/businesses/6",
    reportUrl: "/report",
    whatsappUrl: "#",
    reviewUrl: "#",
  },
];

export const quoteRequests = [
  {
    id: 1,
    company: "Rivera Plumbing & Drain",
    service: "Panel Upgrades",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 2,
    company: "Anderson Electric Co.",
    service: "Lighting",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 3,
    company: "Peak Roofing Solutions",
    service: "Installation",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 4,
    company: "Rivera Plumbing & Drain",
    service: "Panel Upgrades",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 5,
    company: "Anderson Electric Co.",
    service: "Lighting",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 6,
    company: "Peak Roofing Solutions",
    service: "Installation",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 7,
    company: "Rivera Plumbing & Drain",
    service: "Panel Upgrades",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 8,
    company: "Anderson Electric Co.",
    service: "Lighting",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 9,
    company: "Peak Roofing Solutions",
    service: "Installation",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
];
