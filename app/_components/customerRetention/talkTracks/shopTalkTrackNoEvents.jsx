import React from "react";
import { useRouter } from "next/navigation";
import Button from "@leafygreen-ui/button";
import { Body, H3 } from "@leafygreen-ui/typography";
import { FEATURES } from "@/lib/constants";

const ShopTalkTrackNoEvents = () => {
  const router = useRouter();

  const handleGoToCustomerRetention = () => {
    router.push(`/shop?feature=${FEATURES.CUSTOMER_RETENTION}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          padding: "16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <p style={{ marginBottom: "12px", fontWeight: "bold" }}>
          Are you looking for the "Customer Retention" demo?
        </p>
        <p style={{ marginBottom: "16px" }}>
          With the Customer Retention Demo, you can see in real time how the e-commerce platform interprets user behavior on this page and automatically triggers actions that keep customers engaged and enhance their overall experience.
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <img
            src="/rsc/images/customerRetention.png"
            alt="Customer Retention Demo"
            style={{
              width: "100%",
              maxWidth: "500px",
              marginBottom: "16px",
              borderRadius: "8px",
            }}
          />
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <Button variant="primary" onClick={handleGoToCustomerRetention}>
            Take me to the customer retention demo
          </Button>
        </div>
      </div>
      <H3>Shop Page Overview</H3>

      <p style={{ marginBottom: "16px" }}>
        On this page, you can explore the e-commerce catalog and use the search bar, powered by Atlas Search, to quickly find products.
      </p>
    </div>
  );
};

export default ShopTalkTrackNoEvents;
