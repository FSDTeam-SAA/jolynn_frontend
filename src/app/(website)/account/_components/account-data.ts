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









// <aside className="flex gap-2 overflow-x-auto lg:block lg:space-y-5 lg:overflow-visible ">
//         {accountNavItems.map((item) => {
//           const Icon = navIcons[item.id];
//           const isActive = active === item.id;

//           return (
//             <Link
//               key={item.id}
//               href={item.href}
//               className={cn(
//                 "flex h-10 shrink-0 items-center gap-2 rounded-[5px] px-3 text-[12px] font-semibold transition lg:w-full",
//                 isActive
//                   ? "bg-[#292D73] text-white"
//                   : "text-[#667085] hover:bg-[#F2F4F7] hover:text-[#292D73]",
//               )}
//             >
//               <Icon className="h-4 w-4" />
//               {item.label}
//             </Link>
//           );
//         })}

//         <button
//           type="button"
//           onClick={() => setIsLogoutOpen(true)}
//           className="flex h-10 shrink-0 items-center gap-2 rounded-[5px] px-3 text-[12px] font-semibold text-[#EF4444] transition hover:bg-red-50 lg:w-full"
//         >
//           <LogOut className="h-4 w-4" />
//           Log Out
//         </button>
//       </aside>