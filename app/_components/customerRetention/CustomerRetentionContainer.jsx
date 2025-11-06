import React, { useState } from "react";
import { Drawer } from "@leafygreen-ui/drawer";
import { Tabs, Tab } from "@leafygreen-ui/tabs";

import "./customerRetention.css";
import EventStreamLogs from "./EventStreamLogs";
import BehaviourLogs from "./BehaviourLogs";
import NBAProcessLogs from "./NBAProcessLogs";

const CustomerRetentionContainer = () => {
  const [selected, setSelected] = useState(0);

  return (
    <Drawer
      className="customer-retention-container"
      title="Customer retention strategy"
      style={{ position: "fixed" }}
    >
      <Tabs
        aria-label="Customer retention tabs"
        setSelected={setSelected}
        selected={selected}
      >
        <Tab name="Next Best Action">
            <div className="ms-1 me-1 mt-2">
                <EventStreamLogs />
                <BehaviourLogs />
                <NBAProcessLogs />
            </div>
        </Tab>
        <Tab name="Statistics">

        </Tab>
      </Tabs>
    </Drawer>
  );
};

export default CustomerRetentionContainer;
