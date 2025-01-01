"use client";
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface IProps {
  option: string;
  setOption: (option: string) => void;
}
const YesNoQuestion = ({ option, setOption }: IProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Click..");
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-2">
        <label>
          <Checkbox
            checked={option === "yes"}
            onChange={() => setOption("yes")}
          />
          Yes
        </label>
      </div>
      <div className={"flex gap-2"}>
        <label>
          <Checkbox
            checked={option === "no"}
            onChange={() => setOption("no")}
          />
          No
        </label>
      </div>
    </div>
  );
};

export default YesNoQuestion;
