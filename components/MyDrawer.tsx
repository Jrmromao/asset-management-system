// app/page.jsx (or any component where you want to use the drawer)

'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer"

export default function MyDrawer({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
    // const [open, setOpen] = useState(false);

    return (
        <Drawer open={open} onOpenChange={setOpen} >
            <DrawerTrigger asChild>
                <Button variant="outline">Open</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Navigation</DrawerTitle>
                    <DrawerClose />
                </DrawerHeader>
                {/* Your drawer content (links, etc.) goes here */}
            </DrawerContent>
        </Drawer>
    );
}
