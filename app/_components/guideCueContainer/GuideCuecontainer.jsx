import { GuideCue } from "@leafygreen-ui/guide-cue";
import { useGuideCue } from "@/hooks/useGuideCue";
import { useEffect } from "react";

// GuideCueContainer.jsx  
export default function GuideCueContainer({ config, feature, ready = true }) {  
    const {  
      currentStep,  
      open,  
      setOpen,  
      handleNext,  
      handleDismiss,  
      handleReset,  
    } = useGuideCue(config?.steps || 0);  
    
    useEffect(() => {  
      if (config && ready) {  // ✅ Only start if ready  
        const timer = setTimeout(() => {  
          handleReset();  
          console.log("🚀 Starting walkthrough for feature:", feature);  
        }, 500);  
          
        return () => clearTimeout(timer);  
      }  
    }, [config, feature, ready]);  // ✅ Add ready to deps  
    
    if (!config || !ready) return null;  // ✅ Don't render if not ready  
    
    const currentMessage = config.messages[currentStep - 1];  
    const currentTrigger = config.triggers[currentStep - 1];  
    
    if (!currentMessage || !currentTrigger) {  
      return null;  
    }  
    
    return (  
      <GuideCue  
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
  