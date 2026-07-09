import { Key, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { AppTopBar } from '../_component/shared/app-topbar'

const page = () => {
  return (
    <div>
     <div className='mt-[60px] mb-8'>
       <AppTopBar />
     </div>
      <div className=' space-y-[16px] p-2 border border-[#E7E7E7] rounded-lg'>

        <Link href={'/dashboard/settings/profile'} className='flex gap-6 cursor-pointer rounded-lg py-[18px] bg-[#e9eaeb] px-[16px] text-[#343535] font-semibold text-[14px]'>
          <User /> Profile
        </Link>
        <Link href={'/dashboard/settings/password'} className='flex gap-6 cursor-pointer rounded-lg py-[18px] bg-[#e9eaeb] px-[16px] text-[#343535] font-semibold text-[14px]'>
          <Key /> Password
        </Link>

      </div>
    </div>
  )
}

export default page