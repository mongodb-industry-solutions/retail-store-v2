import { useState } from 'react';

export function useGuideCue(steps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [open, setOpen] = useState(false);

  const handleNext = () => {
    if (currentStep < steps) {
      setCurrentStep(n => n + 1);
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setOpen(true);
  };

  return {
    currentStep,
    setCurrentStep,
    open,
    setOpen,
    handleNext,
    handleDismiss,
    handleReset,
  };
}