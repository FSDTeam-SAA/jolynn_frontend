
import React, { Suspense } from "react";
import AuthLayoutDesign from "../_components/authLayout";
import ChangePasswordBody from "./_components/changePasswordBody";


const page = () => {
  return (
    <div>
      <AuthLayoutDesign>
         <Suspense fallback={<div>Loading...</div>}>
        <ChangePasswordBody/>
         </Suspense>
      </AuthLayoutDesign>
    </div>
  );
};

export default page;