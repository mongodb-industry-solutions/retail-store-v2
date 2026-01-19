import React from "react";
import Icon from "@leafygreen-ui/icon";
import { EVENT_STREAMS_TYPES } from "@/lib/constants";
import useCustomerRetentionTracking from '@/hooks/useCustomerRetentionTracking';

const Logout = () => {
  const trackEvent = useCustomerRetentionTracking();

  const handleMouseEnter = () => {
    trackEvent(EVENT_STREAMS_TYPES.EXIT_RISK, {
      exitMethod: 'logout-hover'
    });
  };

  const handleLogoutClick = () => {
    // Reload the entire application with the same URL and parameters
    window.location.reload();
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter} 
      onClick={handleLogoutClick}
      className="d-flex flex-row"
      style={{ cursor: 'pointer' }}
    >
      <Icon glyph="LogOut" size="large" fill="red" />
      <p>Log out</p>
    </div>
  );
};

export default Logout;
