"use client";
import React from "react";
import PathTracker from "./path-tracker";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const AppTopBar = () => {
  const pathName = usePathname();

  return (
    <div className="p-5 rounded-lg shadow-[0px_0px_1px_1px_#0000001A] flex items-center justify-between">
      <PathTracker />

      {pathName === "/dashboard/treatment-list" && (
        <Link href={`/dashboard/treatment-list/add-treatment`}>
          <Button className="h-[40px]">
            <Plus /> Add Service
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/price-list" && (
        <Link href={`/dashboard/price-list/add-price-list`}>
          <Button className="h-[40px]">
            <Plus /> Add Price List
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/gallery-management" && (
        <Link href={`/dashboard/gallery-management/add-gallery`}>
          <Button className="h-[40px]">
            <Plus /> Add Gallery
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/faq" && (
        <Link href={`/dashboard/faq/add-faq`}>
          <Button className="h-[40px]">
            <Plus /> Add FAQ
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/treatment-category" && (
        <Link href={`/dashboard/treatment-category/add-treatment-category`}>
          <Button className="h-[40px]">
            <Plus /> Add Treatment Category
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/doctors" && (
        <Link href={`/dashboard/doctors/add-doctor`}>
          <Button className="h-[40px]">
            <Plus /> Add Doctors
          </Button>
        </Link>
      )}

      {/* {pathName === "/dashboard/contact-info" && (
        <Link href={`/dashboard/contact-info/add-contact-info`}>
          <Button className="h-[40px]">
            <Plus /> Add Contact Info
          </Button>
        </Link>
      )} */}

      {pathName === "/dashboard/privacy-policy" && (
        <Link href={`/dashboard/privacy-policy/edit-privacy-policy`}>
          <Button className="h-[40px]">
            <Edit /> Edit Privacy Policy
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/terms-of-service" && (
        <Link href={`/dashboard/terms-of-service/edit-terms-of-service`}>
          <Button className="h-[40px]">
            <Edit /> Edit Terms of Service
          </Button>
        </Link>
      )}

      {pathName === "/dashboard/gdpr" && (
        <Link href={`/dashboard/gdpr/edit-gdpr`}>
          <Button className="h-[40px]">
            <Edit /> Edit Terms of Service
          </Button>
        </Link>
      )}
    </div>
  );
};
