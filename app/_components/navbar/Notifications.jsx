import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import Badge from "@leafygreen-ui/badge";
import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useSelector } from "react-redux";
import Button from "@leafygreen-ui/button";
import NotificationItem from "./NotificationItem";

const Notifications = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const { nextBestActions } = useSelector((state) => state.CustomerRetention);

  const toggleProfile = () => {
    setProfileOpen(!isProfileOpen);
  };

  return (
    <div className={"profileContainer"}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <IconButton
          onClick={toggleProfile}
          aria-label="Toggle Notifications"
          className={"NavbarButtonIcon"}
        >
          <Icon glyph="Bell" />
        </IconButton>
        {nextBestActions.length > 0 && (
          <div style={{ position: "absolute", top: "-8px", right: "-8px" }}>
            <Badge
              variant="red"
              style={{ backgroundColor: "#dc2626", color: "white" }}
            >
              {nextBestActions.length}
            </Badge>
          </div>
        )}
      </div>
      {isProfileOpen && (
        <div className={"profilePopup notificationsPopup"}>
          <ListGroup>
            <ListGroup.Item className={""}>
              <div className="d-flex flex-row align-items-center">
                <Icon size={'xlarge'} glyph="Bell" />
                <div  onClick={() => console.log("selectedUser: ", selectedUser)}>
                  <p className={"textMyProfile"}>Notifications</p>
                  <small>
                    Next Best Actions
                  </small>
                </div>
              </div>

            </ListGroup.Item>
            {nextBestActions.map((action, index) => (
              <ListGroup.Item className={""}>
                <NotificationItem></NotificationItem>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default Notifications;
