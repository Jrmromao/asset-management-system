import React from "react";

type HeaderBoxProps = {
  title: string;
  subtext: string;
  icon?: React.ReactNode;
};

const HeaderBox = ({ title, subtext, icon }: HeaderBoxProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex items-center space-x-2 text-muted-foreground">
        {icon}
        <span>{subtext}</span>
      </div>
    </div>
  );
};

export default HeaderBox;
