"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

export function ViewContactModal({ isOpen, onClose, id }: ContactModalProps) {
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: contactDetails } = useQuery({
    queryKey: ["all-contacts", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
    enabled: !!token && !!id && isOpen,
  });

  const contact = contactDetails?.data;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold">Contact Details</h1>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 text-start">
          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Name:</span> {contact?.name}
            </p>
          </div>

          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Email Address:</span>{" "}
              {contact?.email}
            </p>
          </div>

          <div>
            <p className="text-gray-700">
              <span className="font-semibold">Phone Number:</span>{" "}
              {contact?.phone}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-2">Message:</p>
            <p className="text-gray-700 leading-relaxed">{contact?.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
