"use client";
import React, { useState } from "react";

import "./shop.css";
import Navbar from "../_components/navbar/Navbar";
import ProductList from "../_components/productList/ProductList";
import ProductDetailsModal from "../_components/productDetailsModal/ProductDetailsModal";
import SearchBar from "../_components/searchBar/SearchBar";
import InfoWizard from "../_components/InfoWizard/InfoWizard";
import { DisplayMode, DrawerLayout } from "@leafygreen-ui/drawer";
import { useDispatch, useSelector } from "react-redux";
import { setIsDrawerOpen } from "@/redux/slices/CustomerRetentionSlice";
import CustomerRetentionContainer from "../_components/customerRetention/CustomerRetentionContainer";

export default function Page() {
  const dispatch = useDispatch();
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const { isDrawerOpen } = useSelector(state => state.CustomerRetention)
  const tabs = [
    {
      heading: "How to demo",
      content: <></>,
    },
    {
      heading: "Behind the scenes",
      content: <></>,
    },
    {
      heading: "Why MongoDB?",
      content: <></>,
    },
  ];
  return (
      <DrawerLayout
        className="drawer-layout"
        displayMode={DisplayMode.Embedded}
        isDrawerOpen={isDrawerOpen}
        drawer={ <CustomerRetentionContainer /> }
        onClose={() => dispatch(setIsDrawerOpen(false))}
      >
        <main>
          <Navbar />
          <div className="container mx-auto px-4 my-4 d-flex justify-content-between">
            <SearchBar />
            <InfoWizard
              open={openHelpModal}
              setOpen={setOpenHelpModal}
              tooltipText="Talk track!"
              iconGlyph="Wizard"
              tabs={tabs}
              openModalIsButton={true}
            />
          </div>
          <div className="container mx-auto px-4">
            <ProductList />
          </div>
          <ProductDetailsModal />
        </main>
      </DrawerLayout>
  );
}
