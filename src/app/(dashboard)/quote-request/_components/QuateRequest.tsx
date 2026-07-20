"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import DeleteModal from "@/components/modals/delete-modal";

type QuoteRequest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  details: string;
};

const initialQuoteRequests: QuoteRequest[] = [
  {
    id: 1,
    name: "Floyd Miles",
    email: "maka@yandex.ru",
    phone: "(505) 555–0125",
    date: "15 May 2020",
    time: "8:00 am",
    service: "Emergency Plumbing",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 2,
    name: "Courtney Henry",
    email: "ustil@mail.ru",
    phone: "(307) 555–0133",
    date: "15 May 2020",
    time: "9:30 am",
    service: "Drain Cleaning",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 3,
    name: "Leslie Alexander",
    email: "codence@gmail.com",
    phone: "(217) 555–0113",
    date: "15 May 2020",
    time: "8:00 am",
    service: "Leak Detection",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 4,
    name: "Darrell Steward",
    email: "rrian@yandex.ru",
    phone: "(702) 555–0122",
    date: "15 May 2020",
    time: "8:30 am",
    service: "Water Heater Repair",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 5,
    name: "Kristin Watson",
    email: "osgoodwy@gmail.com",
    phone: "(219) 555–0114",
    date: "15 May 2020",
    time: "9:30 am",
    service: "Drain Cleaning",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
  {
    id: 6,
    name: "Jacob Jones",
    email: "quasiah@gmail.com",
    phone: "(308) 555–0121",
    date: "15 May 2020",
    time: "9:00 am",
    service: "Emergency Plumbing",
    details:
      "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.",
  },
];

function QuateRequest() {
  const [quoteRequests, setQuoteRequests] =
    useState<QuoteRequest[]>(initialQuoteRequests);
  const [requestToDelete, setRequestToDelete] =
    useState<QuoteRequest | null>(null);

  const deleteQuoteRequest = () => {
    if (!requestToDelete) return;
    setQuoteRequests((current) =>
      current.filter((request) => request.id !== requestToDelete.id),
    );
    setRequestToDelete(null);
  };

  return (
    <>
      <section className="overflow-hidden rounded-[10px] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="h-[48px] border-b border-[#EAECF0] text-[12px] font-medium text-[#526174]">
                <th className="w-[15%] px-5 text-center font-medium">Name</th>
                <th className="w-[15%] px-3 text-center font-medium">
                  Email Address
                </th>
                <th className="w-[14%] px-3 text-center font-medium">
                  Phone Number
                </th>
                <th className="w-[14%] px-3 text-center font-medium">
                  Date &amp; time
                </th>
                <th className="w-[15%] px-3 text-center font-medium">Service</th>
                <th className="w-[21%] px-3 text-center font-medium">Details</th>
                <th className="w-[6%] px-3 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {quoteRequests.map((request) => (
                <tr
                  key={request.id}
                  className="h-[85px] border-b border-[#EAECF0] text-[12px] text-[#66758A] last:border-b-0"
                >
                  <td className="px-5 text-center">{request.name}</td>
                  <td className="px-3 text-center">{request.email}</td>
                  <td className="whitespace-nowrap px-3 text-center">
                    {request.phone}
                  </td>
                  <td className="px-3 text-center leading-[18px]">
                    <span className="block">{request.date}</span>
                    <span className="block">{request.time}</span>
                  </td>
                  <td className="px-3 text-center">{request.service}</td>
                  <td className="px-5 text-center leading-[17px]">
                    {request.details}
                  </td>
                  <td className="px-3 text-center">
                    <button
                      type="button"
                      aria-label={`Delete quote request from ${request.name}`}
                      onClick={() => setRequestToDelete(request)}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#FF3434] transition-colors hover:bg-[#FFF0EF]"
                    >
                      <Trash2 className="h-[17px] w-[17px]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {quoteRequests.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-[#667085]">
            No quote requests found.
          </div>
        )}
      </section>

      <DeleteModal
        isOpen={Boolean(requestToDelete)}
        onClose={() => setRequestToDelete(null)}
        onConfirm={deleteQuoteRequest}
        title="Delete Quote Request?"
        desc={`Are you sure you want to delete ${requestToDelete?.name || "this user's"} quote request?`}
      />
    </>
  );
}

export default QuateRequest;
