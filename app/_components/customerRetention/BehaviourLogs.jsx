import Card from "@leafygreen-ui/card";
import React from "react";
import SectionHeader from "./SectionHeader";
import { logs } from "@/lib/constants";

const BehaviourLogs = () => {
  return (
    <Card className="mt-2">
      <SectionHeader
        title="Customer behaviour events"
        amount={logs.length.toString()}
        learnMoreElement={
          <p className="m-0">
            Atlas Stream Processing ingests UX events streams and generates the belowed customer behaviours.
          </p>
        }
      />
    </Card>
  );
};

export default BehaviourLogs;
