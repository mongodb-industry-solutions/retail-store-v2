import Card from "@leafygreen-ui/card";
import React from "react";
import SectionHeader from "./SectionHeader";
import { logs } from "@/lib/constants";


const EventStreamLogs = () => {
  return (
    <Card>
      <SectionHeader
        title="UX events streams"
        amount={logs.length.toString()}
        learnMoreElement={
          <p className="m-0">
            Events streamed every X seconds to a{" "}
            <a
              href="https://www.mongodb.com/docs/manual/core/timeseries-collections/"
              target="_blank"
            >
              time series collection
            </a>{" "}
            inside MongoDB Atlas.
          </p>
        }
      />
      <div className="list-container">
        {logs.map((log) => (
          <div className="log-item" key={`log-${log._id}`}>
            <p className="m-0">
              <strong>{new Date(log.timestamp).toLocaleTimeString()}</strong>: {log.action}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EventStreamLogs;
