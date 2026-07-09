// import Image from "next/image";
import React from "react";
// import haviasFooterLogo from '../../../public/images/authlogo.png'
// import loginimage from '../../../public/images/loginimage.png'

const AuthLayoutDesign = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-1 gap-2 bg-[#FAFAFA]  ">
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