import React from 'react'
import {prisma} from "@/app/db";

const Index = async () => {
    let prismaPromise = await prisma.todo.findMany();

    return <>
        {prismaPromise.map(o => o.title)}
    </>
}
export default Index
