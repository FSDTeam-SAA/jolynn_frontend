"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, X, AlertCircle } from "lucide-react";

type QuoteStatus = "pending" | "approved" | "rejected";

type Quote = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  details: string;
  status: QuoteStatus;
};

// ইমেজ (image_9287b5.png) অনুযায়ী মক ডাটা
const initialQuotes: Quote[] = [
  {
    id: "1",
    name: 'Darrell Steward',
    email: 'rrian@yandex.ru',
    phone: '(702) 555-0122',
    date: '15 May 2020',
    time: '8:30 am',
    service: 'Water Heater Repair',
    details: 'Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.',
    status: 'pending'
  },
  {
    id: "2",
    name: 'Kristin Watson',
    email: 'osgoodwy@gmail.com',
    phone: '(219) 555-0114',
    date: '15 May 2020',
    time: '9:30 am',
    service: 'Drain Cleaning',
    details: 'Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.',
    status: 'pending'
  },
  {
    id: "3",
    name: 'Jacob Jones',
    email: 'quasiah@gmail.com',
    phone: '(308) 555-0121',
    date: '15 May 2020',
    time: '9:00 am',
    service: 'Emergency Plumbing',
    details: 'Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.',
    status: 'pending'
  },
  {
    id: "4",
    name: 'Jacob Jones',
    email: 'quasiah@gmail.com',
    phone: '(308) 555-0121',
    date: '15 May 2020',
    time: '9:00 am',
    service: 'Emergency Plumbing',
    details: 'Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.',
    status: 'pending'
  },
  {
    id: "5",
    name: 'Jacob Jones',
    email: 'quasiah@gmail.com',
    phone: '(308) 555-0121',
    date: '15 May 2020',
    time: '9:00 am',
    service: 'Emergency Plumbing',
    details: 'Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque.',
    status: 'pending'
  }
];

function RecentQuote() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ডাটা লোড করার মক ইফেক্ট
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // ১ সেকেন্ড লোডিং ইফেক্ট
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setQuotes(initialQuotes);
      } catch {
        setError("ডাটা লোড করতে সমস্যা হয়েছে!");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // স্ট্যাটাস পরিবর্তন করার ফাংশন (Approve/Reject)
  const handleStatusChange = async (id: string, newStatus: Exclude<QuoteStatus, "pending">) => {
    setUpdatingId(id);
    setError(null);
    setSuccess(null);
    try {
      // API কল সিমুলেশন
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => 
          quote.id === id ? { ...quote, status: newStatus } : quote
        )
      );
      setSuccess(`Quote successfully ${newStatus}!`);
    } catch {
      setError("স্ট্যাটাস আপডেট করা যায়নি।");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full bg-[#f8f9fa] p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        
        {/* হেডার সেকশন */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Quote Requests
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage your client quote submissions and actions
            </p>
          </div>
          <button type="button" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            See All
          </button>
        </div>

        {/* সাকসেস মেসেজ */}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex justify-between items-center border border-emerald-100">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> {success}
            </span>
            <button type="button" onClick={() => setSuccess(null)} className="text-xs underline hover:no-underline">Dismiss</button>
          </div>
        )}

        {/* এরর মেসেজ */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg flex justify-between items-center border border-rose-100">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </span>
            <button type="button" onClick={() => setError(null)} className="text-xs underline hover:no-underline">Dismiss</button>
          </div>
        )}

        {/* টেবিল কন্টেইনার */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[1180px] border-collapse bg-white text-left text-sm text-slate-500">
            <thead className="bg-[#fcfcfd]">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center">Name</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center">Email Address</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center">Phone Number</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center">Date & time</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center">Service</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center max-w-[280px]">Details</th>
                <th scope="col" className="px-6 py-4 font-semibold text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {loading && quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading requests...
                    </div>
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No quote requests found.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800 text-center">{quote.name}</td>
                    <td className="px-6 py-4 text-slate-500 text-center">{quote.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-center whitespace-nowrap">{quote.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="block text-slate-700 font-medium">{quote.date}</span>
                      <span className="block text-xs text-slate-400 mt-0.5">{quote.time}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-center">{quote.service}</td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-[280px] leading-relaxed text-center">
                      {quote.details}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {quote.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(quote.id, 'approved')}
                            disabled={updatingId === quote.id}
                            aria-label={`Approve quote from ${quote.name}`}
                            className="rounded-lg border border-emerald-200 p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Approve"
                          >
                            {updatingId === quote.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(quote.id, 'rejected')}
                            disabled={updatingId === quote.id}
                            aria-label={`Reject quote from ${quote.name}`}
                            className="rounded-lg border border-rose-200 p-1.5 text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          quote.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RecentQuote;
