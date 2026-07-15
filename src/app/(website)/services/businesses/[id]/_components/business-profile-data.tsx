export type BusinessProfile = {
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  phone: string;
  websiteUrl: string;
  emailUrl: string;
  quoteUrl: string;
  saveUrl: string;
  reportUrl: string;
  overview: {
    about: string;
    hours: string;
    serviceArea: string;
  };
  gallery: {
    id: number;
    image: string;
    alt: string;
  }[];
  reviewsSummary: {
    rating: number;
    totalReviews: number;
    distribution: {
      stars: number;
      percent: number;
    }[];
  };
  reviews: {
    id: number;
    name: string;
    date: string;
    avatar: string;
    rating: number;
    comment: string;
  }[];
};

export const businessProfile: BusinessProfile = {
  name: "Anderson Electric Co.",
  category: "Electricians",
  rating: 4.9,
  reviewCount: 127,
  phone: "0000000000",
  websiteUrl: "#",
  emailUrl: "mailto:hello@example.com",
  quoteUrl: "#",
  saveUrl: "#",
  reportUrl: "#",
  overview: {
    about:
      "Licensed master electricians serving the Austin metro area for over 15 years. We handle residential and commercial projects — panel upgrades, EV charging installations, whole-home rewiring, and code compliance inspections. All work is insured and backed by a 2-year labor warranty.",
    hours: "Mon-Fri 7am-6pm · Sat 8am-2pm · Emergency 24/7",
    serviceArea: "Austin, Round Rock, Cedar Park, Georgetown, Pflugerville",
  },
  gallery: [
    {
      id: 1,
      image: "/assets/images/about-us.jpg",
      alt: "Electrician reviewing panel work",
    },
    {
      id: 2,
      image: "/assets/images/our-mission.png",
      alt: "Contractor reviewing service details",
    },
    {
      id: 3,
      image: "/assets/images/jobs-post.jpg",
      alt: "Service project planning",
    },
    {
      id: 4,
      image: "/assets/images/contact-information.jpg",
      alt: "Technician working indoors",
    },
    {
      id: 5,
      image: "/assets/images/hero.png",
      alt: "Home service installation",
    },
    {
      id: 6,
      image: "/assets/images/contact-info.jpg",
      alt: "Completed home service detail",
    },
  ],
  reviewsSummary: {
    rating: 4.9,
    totalReviews: 127,
    distribution: [
      { stars: 5, percent: 78 },
      { stars: 4, percent: 15 },
      { stars: 3, percent: 5 },
      { stars: 2, percent: 3 },
      { stars: 1, percent: 2 },
    ],
  },
  reviews: [
    {
      id: 1,
      name: "David K.",
      date: "Nov 12, 2024",
      avatar: "/assets/images/review1.png",
      rating: 5,
      comment:
        "Excellent work — showed up on time, explained everything clearly, and the price matched the quote exactly. Highly recommend.",
    },
    {
      id: 2,
      name: "Angela R.",
      date: "Oct 28, 2024",
      avatar: "/assets/images/review2.png",
      rating: 5,
      comment:
        "Fixed our main panel issue in under 3 hours. Professional crew, cleaned up after themselves. Will use again.",
    },
    {
      id: 3,
      name: "Tom H.",
      date: "Nov 12, 2024",
      avatar: "/assets/images/review3.png",
      rating: 5,
      comment:
        "Good work overall. Scheduling took a bit longer than expected but quality was solid.",
    },
  ],
};
