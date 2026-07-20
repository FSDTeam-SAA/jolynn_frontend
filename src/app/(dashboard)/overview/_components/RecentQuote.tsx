import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ইমেজ অনুযায়ী ডামি ডেটা অ্যারে
const requestsData = [
  {
    id: 1,
    name: "Darrell Steward",
    email: "rrian@yandex.ru",
    phone: "(702) 555-0122",
    date: "15 May 2020",
    time: "8:30 am",
    service: "Water Heater Repair",
    details: "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque."
  },
  {
    id: 2,
    name: "Kristin Watson",
    email: "osgoodwy@gmail.com",
    phone: "(219) 555-0114",
    date: "15 May 2020",
    time: "9:30 am",
    service: "Drain Cleaning",
    details: "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque."
  },
  {
    id: 3,
    name: "Jacob Jones",
    email: "quasiah@gmail.com",
    phone: "(308) 555-0121",
    date: "15 May 2020",
    time: "9:00 am",
    service: "Emergency Plumbing",
    details: "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque."
  },
  {
    id: 4,
    name: "Jacob Jones",
    email: "quasiah@gmail.com",
    phone: "(308) 555-0121",
    date: "15 May 2020",
    time: "9:00 am",
    service: "Emergency Plumbing",
    details: "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque."
  },
  {
    id: 5,
    name: "Jacob Jones",
    email: "quasiah@gmail.com",
    phone: "(308) 555-0121",
    date: "15 May 2020",
    time: "9:00 am",
    service: "Emergency Plumbing",
    details: "Donec vel lacus aliquam, condimentum elit non, ornare neque. Quisque."
  }
]

export default function RecentQuote() {
  return (
    <div className="w-full">
      {/* হেডার সেকশন */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#0f172a]">
          Recent Quote Requests
        </h2>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          See All
        </button>
      </div>

      {/* টেবিল কন্টেইনার (হোয়াইট ব্যাকগ্রাউন্ড এবং শ্যাডো) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-white">
              <TableRow className="border-b border-gray-100">
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Name</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Email Address</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Phone Number</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Date & time</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px]">Service</TableHead>
                <TableHead className="py-5 text-center font-medium text-slate-500 text-[14px] max-w-[300px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {requestsData.map((item, index) => (
                <TableRow 
                  key={item.id} 
                  className={`border-b border-gray-100 hover:bg-slate-50/50 transition-colors ${
                    index === requestsData.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.name}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.email}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.phone}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    <div className="flex flex-col items-center justify-center leading-tight">
                      <span>{item.date}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{item.time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-600 font-normal">
                    {item.service}
                  </TableCell>
                  <TableCell className="py-5 text-center text-[14px] text-slate-500 font-normal max-w-[300px] whitespace-normal leading-relaxed">
                    {item.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}