'use client';  
  
import React from 'react';  
import DemoTiles from '../_components/demoTiles/DemoTiles';
import FeatureListener from '../_components/featureListener/FeatureListener';  
  
export default function TilePage() {  
  return (  
    <>  
      <FeatureListener />  
        
      <h1 style={{ textAlign: 'center', marginTop: '40px' }}>Tile Demo Page</h1>  
      <p style={{ textAlign: 'center' }}>Click a tile to start an experience:</p>  
  
      <DemoTiles />  
    </>  
  );  
}  
