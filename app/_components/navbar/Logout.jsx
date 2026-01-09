import React from "react";
import Icon from "@leafygreen-ui/icon";
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '@/redux/slices/eventsSlice';
import { generateTimeSeriesEvent } from '@/lib/helpers';
import { EVENT_STREAMS_TYPES } from "@/lib/constants";

const Logout = () => {
  const dispatch = useDispatch();
  const selectedUser = useSelector(state => state.User.selectedUser);

  const handleMouseEnter = () => {
    if (selectedUser && selectedUser._id) {
      const sessionId = sessionStorage.getItem('sessionId') || Date.now().toString();
      const metadata = {
        exitMethod: 'logout-hover'
      };
      const payload = generateTimeSeriesEvent(
        selectedUser._id,
        sessionId,
        EVENT_STREAMS_TYPES.EXIT_INTENT,
        metadata
      );
      dispatch(sendEvent(payload));
    }
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
