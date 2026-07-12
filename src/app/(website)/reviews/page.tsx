import React from 'react'
import ReviewContainer from './_components/review-container'
import HeroSection from '@/components/common/hero-section'

const ReviewPage = () => {
  return (
    <div>
      <HeroSection
        title="Reviews from Our Users"
        desc="For better experience connect and contact with us"
        image="/assets/images/about-us.jpg"
      />
      <ReviewContainer />
    </div>
  )
}

export default ReviewPage
