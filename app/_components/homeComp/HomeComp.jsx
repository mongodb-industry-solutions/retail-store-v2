
"use client"

import Banner from "../banner/Banner";
import PersonalizedRecommendationsContainer from "../personalizedRecommendations/PersonalizedRecommendationsContainer";
import React, { useState } from 'react';



const HomeComp = () => {


  return (
    <div>
      <Banner />
      <PersonalizedRecommendationsContainer/>
    </div>
  );
};


export default HomeComp;
