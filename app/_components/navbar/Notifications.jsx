import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import Link from "next/link";
import React, { useState } from "react";
import ListGroup from 'react-bootstrap/ListGroup';

const Notifications = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);

  const toggleProfile = () => {
    setProfileOpen(!isProfileOpen);
  };
  
  return (
    <div>
      <IconButton onClick={toggleProfile} aria-label="Toggle Notifications">
        <Icon glyph="Bell" />
      </IconButton>
      {isProfileOpen && (
        <div className={'profilePopup'}>
          <ListGroup>

            <ListGroup.Item className={'listGroupItem'}>
              <Link href="/orders">
                <div className="d-flex flex-row">
                  <img
                    src="/rsc/icons/file-lines-solid.svg"
                    alt="Logo"
                    width={15}
                    className="me-1"
                  />
                  <p>My Orders</p>
                </div>
              </Link>
            </ListGroup.Item>
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default Notifications;
