import Card from "@leafygreen-ui/card";
import React, { useState, useRef, useEffect } from "react";
import SectionHeader from "./SectionHeader";
import { useSelector } from "react-redux";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";

const EventStreamLogs = () => {
  const [openLogId, setOpenLogId] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const events = useSelector(state => state.Events.events);
  const listContainerRef = useRef(null);

  // Check if user is at the bottom of the scroll
  const checkIfAtBottom = () => {
    if (listContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current;
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5; // 5px tolerance
      setIsAtBottom(atBottom);
    }
  };

  // Auto-scroll to bottom when new events arrive, but only if user was already at bottom
  useEffect(() => {
    if (isAtBottom && listContainerRef.current) {
      listContainerRef.current.scrollTop = listContainerRef.current.scrollHeight;
    }
  }, [events, isAtBottom]);

  // Add scroll listener to track user's scroll position
  useEffect(() => {
    const container = listContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom);
      // Check initial position
      checkIfAtBottom();
      
      return () => {
        container.removeEventListener('scroll', checkIfAtBottom);
      };
    }
  }, []);

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
      <div className="list-container" ref={listContainerRef}>
        {events.map((log) => (
          <LogItem key={`log-${log?._id}`} log={log} />
        ))}
      </div>
    </Card>
  );
};

export default EventStreamLogs;
