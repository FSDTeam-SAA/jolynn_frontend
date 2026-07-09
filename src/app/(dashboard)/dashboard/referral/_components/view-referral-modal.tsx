"use client";

import { useQuery } from "@tanstack/react-query";
import { X, Download, Calendar, Phone, Mail, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
}

type Patient = {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
};

type Dentist = {
  name: string;
  practice: string;
  phoneNumber: string;
  email: string;
};

type UploadedFile = {
  public_id: string;
  fileUrl: string;
  _id: string;
};

type Referral = {
  _id: string;
  patient: Patient;
  dentist: Dentist;
  additionalNotes: string;
  uploadedFiles: UploadedFile[];
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type ReferralResponse = {
  status: boolean;
  message: string;
  data: Referral;
};

export function ViewReferralModal({ isOpen, onClose, id }: ReferralModalProps) {
  const session = useSession();
  const token = (session?.data?.user as { token: string })?.token;

  const { data: referralDetails, isLoading } = useQuery<ReferralResponse>({
    queryKey: ["referral-details", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/referrals/${id}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch referral details");
      return res.json();
    },
    enabled: !!token && !!id && isOpen,
  });

  const referral = referralDetails?.data;

  console.log("referral: ", referral);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold">Referral Details</h1>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : referral ? (
          <div className="p-6 space-y-6">
            {/* Patient Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Full Name</p>
                  <p className="text-blue-900">{referral?.patient?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Date of Birth
                  </p>
                  <p className="text-blue-900 flex items-center justify-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(referral?.patient?.dateOfBirth)}
                    <span className="text-blue-600 ml-2">
                      (Age: {calculateAge(referral?.patient?.dateOfBirth)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Phone Number
                  </p>
                  <p className="text-blue-900 flex items-center justify-center gap-1">
                    <Phone className="h-4 w-4" />
                    {referral?.patient?.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Email Address
                  </p>
                  <p className="text-blue-900 flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />
                    {referral?.patient?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Dentist Information */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Referring Dentist Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Dentist Name
                  </p>
                  <p className="text-green-900">{referral?.dentist?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">Practice</p>
                  <p className="text-green-900">
                    {referral?.dentist?.practice}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Phone Number
                  </p>
                  <p className="text-green-900 flex items-center justify-center gap-1">
                    <Phone className="h-4 w-4" />
                    {referral?.dentist?.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Email Address
                  </p>
                  <p className="text-green-900 flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />
                    {referral?.dentist?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-900 mb-3">
                Additional Notes
              </h2>
              <p className="text-yellow-900 whitespace-pre-wrap">
                {referral?.additionalNotes || "No additional notes provided."}
              </p>
            </div>

            {/* Uploaded Files */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-3">
                Uploaded Files ({referral?.uploadedFiles?.length})
              </h2>
              {referral?.uploadedFiles?.length > 0 ? (
                <div className="space-y-2">
                  {referral?.uploadedFiles?.map((file, index) => (
                    <div
                      key={file._id}
                      className="flex items-center justify-between p-3 bg-white rounded border border-purple-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                          <span className="text-purple-600 text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-purple-900 font-medium">
                          Referral File {index + 1}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleDownloadFile(
                            file?.fileUrl,
                            `referral-file-${index + 1}`
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-purple-700">No files uploaded.</p>
              )}
            </div>

            {/* Consent and Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">Consent Given:</p>
                <span
                  className={`px-2 py-1 rounded-full ${
                    referral?.consentGiven
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {referral?.consentGiven ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <p className="font-medium">Referral Created:</p>
                <p>{formatDate(referral?.createdAt)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Failed to load referral details.
          </div>
        )}
      </div>
    </div>
  );
}
