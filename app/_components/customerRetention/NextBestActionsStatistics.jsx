import Card from "@leafygreen-ui/card";
import React from "react";
import SectionHeader from "./SectionHeader";
import { next_best_actions_types } from "@/lib/constants";
import Icon from "@leafygreen-ui/icon";
import { getBehaviorConfig, getNextBestActionConfig } from "@/lib/helpers";
import Badge from "@leafygreen-ui/badge";

const NextBestActionStatistic = () => {
  return (
    <Card className="NextBestActionStatistic mt-2">
      <SectionHeader
        title="Next Best Actions Triggered (By type)"
        amount={null}
        learnMoreElement={null}
      />
      <div className="">
        {next_best_actions_types.map((type, index) => {
          const behaviorConfig = getBehaviorConfig(type);
          return (
            <div
              className="d-flex log-item grey justify-content-between"
              key={index}
            >
              <div className="d-flex align-items-center left">
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    padding: "8px",
                    marginRight: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    glyph={getNextBestActionConfig(type).icon}
                    size="small"
                    style={{ color: "#666" }}
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
                <p
                  className="m-0 me-2 font-weight-light text-secondary"
                  style={{ fontSize: "14px" }}
                >
                  100%
                </p>
                <Badge variant="gray">2</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default NextBestActionStatistic;
