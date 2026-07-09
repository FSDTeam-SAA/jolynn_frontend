"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");

const isDynamicSegment = (segment: string) =>
  /^[0-9a-fA-F]{24}$/.test(segment) || segment.match(/^[0-9a-fA-F-]{8,}$/);

const routeNameMap: Record<string, string> = {
  "add-price-list": "Add Price List",
  "edit-price-list": "Edit Price List",
  "price-list": "Price List",
  dashboard: "Dashboard",
};

const PathTracker = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const visibleSegments = segments.filter((s) => !isDynamicSegment(s));

  return (
    <div className="text-xl">
      <div className="mb-4">
        <h1 className="font-semibold">
          {visibleSegments.length
            ? routeNameMap[visibleSegments[visibleSegments.length - 1]] ??
              capitalize(visibleSegments[visibleSegments.length - 1])
            : "Home"}
        </h1>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {visibleSegments.map((segment, index) => {
            const href = "/" + visibleSegments.slice(0, index + 1).join("/");
            const isLast = index === visibleSegments.length - 1;
            const label = routeNameMap[segment] ?? capitalize(segment);

            return (
              <Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default PathTracker;
