"use client";
import React from "react";
import CountUp from "react-countup";

const AnimatedCounter = ({
  value,
  decimals = 2,
  duration = 0.5,
}: {
  value: number;
  duration?: number;
  decimals?: number;
}) => {
  return (
    <div className="w-full">
      <CountUp
        duration={duration}
        decimals={decimals}
        decimal="."
        prefix={""}
        end={value}
      />
    </div>
  );
};

export default AnimatedCounter;
