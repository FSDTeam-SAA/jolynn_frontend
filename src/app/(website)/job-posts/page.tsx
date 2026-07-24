import React from 'react'
import JobPostsContainer from './_components/jobs-post-container'
import HeroSection from '@/components/common/hero-section'

const JobPostsPage = () => {
  return (
    <div>
       <HeroSection
        title="Job Posts"
        desc="Discover local help-wanted opportunities or post the service support you need—all while keeping your contact details private."
        image="/assets/images/jobs-post.jpg"
        compact
      />
        <JobPostsContainer/>
    </div>
  )
}

export default JobPostsPage
