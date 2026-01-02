import Card from "@leafygreen-ui/card";
import React from "react";
import SectionHeader from "./SectionHeader";
import { Badge, CardTitle } from "react-bootstrap";
import { InfoSprinkle } from "@leafygreen-ui/info-sprinkle";

const CustomerStatistic = () => {
  return (
    <Card className="mt-2 CustomerStatistic">
      <SectionHeader
        title="Customer Analytics"
        amount={null}
        learnMoreElement={null}
      />
      <div>
        <div className="item">
          <p className="m-0">Most responsive to</p>
          <CardTitle>Free delivery</CardTitle>
        </div>
        <div className="item">
          <p className="m-0">Engagement distribution</p>
          <CardTitle> <Badge style={{width: '50px'}} variant="gray">87%</Badge> Free delivery</CardTitle>
          <CardTitle><Badge style={{width: '50px'}} variant="gray">10%</Badge> Social Proof Notification</CardTitle>
          <CardTitle><Badge style={{width: '50px'}} variant="gray">3%</Badge> Product Recommendations</CardTitle>
        </div>
      </div>
    </Card>
  );
};

export default CustomerStatistic;
