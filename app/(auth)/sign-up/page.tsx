import React from 'react'
import RegisterForm from "@/components/forms/RegisterForm";
// import {getLoggedInUser} from "@/lib/actions/user.actions";

const SignUp = async () => {
    // const loggedInUser = await getLoggedInUser();
    return (
        <div className={'flex-center size-full max-sm:px-6'}>
            <RegisterForm/>
        </div>
    )
}

export default SignUp
