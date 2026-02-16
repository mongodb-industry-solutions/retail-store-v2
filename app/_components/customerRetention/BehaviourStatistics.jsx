import Card from "@leafygreen-ui/card";
import React, { useState, useEffect } from "react";
import Code from "@leafygreen-ui/code";
import SectionHeader from "./SectionHeader";
import InfoWizard from "../InfoWizard/InfoWizard";
import { CUSTOMER_BEHAVIOUR_TYPES } from "@/lib/constants";
import Icon from "@leafygreen-ui/icon";
import { getBehaviorConfig, getUser } from "@/lib/helpers";
import { getCustomerBehaviorAnalysis } from "@/lib/api";
import { AGGREGATION_PIPELINES } from "@/lib/constants";
import Badge from "@leafygreen-ui/badge";
import { useSelector } from "react-redux";

const BehaviourStatistics = () => {
  const [behaviorData, setBehaviorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const recalculateAnalytics = useSelector((state) => state.CustomerRetention.recalculateAnalytics);

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch behavior analysis data across all user sessions
        const data = await getCustomerBehaviorAnalysis();
        setBehaviorData(data || []);
      } catch (err) {
        console.error("Error fetching customer behavior analysis:", err);
        setError(err.message || "Failed to load behavior data");
      } finally {
        setLoading(false);
      }
    };

    fetchBehaviorData();
  }, [recalculateAnalytics]);

  // Create a map of behavior data by signal type for easy lookup
  const behaviorDataMap = behaviorData.reduce((acc, item) => {
    acc[item.signal] = item;
    return acc;
  }, {});

  // Calculate total count for display
  const totalCount = behaviorData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="BehaviourStatistics mt-2">
      <SectionHeader
        title="Customer Behaviour (By signal type)"
        subtitle={loading ? 'Loading user data...' : `Based on ${totalCount} signals across all of ${getUser()?.name || "this user"}'s sessions.`}
        amount={null}
        learnMoreElement={null}
        extraHTMLElement={<InfoWizard open={isInfoOpen} setOpen={setIsInfoOpen} tabs={[{
          heading: "Aggregation Pipeline",
          content: <Code language="javascript">{`const pipeline = ${JSON.stringify(AGGREGATION_PIPELINES.CUSTOMER_BEHAVIOR_ANALYSIS, null, 2)}`}</Code>
        }]} />}
      />
      
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}
      
      <div className="">
        {Object.values(CUSTOMER_BEHAVIOUR_TYPES).map((type, index) => {
          const behaviorConfig = getBehaviorConfig(type.name);
          const behaviorStats = behaviorDataMap[type.name];
          
          // If we have data for this behavior type, use it; otherwise show 0
          const percentage = behaviorStats?.percentage || 0;
          const count = behaviorStats?.count || 0;
          
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
                <p className="m-0 me-2 font-weight-light text-secondary" style={{fontSize: '14px'}}>
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

export default BehaviourStatistics;
