"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SideDrawer = () => {
  return (
    <section className="w-full">
      <Sheet>
        <SheetTrigger>Add Asset</SheetTrigger>
        <SheetContent
          side={"right"}
          className="border-none bg-white dark:bg-slate-900"
        ></SheetContent>
      </Sheet>
    </section>
  );
};

export default SideDrawer;
