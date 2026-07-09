import React, { Suspense } from "react";
import AuthLayoutDesign from "../_components/authLayout";
import OtpForm from "./components/otp";


const page = () => {
  return (
    <div>
      <AuthLayoutDesign>
        <Suspense fallback={<div>Loading...</div>}>
          <OtpForm />
        </Suspense>
      </AuthLayoutDesign>
    </div>
  );
};

export default page;