"use client";

import { ContactInfoResponse } from "@/components/shared/Footer/Footer";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaFacebookSquare, FaInstagramSquare, FaTiktok } from "react-icons/fa";

const ContactInformation = () => {
  const { data, isLoading, isError, error } = useQuery<ContactInfoResponse>({
    queryKey: ["contact-info"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact-info`
      );
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="py-20 text-center text-lg text-gray-500">
        Loading contact information...
      </div>
    );

  if (isError)
    return (
      <div className="py-20 text-center text-red-500">
        Failed to load contact information: {error.message}
      </div>
    );

  return (
    <div className="pt-10 md:pt-16 lg:pt-24">
      <div className="container grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
        <div className="md:col-span-3">
          <Image
            src="/assets/images/contact-info.jpg"
            alt="contact info"
            width={1000}
            height={1000}
            className=" rounded-[16px] object-cover "
          />
        </div>

        <div className="md:col-span-2 w-full flex flex-col justify-center">
          <h3 className="text-2xl md:text-[32px] lg:text-[40px] font-semibold text-primary leading-[150%] pb-3 md:pb-4">
            Contact Information
          </h3>

          <p className="text-sm md:text-base text-[#3E3E3E] leading-[150%] font-normal">
            We’d love to hear from you! Whether you’re ready to start your smile
            journey or just have a few questions, our friendly team at{" "}
            <strong>Perrystown Orthodontics</strong> is here to help. <br />
            <br />
            Get in touch today, we’re happy to guide you every step of the way.
          </p>

          <ul className="pt-4 md:pt-6 lg:pt-8 space-y-2">
            <Link
              href={`tel:${data?.data[0]?.phoneNumbers[0] || "083 011 0533"}`}
            >
              <li className="flex flex-col gap-2 text-sm md:text-base font-normal text-[#343A40]">
                {data?.data[0]?.phoneNumbers.map((number, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      {number}
                    </div>
                  </div>
                )) || "083 011 0533"}
              </li>
            </Link>

            <Link
              href={`mailto:${data?.data[0]?.email || "perrystownorthodontics@gmail.com"
                }`}
            >
              <li className="flex items-center gap-2 text-sm md:text-base font-normal text-[#007FFF] pt-1">
                <Mail className="w-5 h-5 text-primary" />
                {data?.data[0]?.email || "perrystownorthodontics@gmail.com"}
              </li>
            </Link>

            <li className="flex items-start gap-2 text-sm md:text-base font-normal text-[#343A40]">
              <MapPin className="w-5 h-5 text-primary" />
              {data?.data[0]?.address ||
                "44 Muckross Avenue, Perrystown, Dublin 12, D12VK49"}
            </li>

            <li className="flex items-start gap-2 text-sm md:text-base font-normal text-[#343A40]">
              <Clock className="w-5 h-5 text-primary" />
              Opening hours :{" "}
              {data?.data[0]?.openingHours ||
                "Monday to Friday 10 AM – 6:30 PM"}
            </li>
          </ul>

          <div className="pt-4">
            <p className="flex items-center gap-2 text-base md:text-lg font-normal text-[#343A40] leading-[150%]">
              Socials:
              <span className="flex items-center gap-4">
               <Link  href={"https://www.facebook.com/profile.php?id=61583533137378"} target="_blank">
                <FaFacebookSquare className="w-6 h-6 cursor-pointer text-primary" />
                </Link>
                <Link href={"https://www.instagram.com/perrystownorthodontics/"} target="_blank">
                  <FaInstagramSquare className="w-6 h-6 cursor-pointer text-primary" />
                </Link>
                <Link href={"https://x.com/PerrystownOrtho"} target="_blank">
                  <Twitter className="w-6 h-6 cursor-pointer text-primary" />
                </Link>
                <Link href={"https://www.tiktok.com/@perrystownorthodontics"} target="_blank">
                  <FaTiktok className="w-6 h-6 cursor-pointer text-primary" />
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;

// "use client"

// import { ContactInfoResponse } from "@/components/shared/Footer/Footer";
// import { useQuery } from "@tanstack/react-query";
// import { Clock, Mail, MapPin, Phone } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import React from "react";
// import { FaFacebookSquare } from "react-icons/fa";
// import { FaInstagramSquare } from "react-icons/fa";

// const ContactInformation = () => {
//     const { data, isLoading, isError, error } = useQuery<ContactInfoResponse>({
//     queryKey: ["contact-info"],
//     queryFn: async () => {
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/contact-info`
//       );
//       return res.json();
//     },
//   });

//   // console.log(data);
//   if (isLoading) return console.log(isLoading);
//   if (isError) return console.log(error.message);
//   return (
//     <div className="pt-10 md:pt-16 lg:pt-24">
//       <div className="container grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
//         <div className="md:col-span-3">
//           <Image
//             src="/assets/images/contact-info.jpg"
//             alt="contact-info.jpg"
//             width={1000}
//             height={1000}
//             className="w-full h-[400px] md:h-[450px] lg:h-[500px] rounded-[16px]"
//           />
//         </div>
//         <div className="md:col-span-2 w-full flex flex-col justify-center">
//           <h3 className="text-2xl md:text-[32px] lg:text-[40px] font-semibold text-primary leading[150%] pb-3 md:pb-4">
//             Contact Information
//           </h3>
//           <p className="text-sm md:text-base text-[#3E3E3E] leading-[150%] font-normal">
//             We’d love to hear from you! Whether you’re ready to start your smile
//             journey or just have a few questions, our friendly team at{" "}
//             <strong>Perrystown Orthodontics</strong> is here to help. <br />
//             <br />
//             Get in touch today, we’re happy to guide you every step of the way.
//           </p>
//           <ul className="pt-4 md:pt-6 lg:pt-8">
//             <Link href="tel:083 011 0533">
//               <li className="flex items-center gap-2 text-sm md:text-base font-normal text-[#343A40] leading-[120%] py-1 md:py-2">
//                 <Phone className="w-5 h-5 text-primary" /> {data?.data[0]?.phoneNumbers[0] || "083 011 0533"}
//               </li>
//             </Link>
//             <Link href="mailto:perrystownorthodontics@gmail.com">
//               <li className="flex items-center gap-2 text-sm md:text-base font-normal text-[#007FFF] leading-[120%] py-1 md:py-2">
//                 <Mail className="w-5 h-5 text-primary" />{" "}
//                 {data?.data[0]?.email || "perrystownorthodontics@gmail.com"}
//               </li>
//             </Link>

//             <li className="flex items-start gap-2 text-sm md:text-base font-normal text-[#343A40] leading-[120%] py-1 md:py-2">
//               <MapPin className="w-5 h-5 text-primary" />  {data?.data[0]?.address ||
//                   "44 Muckross Avenue, Perrystown, Dublin 12, D12VK49"}
//             </li>
//             <li className="flex items-start gap-2 text-sm md:text-base font-normal text-[#343A40] leading-[120%] py-1 md:py-2">
//               <Clock className="w-5 h-5 text-primary" /> Opening hours : {data?.data[0]?.openingHours ||
//                   " Monday to Friday 10 AM – 6:30 PM"}
//             </li>
//           </ul>
//           <div>
//             <p className="flex items-center gap-2 text-base md:text-lg font-normal text-[#343A40] leading-[150%]">
//               Socials :{" "}
//               <span className="flex items-center gap-4">
//                 <FaFacebookSquare className="w-6 h-6 cursor-pointer"/> <FaInstagramSquare className="w-6 h-6 cursor-pointer"/>
//               </span>{" "}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContactInformation;
