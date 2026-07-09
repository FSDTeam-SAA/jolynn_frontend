
import React, { Suspense } from "react";
import AuthLayoutDesign from "../_components/authLayout";
import LoginForm from "./components/ForgotPasswordForm";


const LoginPage = () => {
  return (
    <div>
      <AuthLayoutDesign>
         <Suspense fallback={<div>Loading...</div>}>
        <LoginForm/>
         </Suspense>
      </AuthLayoutDesign>
    </div>
  );
};

export default LoginPage;