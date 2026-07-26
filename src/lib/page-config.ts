type PageConfig = {
  title: string;
  description: string;
};

export const pageConfig: Record<string, PageConfig> = {
  "/overview": {
    title: "Dashboard Overview",
    description:
      "Track your business activity, recent quotes, and key performance at a glance.",
  },
  "/my-business": {
    title: "My Business",
    description:
      "View and update your business profile, category, and company information.",
  },
  "/my-services": {
    title: "My Services",
    description:
      "Add, edit, and manage the services your business offers to customers.",
  },
  "/my-gallery": {
    title: "My Gallery",
    description:
      "Showcase your work by managing your business photos and gallery items.",
  },
  "/my-reviews": {
    title: "My Reviews",
    description:
      "See customer feedback and keep track of your business reputation.",
  },
  "/contact-info": {
    title: "Contact Information",
    description:
      "Keep your business contact details and social links accurate and up to date.",
  },
  "/quote-request": {
    title: "Quote Requests",
    description:
      "Review and respond to quote requests submitted by potential customers.",
  },
  "/security": {
    title: "Security",
    description:
      "Protect your account by managing your password and security preferences.",
  },
  "/settings": {
    title: "Account Settings",
    description:
      "Manage your personal information and account preferences.",
  },
};

export const getPageConfig = (pathname: string): PageConfig => {
  const matchingRoute = Object.keys(pageConfig).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return matchingRoute
    ? pageConfig[matchingRoute]
    : {
        title: "Business Dashboard",
        description: "Manage your business profile and customer activity.",
      };
};
