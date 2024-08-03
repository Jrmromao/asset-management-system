import React from 'react'
import {FiCheckCircle} from "react-icons/fi";

type StepperProps = {
    steps: string[];
    currentStep: number;
}

type StepProps = {
    step: number;
    title: string;
    isActive: boolean;
    isCompleted: boolean;
}

const Step = ({ step, title, isActive, isCompleted }: StepProps) => (
    <div className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${isCompleted ? 'bg-blue-600 text-white border-blue-600' : isActive ? 'bg-blue-100 text-blue-600 border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
            {isCompleted ? <FiCheckCircle /> : step}
        </div>
        <div className="ml-2">
            <div className={` ${isActive || isCompleted ? 'text-blue-600' : 'text-gray-600'}`}>{title}</div>
        </div>
    </div>
);

const Stepper = ({ steps, currentStep }: StepperProps) => {
    return (
        <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <Step
                        step={index + 1}
                        title={step}
                        isActive={currentStep === index}
                        isCompleted={currentStep > index}
                    />
                    {index < steps.length - 1 && (
                        <div
                            className={`flex-grow border-t-2 ${currentStep > index ? 'border-blue-600 mt-4' : 'border-gray-300 mt-4'} mr-1 ml-1`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}
export default Stepper
