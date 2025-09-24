// app/_components/FeatureListener.js
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setFeature } from '@/redux/slices/GlobalSlice';

export default function FeatureListener() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const featureInStore = useSelector((state) => state.Global.feature);

  useEffect(() => {
    const featureParam = searchParams.get('feature') || null;

    if (featureParam !== featureInStore) {
      dispatch(setFeature({feature: featureParam}));
    }
  }, [searchParams.toString(), pathname]);

  return null; // no UI, just listener
}
