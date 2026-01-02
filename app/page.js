"use client"


import React from 'react';

import "./fonts.css";
import Navbar from "./_components/navbar/Navbar";
import HomeComp from "./_components/homeComp/HomeComp";

export default function Home() {

  return (
    <>
      <Navbar></Navbar>
      <HomeComp></HomeComp>
    </>
  )
}
