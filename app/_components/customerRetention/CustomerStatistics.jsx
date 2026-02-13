import Card from "@leafygreen-ui/card";
import React, { useEffect, useState } from "react";
import Code from "@leafygreen-ui/code";
import SectionHeader from "./SectionHeader";
import InfoWizard from "../InfoWizard/InfoWizard";
import { Badge, CardTitle } from "react-bootstrap";
import { InfoSprinkle } from "@leafygreen-ui/info-sprinkle";
import { getEngagedActionsAnalysis } from "@/lib/api";
import { getUser, getNextBestActionConfig } from "@/lib/helpers";
import { AGGREGATION_PIPELINES } from "@/lib/constants";
import { useSelector } from "react-redux";

const CustomerStatistic = () => {
  const [engagementData, setEngagementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const recalculateAnalytics = useSelector((state) => state.CustomerRetention.recalculateAnalytics);

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch engaged actions analysis data (only redeemed actions)
        const data = await getEngagedActionsAnalysis();
        setEngagementData(data || []);
      } catch (err) {
        console.error("Error fetching engaged actions analysis:", err);
        setError(err.message || "Failed to load engagement data");
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, [recalculateAnalytics]);

  // Calculate total count for display
  const totalCount = engagementData.reduce((sum, item) => sum + item.count, 0);
  
  // Find most responsive action (highest percentage)
  const mostResponsive = engagementData.length > 0 ? engagementData[0] : null;

  return (
    <Card className="mt-2 CustomerStatistic">
      <SectionHeader
        title="Customer Analytics"
        subtitle={loading ? 'Loading engagement data...' : `Based on ${totalCount} redeemed NBA across all ${getUser()?.name || getUser()?.firstName || "this user"}'s sessions.`}
        amount={null}
        learnMoreElement={null}
        extraHTMLElement={<InfoWizard open={isInfoOpen} setOpen={setIsInfoOpen} tabs={[{
          heading: "Aggregation Pipeline",
          content: <Code language="javascript">{`const pipeline = ${JSON.stringify(AGGREGATION_PIPELINES.ENGAGED_ACTIONS_ANALYSIS, null, 2)}`}</Code>
        }]} />}
      />
      
      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}
      
      <div>
        <div className="item">
          <p className="m-0">Most responsive to</p>
          <CardTitle>
            {loading ? 'Loading...' : (mostResponsive ? getNextBestActionConfig( mostResponsive.actionType).label : 'No engagement data')}
          </CardTitle>
        </div>
        <div className="item">
          <p className="m-0">Engagement distribution</p>
          {loading ? (
            <CardTitle>Loading...</CardTitle>
          ) : (
            engagementData.map((item, index) => (
              <CardTitle key={index}>
                <Badge style={{width: '50px'}} variant="gray">{item.percentage}%</Badge> {getNextBestActionConfig(item.actionType).label}
              </CardTitle>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default CustomerStatistic;
