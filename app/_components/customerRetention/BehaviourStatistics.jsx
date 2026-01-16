import Card from "@leafygreen-ui/card";
import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import { CUSTOMER_BEHAVIOUR_TYPES } from "@/lib/constants";
import Icon from "@leafygreen-ui/icon";
import { getBehaviorConfig } from "@/lib/helpers";
import Badge from "@leafygreen-ui/badge";
const BehaviourStatistics = () => {
  return (
    <Card className="BehaviourStatistics mt-2">
      <SectionHeader
        title="Customer Behaviour Events (By type)"
        amount={null}
        learnMoreElement={null}
      />
      <div className="">
        {Object.values(CUSTOMER_BEHAVIOUR_TYPES).map((type, index) => {
          const behaviorConfig = getBehaviorConfig(type.name);
          return (
            <div
              className="d-flex log-item grey justify-content-between"
              key={index}
            >
              <div className="d-flex align-items-center left">
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
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    {behaviorConfig.label}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center right">
                   <p className="m-0 me-2 font-weight-light text-secondary" style={{fontSize: '14px'}}>100%</p> 
                   <Badge variant="gray">2</Badge>

              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BehaviourStatistics;
