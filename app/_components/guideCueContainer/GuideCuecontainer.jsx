import { GuideCue } from "@leafygreen-ui/guide-cue";
import { useGuideCue } from "@/hooks/useGuideCue";
import { useEffect } from "react";

// GuideCueContainer.jsx
export default function GuideCueContainer({ config, feature }) {
  const { currentStep, open, setOpen, handleNext, handleDismiss, handleReset } =
    useGuideCue(config?.steps || 0);
  // Auto-start logic here
  useEffect(() => {
    if (config) {
      handleReset();
      console.log("🚀 Starting walkthrough for feature:", feature);
    }
  }, [config]);

  if (!config) return null;
  const currentMessage = config.messages[currentStep - 1];
  const currentTrigger = config.triggers[currentStep - 1];

  if (!currentMessage || !currentTrigger) {
    return null;
  }

  return (
    <GuideCue
      style={{ zIndex: 1100 }}
      open={open}
      setOpen={setOpen}
      refEl={currentTrigger}
      numberOfSteps={config.steps}
      currentStep={currentStep}
      onPrimaryButtonClick={handleNext}
      onDismiss={handleDismiss}
      title={currentMessage.title}
    >
      {currentMessage.description}
    </GuideCue>
  );
}
