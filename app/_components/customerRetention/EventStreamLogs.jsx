import Card from "@leafygreen-ui/card";
import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import { useSelector } from "react-redux";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";

const EventStreamLogs = () => {
  const [openLogId, setOpenLogId] = useState(null);
  const events = useSelector(state => state.Events.events);

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
        title="UX events streams"
        amount={events.length.toString()}
        learnMoreElement={
          <p className="m-0">
            Events streamed every X seconds to a{" "}
            <a
              href="https://www.mongodb.com/docs/manual/core/timeseries-collections/"
              target="_blank"
            >
              time series collection
            </a> {" "}inside MongoDB Atlas.
          </p>
        }
      />
      <div className="list-container">
        {events.map((log) => (
          <LogItem key={`log-${log?._id}`} log={log} />
        ))}
      </div>
    </Card>
  );
};

export default EventStreamLogs;
