import HeaderBox from "@/components/HeaderBox";
import React from "react";
import UserForm from "@/components/forms/UserForm";

const Create = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <HeaderBox
          title="Register a new employee"
          subtitle="Fill the form to register a new employee."
        />
      </div>
      <UserForm />
    </div>
  );
};
export default Create;
