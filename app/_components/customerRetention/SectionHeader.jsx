import Badge from "@leafygreen-ui/badge";
import React, { useState } from "react";
import { Label } from '@leafygreen-ui/typography';
import Icon from "@leafygreen-ui/icon";

const SectionHeader = (props) => {
  const { title, amount = null, learnMoreElement = null } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div className="section-header">
        <div className="titles d-flex p-2 justify-content-between align-items-center">
          <Label>{title}</Label>
          {amount && <Badge variant="darkgray">{amount}</Badge>}
        </div>
        {learnMoreElement && expanded && (
          <div
            className="learn-more-text"
            style={{
              maxWidth: "100%",
              fontSize: "13px",
              color: "#444",
              marginTop: "8px",
            }}
          >
            {learnMoreElement}
          </div>
        )}
      </div>
      {learnMoreElement && (
        <button
          className="learn-more-toggle"
          onClick={() => setExpanded(e => !e)}
          style={{
            position: "absolute",
            right: "0px",
            bottom: "-10px", // places it below the section-header
            background: "#f6f7f9",
            border: "1px solid #e9ecef",
            borderRadius: "12px 12px 0 12px",
            color: "#00704a",
            cursor: "pointer",
            padding: "4px 10px 4px 14px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.2s",
            zIndex: 2,
          }}
          aria-expanded={expanded}
        >
          <span style={{ marginRight: "6px" }}>{expanded ? "Hide" : "Learn more"}</span>
          <Icon glyph={expanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
