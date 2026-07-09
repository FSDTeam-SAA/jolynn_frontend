// import Image from "next/image";
import React from "react";
// import haviasFooterLogo from '../../../public/images/authlogo.png'
// import loginimage from '../../../public/images/loginimage.png'

const AuthLayoutDesign = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-1 gap-2 bg-[linear-gradient(180deg,_#292D73_0%,_#91C7D9_50%,_#CBE4E3_100%),_linear-gradient(0deg,_rgba(0,0,0,0.2),_rgba(0,0,0,0.2))]  ">
      {/* <div className="  relative md:grid-cols-1 flex ">
        <Image
          src={loginimage}
          width={1082}
          height={960}
          alt="auth image"
          className="w-full h-full  object-cover"
        />
        <div className="absolute  top-0 ring-0 w-[172px] h-[214px]">
          <Image
            src={haviasFooterLogo}
            width={1082}
            height={960}
            alt="auth logo"
            className="w-full h-full  object-cover"
          />
        </div>
      </div> */}
      <div className="md:grid-cols-1 h-full w-full flex items-center justify-center">{children}</div>
    </div>
  );
};

export default AuthLayoutDesign;