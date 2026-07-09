"use client";
import {
  BookCheck,
  BookText,
  DollarSign,
  FileImage,
  List,
  LogOut,
  MessageSquareText,
  NotebookPen,
  RefreshCcwDot,
  Settings,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// Menu items.
const items = [
  {
    title: "Booking",
    url: "/dashboard",
    icon: BookText,
  },
  {
    title: "Treatment Category",
    url: "/dashboard/treatment-category",
    icon: BookCheck,
  },
  {
    title: "Treatment List",
    url: "/dashboard/treatment-list",
    icon: List,
  },
  {
    title: "Price List",
    url: "/dashboard/price-list",
    icon: DollarSign,
  },
  {
    title: "Referral",
    url: "/dashboard/referral",
    icon: RefreshCcwDot,
  },
  {
    title: "Gallery Management",
    url: "/dashboard/gallery-management",
    icon: FileImage,
  },

  {
    title: "Doctors",
    url: "/dashboard/doctors",
    icon: Users,
  },

  {
    title: "FAQ",
    url: "/dashboard/faq",
    icon: NotebookPen,
  },
  {
    title: "Contact",
    url: "/dashboard/contact",
    icon: MessageSquareText,
  },

  {
    title: "Contact Info",
    url: "/dashboard/contact-info",
    icon: Users,
  },
  {
    title: "Privacy Policy",
    url: "/dashboard/privacy-policy",
    icon: Users,
  },
  {
    title: "GDPR",
    url: "/dashboard/gdpr",
    icon: Users,
  },
  {
    title: "Terms of Service",
    url: "/dashboard/terms-of-service",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathName = usePathname();

  const handleLogout = () => {
    signOut({
      callbackUrl: "/login",
    });
  };

  return (
    <Sidebar className="border-none">
      <SidebarContent className="bg-white shadow-2xl scrollbar-hide">
        <SidebarGroup className="p-0">
          <div className="flex flex-col justify-between min-h-screen pb-5">
            <div>
              <SidebarGroupLabel className="mt-5 mb-5 h-[80px]">
                <Link href={`/`}>
                  <Image
                    src={`/assets/images/dashboard-logo.png`}
                    alt="logo.png"
                    width={1000}
                    height={1000}
                    className="h-[200px] w-[218px] object-cover"
                  />
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive =
                      item.url === "/dashboard"
                        ? pathName === "/dashboard"
                        : pathName === item.url ||
                        pathName.startsWith(`${item.url}/`);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          className={`h-[60px] rounded-none text-[20px] hover:bg-primary/20 hover:text-black transition-all duration-300 pl-5 ${isActive &&
                            "bg-primary hover:bg-primary text-white hover:text-white font-medium"
                            }`}
                          asChild
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </div>

            <div>
              <SidebarFooter className="border-t border-gray-300">
                <button
                  onClick={handleLogout}
                  className="font-medium text-red-500 flex items-center gap-2 pl-2 mt-5"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </SidebarFooter>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
