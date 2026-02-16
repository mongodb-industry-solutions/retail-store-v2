import Card from "@leafygreen-ui/card";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import SectionHeader from "./SectionHeader";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import { getBehaviorConfig } from "@/lib/helpers";
import useAutoScroll from "@/hooks/useAutoScroll";

const BehaviourLogs = () => {
  const [openLogId, setOpenLogId] = useState(null);
  const {
    data: customerBehaviour,
  } = useSelector((state) => state.CustomerRetention.customerBehaviour);
  const { containerRef } = useAutoScroll(customerBehaviour);



  const LogItem = ({ log }) => {
    const isOpen = openLogId === log._id;
    const toggleDocument = () => {
      setOpenLogId(isOpen ? null : log._id);
    };

    const behaviorConfig = getBehaviorConfig(log.signal);

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
              <p
                className="m-0"
                style={{ fontWeight: 600, fontSize: "14px", color: "#1976D2" }}
              >
                {behaviorConfig.label}
              </p>
              <p
                className="m-0"
                style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}
              >
                {new Date(log?.ts).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <IconButton onClick={toggleDocument} aria-label="Toggle Document">
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
        title="2. Customer behaviour signals"
        amount={customerBehaviour.length.toString()}
        learnMoreElement={
          <p className="m-0">
            <a
              href="https://www.mongodb.com/atlas/stream-processing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Atlas Stream Processing (ASP)
            </a>{" "}
             process the real-time events from step 1 as they arrive. It identifies patterns in the session and generates the below customer
            behavior signals.
          </p>
        }
      />
      <div className="list-container" ref={containerRef}>
        {customerBehaviour.map((log) => (
          <LogItem key={`log-${log._id}`} log={log} />
        ))}
      </div>
    </Card>
  );
};

export default BehaviourLogs;
