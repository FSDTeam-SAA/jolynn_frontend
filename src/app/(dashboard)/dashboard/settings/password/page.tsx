import React from 'react'
import { SideSetting } from '../_components/SideSetting'
import PasswordChange from '../_components/PasswordChnage'
import { AppTopBar } from '../../_component/shared/app-topbar'

const page = () => {
  return (
    <div>
      <div className='mt-[60px] mb-8'>
        <AppTopBar />
      </div>
      <div className='flex gap-6'>
        <SideSetting />
        <PasswordChange />
      </div>
    </div>
  )
}

export default page