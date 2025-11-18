'use client';
import FeatureListener from './FeatureListener';

export default function AppFeatureWrapper({ children }) {
  return (
    <>
      {children}
      <FeatureListener />
    </>
  );
}
