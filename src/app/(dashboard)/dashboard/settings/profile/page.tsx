import React from 'react'
import PersonalInfo from '../_components/PersonalInfo'
import { SideSetting } from '../_components/SideSetting'
import { AppTopBar } from '../../_component/shared/app-topbar'

const page = () => {
  return (
    <div>
      <div className='mt-[60px] mb-8'>
        <AppTopBar />
      </div>
      <div className='flex gap-6'>
        <SideSetting />
        <PersonalInfo />
      </div>
    </div>
  )
}

export default page