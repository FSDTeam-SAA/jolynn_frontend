import Faq from "./_components/faq";
import GrowYourBusiness from "./_components/grow-your-business";
import MostPopularService from "./_components/most-popular-service";
import SponsoredAdvertisements from "./_components/sponsored-advertisements";


const HomePage = () => {
  
  return (
    <div className="">
      <MostPopularService/>
      <SponsoredAdvertisements/>
      <GrowYourBusiness/>
     
     <Faq/>
    </div>
  );
};

export default HomePage;
