import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type JobPost = {
  id: number;
  author: {
    name: string;
    email: string;
    avatar: string;
  };
  category: string;
  zipCode: string;
  title: string;
  description: string;
  closingNote: string;
  contactHref: string;
};

const jobPosts: JobPost[] = [
  {
    id: 1,
    author: {
      name: "Sarah_123",
      email: "hello@example.com",
      avatar: "/assets/images/review1.png",
    },
    category: "Poop Picking",
    zipCode: "123456",
    title: "Looking for a Dog Poop Picking Service 🐕",
    description:
      "Hi everyone! I'm looking for a reliable pet waste removal service to clean up my yard on a regular basis. If you provide this service or know someone who does, please leave a comment or send me a message with your pricing and availability.",
    closingNote: "Thanks in advance!",
    contactHref: "mailto:hello@example.com",
  },
  {
    id: 2,
    author: {
      name: "Sarah_123",
      email: "hello@example.com",
      avatar: "/assets/images/review2.png",
    },
    category: "Poop Picking",
    zipCode: "123456",
    title: "Looking for a Dog Poop Picking Service 🐕",
    description:
      "Hi everyone! I'm looking for a reliable pet waste removal service to clean up my yard on a regular basis. If you provide this service or know someone who does, please leave a comment or send me a message with your pricing and availability.",
    closingNote: "Thanks in advance!",
    contactHref: "mailto:hello@example.com",
  },
  {
    id: 3,
    author: {
      name: "Sarah_123",
      email: "hello@example.com",
      avatar: "/assets/images/review3.png",
    },
    category: "Poop Picking",
    zipCode: "123456",
    title: "Looking for a Dog Poop Picking Service 🐕",
    description:
      "Hi everyone! I'm looking for a reliable pet waste removal service to clean up my yard on a regular basis. If you provide this service or know someone who does, please leave a comment or send me a message with your pricing and availability.",
    closingNote: "Thanks in advance!",
    contactHref: "mailto:hello@example.com",
  },
];

const JobPostsContainer = () => {
  return (
    <section className="bg-[#F9FAFB] px-2 md:px-0 py-10 md:py-14 lg:px-8 lg:py-16">
      <div className="container max-w-[1110px]">
        <div className="space-y-5 sm:space-y-6">
          {jobPosts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-[8px] border border-[#D4F0F1] bg-[#F0FEFE] shadow-[0_8px_18px_rgba(19,35,68,0.14)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(19,35,68,0.18)]"
            >
              <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 lg:px-6">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full  shadow-[0_3px_10px_rgba(41,45,115,0.22)] sm:h-12 sm:w-12">
                    <Image
                      src={post.author.avatar}
                      alt={`${post.author.name} avatar`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-sm md:text-base font-bold leading-normal text-primary ">
                      {post.author.name}
                    </h2>
                    <p className="truncate text-xs font-normal leading-normal text-[#667481] sm:text-[11px]">
                      {post.author.email}
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-[#86D6E4]" />

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm font-normal text-[#667481]">
                  <p>
                    Category :{" "}
                    <span className="font-normal leading-normal text-xs md:text-sm text-primary">
                      {post.category}
                    </span>
                  </p>
                  <p>
                    Zip code :{" "}
                    <span className="font-normal leading-normal text-xs md:text-sm text-primary">
                      {post.zipCode}
                    </span>
                  </p>
                </div>

                <h3 className="mt-3 text-[12px] font-semibold leading-relaxed text-[#1F2937] sm:text-[13px]">
                  {post.title}
                </h3>

                <p className="mt-3 max-w-[980px] text-xs md:text-sm font-medium leading-normal text-[#434343] sm:text-[12px]">
                  {post.description}
                </p>

                <p className="mt-3 max-w-[980px] text-xs md:text-sm font-medium leading-normal text-[#434343] sm:text-[12px]">
                  {post.closingNote}
                </p>

                <div className="mt-5 flex justify-start sm:justify-end">
                  <Link
                    href={post.contactHref}
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[5px] bg-primary px-4 text-xs md:text-sm font-extrabold text-white shadow-[0_5px_12px_rgba(41,45,115,0.22)] transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 sm:w-auto sm:min-w-[198px]"
                  >
                    <Mail className="h-5 w-5" />
                    Contact through email
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JobPostsContainer;
