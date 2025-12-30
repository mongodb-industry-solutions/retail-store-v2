import Card from "@leafygreen-ui/card";
import React from "react";
import SectionHeader from "./SectionHeader";
import { CardTitle } from "react-bootstrap";
import { InfoSprinkle } from "@leafygreen-ui/info-sprinkle";

const GeneralStatistics = () => {
  return (
    <Card className="mt-2 GeneralStatistics">
      <SectionHeader
        title="Session Analytics"
        amount={null}
        learnMoreElement={null}
      />
      <div>
        <div className="item">
          <p className="m-0">Total Events Processed</p>
          <CardTitle>104</CardTitle>
        </div>
        <div className="item">
          <p className="m-0">Next Best Actions Triggered</p>
          <CardTitle>7</CardTitle>
        </div>
        <div className="item">
            <div className="d-flex">
                <p className="m-0 me-1">Conversion Rate</p>
                <InfoSprinkle
                    baseFontSize={12}
                    aria-label="Conversion rate formula">
                    (Products Added to Cart / Total Products Viewed) × 100
                </InfoSprinkle>
            </div>
          <CardTitle>80%</CardTitle>
        </div>
      </div>
    </Card>
  );
};

export default GeneralStatistics;
