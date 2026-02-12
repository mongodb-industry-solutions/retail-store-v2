import Card from "@leafygreen-ui/card";
import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import { useSelector } from "react-redux";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import useAutoScroll from "@/hooks/useAutoScroll";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/constants";

const EventStreamLogs = () => {
  const [openLogId, setOpenLogId] = useState(null);
  const events = useSelector(state => state.Events.events);
  const { containerRef } = useAutoScroll(events);

  const LogItem = ({ log }) => {
    const isOpen = openLogId === log._id;
    
    const toggleDocument = () => {
      setOpenLogId(isOpen ? null : log._id);
    };
    
    return (
      <div className="log-item" key={`log-${log._id}`}>
        <div className="top">
          <p className="m-0 d-inline">
            <strong>{new Date(log?.timestamp).toLocaleTimeString()}</strong>:{" "}
            {log?.tags?.event}
          </p>
          <IconButton
            onClick={toggleDocument}
            aria-label="Toggle Document"
          >
            <Icon glyph="CurlyBraces" />
          </IconButton>
        </div>
        {isOpen && (
          <pre className="log-document">
            {JSON.stringify(
              { ...log },
              null,
              2
            )}
          </pre>
        )}
      </div>
    );
  };

  return (
    <Card>
      <SectionHeader
        title="1. Customer events streams"
        amount={events?.length?.toString()}
        learnMoreElement={
          <p className="m-0">
            Action based interactions are streamed to MongoDB Atlas in real time, complemented by heartbeat signals sent every {HEARTBEAT_INTERVAL_MS / 1000} seconds.
          </p>
        }
      />
      <div className="list-container" ref={containerRef}>
        {events.map((log) => (
          <LogItem key={`log-${log?._id}`} log={log} />
        ))}
      </div>
    </Card>
  );
};

export default EventStreamLogs;
