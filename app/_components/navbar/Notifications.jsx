import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import Badge from "@leafygreen-ui/badge";
import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useSelector } from "react-redux";
import NotificationItem from "./NotificationItem";

const Notifications = ({ isMenuOpened, onToggle }) => {
  const { nextBestActions } = useSelector((state) => state.CustomerRetention);

  return (
    <div className={"profileContainer"}>
      <div style={{ position: "relative", display: "inline-block" }} onClick={onToggle}>
        <IconButton
          //onClick={}
          aria-label="Toggle Notifications"
          className={"NavbarButtonIcon cursorPointer"}
        >
          <Icon glyph="Bell" />
        </IconButton>
        {nextBestActions.length > 0 && (
          <div className="cursorPointer" style={{ position: "absolute", top: "-8px", right: "-8px" }}>
            <Badge
              variant="red"
              style={{ backgroundColor: "#dc2626", color: "white" }}
            >
              {nextBestActions.length}
            </Badge>
          </div>
        )}
      </div>
      {isMenuOpened && (
        <div className={"profilePopup notificationsPopup"}>
          <div className="d-flex flex-row align-items-center">
            <Icon size={"xlarge"} glyph="Bell" className="me-3" />
            <div onClick={() => console.log("selectedUser: ", selectedUser)}>
              <p className={"textMyProfile"}>Notifications</p>
              <small>Next Best Actions</small>
            </div>
          </div>
          <ListGroup className="scroll-list">
            {nextBestActions.map((action, index) => (
              <ListGroup.Item
                className={"p-0"}
                key={`notification-item-${index}`}
              >
                <NotificationItem item={action} />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default Notifications;
