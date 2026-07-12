import React from 'react'
import JobPostsContainer from './_components/jobs-post-container'
import HeroSection from '@/components/common/hero-section'

const JobPostsPage = () => {
  return (
    <div>
       <HeroSection
        title="Job Posts"
        desc="For better experience connect and contact with us"
        image="/assets/images/jobs-post.jpg"
      />
        <JobPostsContainer/>
    </div>
  )
}

export default JobPostsPage
