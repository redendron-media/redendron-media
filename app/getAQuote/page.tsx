"use client";
import FormProgress from "@/components/sections/getaquote/formprogress";
import StepOne from "@/components/sections/getaquote/stepone";
import StepThree from "@/components/sections/getaquote/stepthree";
import StepTwo from "@/components/sections/getaquote/steptwo";
import React from "react";
import { useState } from "react";


const GetAQuote = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateFormData = (data: any) =>
    setFormData((prev) => ({ ...prev, ...data }));

  return (
    <div className="px-5 py-16 lg:px-16 lg:py-28 max-w-6xl mx-auto">
      <FormProgress currentStep={step} />

      {step === 1 && (
        <StepOne nextStep={nextStep} updateFormData={updateFormData} />
      )}
      {step === 2 && (
        <StepTwo
          nextStep={nextStep}
          prevStep={prevStep}
          updateFormData={updateFormData}
        />
      )}
      {step === 3 && <StepThree prevStep={prevStep} formData={formData} />}
    </div>
  );
};

export default GetAQuote;
