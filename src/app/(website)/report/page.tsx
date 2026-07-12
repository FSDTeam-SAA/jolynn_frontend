import React from 'react'
import ReportContainer from './_components/report-container'
import HeroSection from '@/components/common/hero-section'

const ReportPage = () => {
  return (
    <div>
      <HeroSection
        title="Report to Us"
        desc="Raise your concerns and report to us"
        image="/assets/images/report-hero.jpg"
      />
      <ReportContainer />
    </div>
  )
}

export default ReportPage
