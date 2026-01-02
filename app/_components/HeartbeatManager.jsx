'use client'

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '@/redux/slices/eventsSlice';
import { generateTimeSeriesEvent } from '@/lib/helpers';

const HeartbeatManager = () => {
  const dispatch = useDispatch();
  const selectedUser = useSelector(state => state.User.selectedUser);
  const feature = useSelector(state => state.Global.feature);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Only start timer if we have a selected user AND feature is customerRetention
    if (!selectedUser || !selectedUser._id || feature !== 'customerRetention') {
      setIsStreaming(false);
      return;
    }

    const userId = selectedUser._id;
    // Generate a session ID if not available
    const sessionId = sessionStorage.getItem('sessionId') || 
      (() => {
        const newSessionId = Date.now().toString();
        sessionStorage.setItem('sessionId', newSessionId);
        return newSessionId;
      })();

    setIsStreaming(true);

    const startHeartbeat = () => {
      const intervalId = setInterval(() => {
        const payload = generateTimeSeriesEvent(userId, sessionId, 'heartbeat', {
          userEmail: selectedUser.email,
          userName: selectedUser.name
        });

        dispatch(sendEvent(payload));
      }, 10000); // 10 seconds

      return intervalId;
    };

    const intervalId = startHeartbeat();

    // Cleanup function
    return () => {
      setIsStreaming(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dispatch, selectedUser, feature]);

  // Return streaming indicator UI
  return isStreaming ? (
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
          backgroundColor: '#00ff00',
          borderRadius: '50%',
          animation: 'heartbeatBlink 1s infinite'
        }}
      />
      <span>Tracking behaviour</span>
      <style jsx>{`
        @keyframes heartbeatBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  ) : null;
};

export default HeartbeatManager;