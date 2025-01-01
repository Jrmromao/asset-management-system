"use client";
import React from "react";
import CountUp from "react-countup";

const AnimatedCounter = ({ value }: { value: number }) => {
  return (
    <div className="w-full">
      <CountUp
        duration={0.5}
        decimals={2}
        decimal="."
        prefix={""}
        end={value}
      />
    </div>
  );
};

export default AnimatedCounter;
