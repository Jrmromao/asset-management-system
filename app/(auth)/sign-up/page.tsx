import React from 'react'
import AuthForm from "@/components/AuthForm";
// import {getLoggedInUser} from "@/lib/actions/user.actions";

const SignUp = async () => {
    // const loggedInUser = await getLoggedInUser();
    return (
        <div className={'flex-center size-full max-sm:px-6'}>
            <AuthForm type={'sign-up'}/>
        </div>
    )
}

export default SignUp
