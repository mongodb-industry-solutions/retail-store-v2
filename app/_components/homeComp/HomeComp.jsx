
"use client"

import Banner from "../banner/Banner";
import PersonalizedRecommendationsContainer from "../personalizedRecommendations/PersonalizedRecommendationsContainer";
import React, { useState } from 'react';
import ProductDetailsModal from "../productDetailsModal/ProductDetailsModal";

const HomeComp = () => {

  return (
    <div>
      <Banner />
      <PersonalizedRecommendationsContainer/>
      <ProductDetailsModal/>
    </div>
  );
};


export default HomeComp;
