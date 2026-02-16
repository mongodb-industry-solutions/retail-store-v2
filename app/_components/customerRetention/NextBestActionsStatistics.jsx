import Card from "@leafygreen-ui/card";
import React, { useEffect, useState } from "react";
import Code from "@leafygreen-ui/code";
import SectionHeader from "./SectionHeader";
import InfoWizard from "../InfoWizard/InfoWizard";
import { NEXT_BEST_ACTIONS_TYPES } from "@/lib/constants";
import Icon from "@leafygreen-ui/icon";
import { getNextBestActionConfig, getUser } from "@/lib/helpers";
import { getNextBestActionsAnalysis } from "@/lib/api";
import { AGGREGATION_PIPELINES } from "@/lib/constants";
import Badge from "@leafygreen-ui/badge";
import { useSelector } from "react-redux";

const NextBestActionStatistic = () => {
  const [actionsData, setActionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const recalculateAnalytics = useSelector((state) => state.CustomerRetention.recalculateAnalytics);

  useEffect(() => {
    const fetchActionsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch next best actions analysis data (including all actions)
        const data = await getNextBestActionsAnalysis(true);
        console.log("Next Best Actions Analysis Data:", data);
        setActionsData(data || []);
      } catch (err) {
        console.error("Error fetching next best actions analysis:", err);
        setError(err.message || "Failed to load actions data");
      } finally {
        setLoading(false);
      }
    };

    fetchActionsData();
  }, [recalculateAnalytics]);

  // Create a map of actions data by action type for easy lookup
  const actionsDataMap = actionsData.reduce((acc, item) => {
    acc[item.type] = item;
    return acc;
  }, {});

  // Calculate total count for display
  const totalCount = actionsData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="NextBestActionStatistic mt-2">
      <SectionHeader
        title="Next Best Actions Triggered (By type)"
        subtitle={loading ? 'Loading actions data...' : `Based on ${totalCount} actions across all of ${getUser()?.name || "this user"}'s sessions.`}
        amount={null}
        learnMoreElement={null}        
        extraHTMLElement={<InfoWizard open={isInfoOpen} setOpen={setIsInfoOpen} tabs={[{
          heading: "Aggregation Pipeline",
          content: <Code language="javascript">{`const pipeline = ${JSON.stringify(AGGREGATION_PIPELINES.NEXT_BEST_ACTIONS_ANALYSIS, null, 2)}`}</Code>
        }]} />}      />
      
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}
      
      <div className="">
        {Object.values(NEXT_BEST_ACTIONS_TYPES).map((type, index) => {
          const NBAConfig = getNextBestActionConfig(type.name);
          const actionStats = actionsDataMap[type.name];
          
          // If we have data for this action type, use it; otherwise show 0
          const percentage = actionStats?.percentage || 0;
          const count = actionStats?.count || 0;
          
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
                    glyph={NBAConfig.icon}
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
                    {NBAConfig.label}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center right">
                <p
                  className="m-0 me-2 font-weight-light text-secondary"
                  style={{ fontSize: "14px" }}
                >
                  {loading ? '...' : `${percentage}%`}
                </p>
                <Badge variant={count > 0 ? "blue" : "gray"}>
                  {loading ? '...' : count}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default NextBestActionStatistic;
