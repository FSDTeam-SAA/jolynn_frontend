import React from 'react'

const GoogleMap = () => {
  return (
    <div className="py-10 md:py-16 lg:py-24">
         <iframe
            className="w-full rounded-[12px]"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2383.7803626937603!2d-6.317600023034217!3d53.311379677339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48670c7feab8e1e3%3A0x9ab66e5f33465e51!2s44%20Muckross%20Ave%2C%20Perrystown%2C%20Dublin%2C%20D12%20VK49%2C%20Ireland!5e0!3m2!1sen!2sbd!4v1762319752445!5m2!1sen!2sbd"
            // width="600"
            height="550"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
    </div>
  )
}

export default GoogleMap
