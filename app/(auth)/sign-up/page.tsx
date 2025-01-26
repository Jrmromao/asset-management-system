import React from "react";
import RegisterForm from "@/components/forms/RegisterForm";

const SignUp = async () => {
  console.log("Key:", process.env.STRIPE_SECRET_KEY!);

  return (
    <div className={"flex-center size-full max-sm:px-6"}>
      <RegisterForm />
    </div>
  );
};

export default SignUp;
