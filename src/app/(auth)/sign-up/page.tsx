
import React, { Suspense } from "react";
import AuthLayoutDesign from "../_components/authLayout";
import SignupForm from "./_components/sign-up-form";


const SignupPage = () => {
  return (
    <div>
      <AuthLayoutDesign>
         <Suspense fallback={<div>Loading...</div>}>
        <SignupForm/>
         </Suspense>
      </AuthLayoutDesign>
    </div>
  );
};

export default SignupPage;