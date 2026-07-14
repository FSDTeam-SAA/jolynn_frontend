import { Mail } from "lucide-react";
import Link from "next/link";

const contactBottomContent = {
  message: "Thank you for contacting us, we will reach out within 24 hours",
  email: "hello@sidequote.com",
  note: "We typically respond within 24 hours",
};

const ContactBottom = () => {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="container">
        <div className="mx-auto flex min-h-[190px] max-w-[1240px] flex-col items-center justify-center rounded-[18px] border border-[#D5D9E2] bg-white px-5 py-8 text-center shadow-[0_6px_16px_rgba(30,45,75,0.08)]">
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-gradient-to-b from-[#5B7DFF] to-[#292D73] text-white shadow-[0_10px_20px_rgba(41,45,115,0.24)]">
            <Mail className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-base md:text-lg font-bold leading-normal text-[#282828]">
            {contactBottomContent.message}
          </h2>

          <Link
            href={`mailto:${contactBottomContent.email}`}
            className="mt-3 text-xs md:text-sm leading-normal font-medium text-[#292D73] transition hover:text-[#1F2464] hover:underline"
          >
            {contactBottomContent.email}
          </Link>

          <p className="mt-3 text-xs leading-normal font-medium text-[#616161]">
            {contactBottomContent.note}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactBottom;
