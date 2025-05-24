import React from "react";
import { UserForm } from "./UserForm";

//login page that only has a form rn, rn only login as guest works
export const LoginPage = () => {

  return (
    <div className="login-page">
      <div className="logo"></div>
      <UserForm/>
    </div>
    
  );
};
