import Card from "@leafygreen-ui/card";
import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import { customer_behaviour_docs } from "@/lib/constants";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
const BehaviourLogs = () => {
  const [openLogId, setOpenLogId] = useState(null);

  const LogItem = ({ log }) => {
    const isOpen = openLogId === log._id;

    const toggleDocument = () => {
      setOpenLogId(isOpen ? null : log._id);
    };

    const getBehaviorConfig = (type) => {
      switch (type) {
        case "prolonged-browsing":
          return { icon: "MagnifyingGlass", color: "#4CAF50", label: "Prolonged Browsing" };
        case "exit-intent":
          return { icon: "LogOut", color: "#FF5722", label: "Exit Intent" };
        case "indecision":
          return { icon: "QuestionMarkWithCircle", color: "#FF9800", label: "Indecision" };
        default:
          return { icon: "LightningBolt", color: "#2196F3", label: type };
      }
    };

    const behaviorConfig = getBehaviorConfig(log.behaviourType);

    return (
      <div className="log-item blue" key={`log-${log._id}`}>
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex align-items-center">
            <div
              style={{
                backgroundColor: behaviorConfig.color,
                borderRadius: "50%",
                padding: "6px",
                marginRight: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                glyph={behaviorConfig.icon}
                size="small"
                style={{ color: "white" }}
              />
            </div>
            <div>
              <p className="m-0" style={{ fontWeight: 600, fontSize: "14px", color: "#1976D2" }}>
                {behaviorConfig.label}
              </p>
              <p className="m-0" style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                {new Date(log?.behaviourRegisteredTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <IconButton
            onClick={toggleDocument}
            aria-label="Toggle Document"
          >
            <Icon glyph="CurlyBraces" size="small" />
          </IconButton>
        </div>
        {isOpen && (
          <pre className="log-document" style={{ marginTop: "12px" }}>
            {JSON.stringify(log, null, 2)}
          </pre>
        )}
      </div>
    );
  };
  return (
    <Card className="mt-2">
      <SectionHeader
        title="Customer behaviour events"
        amount={customer_behaviour_docs.length.toString()}
        learnMoreElement={
          <p className="m-0">
            Atlas Stream Processing ingests UX events streams and generates the
            belowed customer behaviours.
          </p>
        }
      />
      <div className="list-container">
        {customer_behaviour_docs.map((log) => (
          <LogItem key={`log-${log._id}`} log={log} />
        ))}
      </div>
    </Card>
  );
};

export default BehaviourLogs;
