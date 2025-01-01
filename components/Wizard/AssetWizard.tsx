import * as React from "react";

import { Wizard, useWizard } from "react-use-wizard";

const AssetWizard = () => (
  <Wizard>
    <Step1 />
    <Step2 />
    <Step3 />
  </Wizard>
);

const Step1 = () => {
  const { handleStep, previousStep, nextStep } = useWizard();

  // Attach an optional handler
  handleStep(() => {
    alert("Going to step 1");
  });
  return (
    <>
      <h1>Step 1</h1>
      <div className={"flex gap-4 justify-center"}>
        <button onClick={() => previousStep()}>Previous</button>
        <button onClick={() => nextStep()}>Next</button>
      </div>
    </>
  );
};

const Step2 = () => {
  const { handleStep, previousStep, nextStep } = useWizard();

  // Attach an optional handler
  handleStep(() => {
    alert("Going to step 2");
  });

  return (
    <>
      <h1>Step 2</h1>
      <div className={"flex gap-4 justify-center"}>
        <button onClick={() => previousStep()}>Previous</button>
        <button onClick={() => nextStep()}>Next</button>
      </div>
    </>
  );
};

const Step3 = () => {
  const { handleStep, previousStep, nextStep } = useWizard();

  // Attach an optional handler
  handleStep(() => {
    alert("Going to step 2");
  });

  return (
    <>
      <h1>Step 3</h1>
      <div className={"flex gap-4 justify-center"}>
        <button onClick={() => previousStep()}>Previous</button>
        <button onClick={() => nextStep()}>Next</button>
      </div>
    </>
  );
};

export default AssetWizard;
