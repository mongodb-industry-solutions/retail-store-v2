import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendEvent } from '@/redux/slices/eventsSlice';
import { generateTimeSeriesEvent } from '@/lib/helpers';
import { FEATURES } from '@/lib/constants';

/**
 * Custom hook for tracking customer retention events
 * Only sends events when feature is CUSTOMER_RETENTION and user is selected
 * 
 * @returns {Function} trackEvent - Function to track events with type and metadata
 */
const useCustomerRetentionTracking = () => {
  const dispatch = useDispatch();
  const selectedUser = useSelector(state => state.User.selectedUser);
  const feature = useSelector(state => state.Global.feature);

  const trackEvent = useCallback((eventType, metadata = {}) => {
    // Only track if feature is customer retention and user is selected
    if (feature !== FEATURES.CUSTOMER_RETENTION || !selectedUser || !selectedUser._id) {
      return;
    }

    // Get or generate session ID
    const sessionId = sessionStorage.getItem('sessionId') || 
      (() => {
        const newSessionId = Date.now().toString();
        sessionStorage.setItem('sessionId', newSessionId);
        return newSessionId;
      })();

    // Generate and dispatch event
    const payload = generateTimeSeriesEvent(
      selectedUser._id, 
      sessionId, 
      eventType, 
      metadata
    );
    
    dispatch(sendEvent(payload));
  }, [dispatch, selectedUser, feature]);

  return trackEvent;
};

export default useCustomerRetentionTracking;