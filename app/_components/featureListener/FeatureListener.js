'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setFeature } from '@/redux/slices/GlobalSlice';
import { FEATURES } from '@/lib/constants';
import { setIsCustomerRetentionEnabled } from '@/redux/slices/CustomerRetentionSlice';

export default function FeatureListener() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const featureInStore = useSelector((state) => state.Global.feature);

  useEffect(() => {
    const featureParam = searchParams.get('feature') || null;
    console.log('🛠 FeatureListener read feature param:', featureParam); // <-- debug  


    if (featureParam !== featureInStore) {
      dispatch(setFeature({feature: featureParam}));
      console.log('🛠 FeatureListener dispatched setFeature:', featureParam);  
    }
    dispatch(setIsCustomerRetentionEnabled({ isCustomerRetentionEnabled: featureParam === FEATURES.CUSTOMER_RETENTION }) );
  }, [searchParams.toString(), pathname]);

  return null; // no UI, just listener
}
