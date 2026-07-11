import Faq from "./_components/faq";
// import GrowYourBusiness from "./_components/grow-your-business";
// import SponsoredAdvertisements from "./_components/sponsored-advertisements";
import Hero from "./_components/hero";
import MostPopularService from "./_components/most-popular-service";


const HomePage = () => {
  
  return (
    <div className="">
      <Hero />
      <MostPopularService/>
      {/* <SponsoredAdvertisements/>
      <GrowYourBusiness/> */}
     
     <Faq/>
    </div>
  );
};

export default HomePage;
