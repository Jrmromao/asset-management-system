import React, { useRef, useCallback, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
// import { CloseIcon } from "styles/global-elements/Icons"
// import { mobileDrawerTicketTypes } from "helpers/constants"

// const buttons = mobileDrawerTicketTypes.map((type) => ({
//     id: type.id,
//     name: type.type,
//     href: type.key
// }))

function CreateTicketDrawer({
  isTicketDrawerOpen: bool = true,
  toggleTicketDrawer = () => {},
}: any) {
  // const { onClose } = useDisclosure()
  // const router = useRouter()
  const ref = useRef();

  useEffect(() => {
    localStorage.removeItem("ticketState");
  }, []);

  return (
    <Drawer open={true} onOpenChange={() => toggleTicketDrawer(false)}>
      <DrawerTrigger
        className="absolute right-[15000%] bottom-[500000px]"
        asChild
      >
        <Button className="absolute right-[15%] bottom-[5px]">Add</Button>
      </DrawerTrigger>
      <DrawerContent>...</DrawerContent>
    </Drawer>
  );
}

export default CreateTicketDrawer;
