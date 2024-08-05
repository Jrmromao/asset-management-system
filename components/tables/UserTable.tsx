import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {filterColumns, formatDateTime, renameColumns} from "@/lib/utils"
import React, {useState} from "react";
import CustomTableCell from "@/components/tables/CustomTableCell";
import {useRouter} from "next/navigation";
import LinkTableCell from "@/components/tables/LinkTableCell";


const UserTable = ({users, findById, deleteUser}: UserTableProps) => {

    const navigate = useRouter()
    const columnMappings: Record<keyof User, string> = {
        id: 'ID',
        email: 'Email',
        oauthId: '',
        firstName: 'Full Name',
        lastName: '',
        title: 'Title',
        employeeId: 'Employee ID',
        createdAt: 'Created At',
        updatedAt: 'Updated At',
        roleId: 'Role',
        companyId: 'Company',
        company: 'Company',
        role: ""
    };


    const filteredData = filterColumns(users, ["lastName", 'role', "createdAt", "updatedAt", 'oauthId', 'id']);
    const renamedData = renameColumns(filteredData, columnMappings);
    if (renamedData?.length === 0) return <p>No Users found</p>

    const headers = renamedData?.length > 0 ? Object?.keys(renamedData[0]) : []

    return (
        <div>
            <Table>
                <TableHeader className="bg-[#f9fafb]">
                    <TableRow>
                        {/*<TableHead className="px-2"></TableHead>*/}
                        {headers.map(name => {
                            return (
                                <TableHead key={name} className="px-2">{name}</TableHead>
                            )
                        })}
                        <TableHead className="px-2"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.map((user: User) => {
                        return (
                            <TableRow key={user.id}
                                      className={`cursor-pointer bg-[#F6FEF9]!over:bg-none !border-b-DEFAULT border-b-[1px]`}>

                                <LinkTableCell value={user?.email} navigateTo={`/assets/view/?id=${user.id}`}/>
                                <LinkTableCell value={user?.role?.name} navigateTo={`/assets/view/?id=${user.id}`}/>
                                <LinkTableCell value={user?.company?.name} navigateTo={`/assets/view/?id=${user.id}`}/>
                                <LinkTableCell value={`${user?.firstName} ${user?.lastName}`} navigateTo={`/assets/view/?id=${user.id}`}/>
                                <LinkTableCell value={user?.title} navigateTo={`/assets/view/?id=${user.id}`}/>
                                <LinkTableCell value={user?.employeeId} navigateTo={`/assets/view/?id=${user.id}`}/>

                                <TableCell className=" cusor-pointer pl-2 pr-10 capitalize min-w-24">
                                    <CustomTableCell id={user.id!} entity={user}
                                                     deleteEntity={() => deleteUser(user.id!)}
                                                     setRefresh={(flag: boolean) => console.log(flag)}
                                                     updateEntity={() => {
                                                     }}
                                                     viewEntity={() => {
                                                         navigate.push(`/assets/view/?id=${user.id}`)
                                                     }}/>
                                </TableCell>

                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>


        </div>
    )
}

export default UserTable