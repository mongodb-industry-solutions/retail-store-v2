'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '@/redux/slices/eventsSlice';
import { generateTimeSeriesEvent, getSessionAndUserId } from '@/lib/helpers';
import { EVENT_STREAMS_TYPES, HEARTBEAT_INTERVAL_MS, INACTIVITY_TIMEOUT_MS, FEATURES, DEVELOPMENT } from '@/lib/constants';
import './heartbeatManager.css';

const HeartbeatManager = () => {
  const dispatch = useDispatch();
  const selectedUser = useSelector(state => state.User.selectedUser);
  const feature = useSelector(state => state.Global.feature);
  
  // Initialize with default values and let useEffect handle the actual initialization
  const [isStreaming, setIsStreaming] = useState(false);
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const heartbeatIntervalRef = useRef(null);
  const inactivityTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset inactivity timer on user activity
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    // Only set new timeout if streaming and not paused
    if (isStreaming && !isPaused) {
      inactivityTimeoutRef.current = setTimeout(() => {
        // Pause heartbeat and show alert
        setIsPaused(true);
        setShowInactivityAlert(true);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isStreaming, isPaused]);

  // Activity event listeners
  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetInactivityTimer]);

  // Handle user confirmation that they're still there
  const handleStillThere = () => {
    setShowInactivityAlert(false);
    setIsPaused(false);
    resetInactivityTimer();
    
    // Restart heartbeat if we have valid user and feature
    if (selectedUser && selectedUser._id && feature === FEATURES.CUSTOMER_RETENTION) {
      startHeartbeat();
    }
  };

  const startHeartbeat = useCallback(() => {
    // Clear existing interval first
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    const { sid, uid } = getSessionAndUserId();
    
    if (!uid) {
      console.warn('Cannot start heartbeat: no user ID available');
      return;
    }

    heartbeatIntervalRef.current = setInterval(() => {
      const payload = generateTimeSeriesEvent(EVENT_STREAMS_TYPES.HEARTBEAT, {});
      dispatch(sendEvent(payload));
    }, HEARTBEAT_INTERVAL_MS);
  }, [dispatch, selectedUser]);

  // Effect to handle user/feature changes
  useEffect(() => {
    const shouldStream = selectedUser && selectedUser._id && feature === FEATURES.CUSTOMER_RETENTION;
    
    if (shouldStream && !isStreaming) {
      // Start streaming
      setIsStreaming(true);
      setIsPaused(false);
    } else if (!shouldStream && isStreaming) {
      // Stop streaming
      setIsStreaming(false);
      setIsPaused(true);
      // Clear any existing intervals/timeouts
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    }
  }, [selectedUser, feature, isStreaming]);

  // Effect to start/stop heartbeat based on streaming state
  useEffect(() => {
    if (isStreaming && !isPaused) {
      startHeartbeat();
      resetInactivityTimer();
    } else {
      // Clear intervals when not streaming or paused
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    }

    return () => {
      // Cleanup on unmount
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
  }, [isStreaming, isPaused, startHeartbeat, resetInactivityTimer]);

  // Return streaming indicator UI and inactivity alert
  return (
    <>
      <div className="heartbeat-status">
        <div 
          className={`heartbeat-indicator ${
            isStreaming && !isPaused 
              ? 'heartbeat-indicator--active' 
              : 'heartbeat-indicator--inactive'
          }`}
        />
        <span>{isStreaming && !isPaused ? 'Tracking behaviour' : 'Stopped tracking'}</span>
      </div>
      
      {showInactivityAlert && (
        <div className="inactivity-overlay">
          <div className="inactivity-modal">
            <h3 className="inactivity-modal__title">
              Are you still there?
            </h3>
            <p className="inactivity-modal__text">
              We noticed you've been inactive. Would you like to continue tracking your behavior?
            </p>
            <div className="inactivity-modal__buttons">
              <button
                onClick={handleStillThere}
                className="inactivity-button inactivity-button--primary"
              >
                Yes, continue tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeartbeatManager;