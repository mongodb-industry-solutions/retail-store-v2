import Card from "@leafygreen-ui/card";
import React, { useMemo } from "react";
import SectionHeader from "./SectionHeader";
import { CardTitle } from "react-bootstrap";
import { InfoSprinkle } from "@leafygreen-ui/info-sprinkle";
import { useSelector } from "react-redux";
import { EVENT_STREAMS_TYPES } from "@/lib/constants";
import { getSessionAndUserId, getUser } from "@/lib/helpers";

const GeneralStatistics = () => {
  const { uid, sid } = getSessionAndUserId();
  const nextBestActionsTriggered = useSelector(state => state.CustomerRetention?.nextBestActions?.data?.length || 0);
  
  // Calculate conversion rate from actual events (optimized with useMemo)
  const events = useSelector(state => state.Events?.events || []);
  const { productsAddedToCart, totalProductsViewed, conversionRate } = useMemo(() => {
    let addToCartCount = 0;
    let viewProductCount = 0;
    
    // Debug: Log events to see their structure
    console.log('All events for conversion calculation:', events);
    console.log('Looking for ADD_TO_CART:', EVENT_STREAMS_TYPES.ADD_TO_CART.name);
    console.log('Looking for VIEW_PRODUCT:', EVENT_STREAMS_TYPES.VIEW_PRODUCT.name);
    
    // Single pass through events instead of two filters
    events.forEach(event => {
      console.log('Event:', event, 'Event type:', event.tags?.event);
      if (event.tags?.event === EVENT_STREAMS_TYPES.ADD_TO_CART.name) {
        addToCartCount++;
        console.log('Found ADD_TO_CART event, count:', addToCartCount);
      } else if (event.tags?.event === EVENT_STREAMS_TYPES.VIEW_PRODUCT.name) {
        viewProductCount++;
        console.log('Found VIEW_PRODUCT event, count:', viewProductCount);
      }
    });
    
    console.log('Final counts - addToCart:', addToCartCount, 'viewProduct:', viewProductCount);
    
    const rate = viewProductCount > 0 ? ((addToCartCount / viewProductCount) * 100).toFixed(1) : 0;
    
    return {
      productsAddedToCart: addToCartCount,
      totalProductsViewed: viewProductCount,
      conversionRate: rate
    };
  }, [events]);

  return (
    <>
    {/* Session Info Bar */}
    <div className="mb-2 p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex gap-4">
          <span style={{ fontSize: '13px' }}>
            <strong>User ID:</strong> <code>{uid|| 'No user selected'}</code>
          </span>
          <span style={{ fontSize: '13px' }}>
            <strong>Session:</strong> <code>{sid}</code>
          </span>
        </div>
      </div>
    </div>

    <Card className="mt-2 GeneralStatistics">
      <SectionHeader
        title="Session Analytics"
        subtitle={`For current ${getUser()?.name || "this user"}'s session.`}
        amount={null}
        learnMoreElement={null}
      />
      <div>
        <div className="item">
          <p className="m-0">Total Events Generated</p>
          <CardTitle>{events?.length || 0}</CardTitle>
        </div>
        <div className="item">
          <p className="m-0">Next Best Actions Triggered</p>
          <CardTitle>{nextBestActionsTriggered}</CardTitle>
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
          <CardTitle>{conversionRate}%</CardTitle>
        </div>
      </div>
    </Card>
    </>
    
  );
};

export default GeneralStatistics;
