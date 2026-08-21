export type AccountSection =
  | "profile"
  | "change-password"
  | "save-services"
  | "request-quote"
  | "help-wanted"
  | "my-reviews"
  | "message";

export const accountNavItems = [
  {
    id: "profile",
    label: "Profile",
    href: "/account/profile",
  },
  {
    id: "change-password",
    label: "Change Password",
    href: "/account/change-password",
  },
  {
    id: "save-services",
    label: "Saved Services",
    href: "/account/save-services",
  },
  {
    id: "request-quote",
    label: "My Quotes",
    href: "/account/request-quote",
  },
  {
    id: "help-wanted",
    label: "Help Wanted",
    href: "/account/help-wanted",
  },
  {
    id: "my-reviews",
    label: "My Reviews",
    href: "/account/my-reviews",
  },
  {
    id: "message",
    label: "Message",
    href: "/account/message",
  },
] as const;
