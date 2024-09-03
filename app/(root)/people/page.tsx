'use client'
import React, {useEffect} from 'react'
import HeaderBox from "@/components/HeaderBox";
import {useDialogStore} from "@/lib/stores/store";
import {Button} from "@/components/ui/button";
import {useUserStore} from "@/lib/stores/userStore";
import {DialogContainer} from "@/components/dialogs/DialogContainer";
import UserForm from "@/components/forms/UserForm";
import UserTable from "@/components/tables/UserTable";
import {useRoleStore} from "@/lib/stores/roleStore";

const People = () => {
    const [openDialog, closeDialog, isOpen] = useDialogStore(state => [state.onOpen, state.onClose, state.isOpen])
    const [users, findById] = useUserStore(state => [state.users, state.findById])
    const [fetchRoles] = useRoleStore(state => [state.getAll])
useEffect(()=>{
    useUserStore.getState().getAll()
    fetchRoles()
},[])
    return (
        <div className="assets">
            <div className="transactions-header">
                <HeaderBox
                    title="People"
                    subtext="Manage asset assignees."
                />
            </div>
            <DialogContainer open={isOpen} onOpenChange={closeDialog} title={'New User'}
                             description={'Register a new user for your organization.'}
                             form={<UserForm/>}
            />
            <div className="space-y-6">
                <section className="flex">
                    <div className="flex justify-end">
                        <Button
                            variant={'link'}
                            onClick={openDialog}>Add People
                        </Button>
                    </div>
                </section>
                <section className="flex w-full flex-col gap-6">
                    <UserTable users={users} findById={findById} deleteUser={findById}/>

                </section>
            </div>
        </div>
    )
}
export default People
