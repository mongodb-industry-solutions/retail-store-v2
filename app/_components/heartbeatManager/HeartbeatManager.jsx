'use client'

import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '@/redux/slices/eventsSlice';
import { generateTimeSeriesEvent } from '@/lib/helpers';
import { EVENT_STREAMS_TYPES, HEARTBEAT_INTERVAL_MS, INACTIVITY_TIMEOUT_MS, FEATURES } from '@/lib/constants';

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

  // Handle user dismissal (stop tracking)
  const handleStopTracking = () => {
    setShowInactivityAlert(false);
    setIsPaused(true);
    setIsStreaming(false);
    
    // Clear all timers
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  };

  const startHeartbeat = useCallback(() => {
    // Clear existing interval first
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    const userId = selectedUser._id;
    const sessionId = sessionStorage.getItem('sessionId') || 
      (() => {
        const newSessionId = Date.now().toString();
        sessionStorage.setItem('sessionId', newSessionId);
        return newSessionId;
      })();

    heartbeatIntervalRef.current = setInterval(() => {
      const payload = generateTimeSeriesEvent(userId, sessionId, EVENT_STREAMS_TYPES.HEARTBEAT, {});
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
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}>
        <div 
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: isStreaming && !isPaused ? '#00ff00' : '#ff4444',
            borderRadius: '50%',
            animation: isStreaming && !isPaused ? 'heartbeatBlink 1s infinite' : 'none'
          }}
        />
        <span>{isStreaming && !isPaused ? 'Tracking behaviour' : 'Stopped tracking'}</span>
        <style jsx>{`
          @keyframes heartbeatBlink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}</style>
      </div>
      
      {showInactivityAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '20px'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0',
              fontSize: '24px',
              color: '#333'
            }}>
              Are you still there?
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.5'
            }}>
              We noticed you've been inactive. Would you like to continue tracking your behavior?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleStillThere}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Yes, continue tracking
              </button>
              <button
                onClick={handleStopTracking}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#545b62'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Stop tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeartbeatManager;