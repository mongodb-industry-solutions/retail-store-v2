import React, { useState } from "react";
import { Drawer } from "@leafygreen-ui/drawer";
import { Tabs, Tab } from "@leafygreen-ui/tabs";

import "./customerRetention.css";
import EventStreamLogs from "./EventStreamLogs";
import BehaviourLogs from "./BehaviourLogs";
import NBAProcessLogs from "./NBAProcessLogs";
import BehaviourStatistics from "./BehaviourStatistics";
import GeneralStatistics from "./GeneralStatistics";
import NextBestActionStatistic from "./NextBestActionsStatistics";
import CustomerStatistic from "./CustomerStatistics";

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
        style={{marginBottom:'60px'}}
      >
        <Tab name="Next Best Action">
            <div className="ms-1 me-1 mt-2">
                <EventStreamLogs />
                <BehaviourLogs />
                <NBAProcessLogs />
            </div>
        </Tab>
        <Tab name="Statistics">
          <GeneralStatistics/>
          <CustomerStatistic/>
          <BehaviourStatistics/>
          <NextBestActionStatistic/>
        </Tab>
      </Tabs>
    </Drawer>
  );
};

export default CustomerRetentionContainer;
