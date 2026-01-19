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

    // Generate and dispatch event (userId/sessionId handled internally)
    const payload = generateTimeSeriesEvent(
      eventType, 
      metadata
    );
    
    // payload will be null if user/session validation fails internally
    if (payload) {
      dispatch(sendEvent(payload));
    }
  }, [dispatch, selectedUser, feature]);

  return trackEvent;
};

export default useCustomerRetentionTracking;