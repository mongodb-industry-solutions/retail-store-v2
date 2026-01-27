'use client'

import { useSelector } from 'react-redux';
import HeartbeatManager from './HeartbeatManager';
import { FEATURES } from '@/lib/constants';

const ConditionalHeartbeatManager = () => {
  const feature = useSelector(state => state.Global.feature);  
  
  // Only render HeartbeatManager when feature is CUSTOMER_RETENTION
  if (feature === FEATURES.CUSTOMER_RETENTION) {
    return <HeartbeatManager />;
  }
  
  return null;
};

export default ConditionalHeartbeatManager;