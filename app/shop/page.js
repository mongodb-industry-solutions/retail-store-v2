"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import "./shop.css";
import Navbar from "../_components/navbar/Navbar";
import ProductList from "../_components/productList/ProductList";
import ProductDetailsModal from "../_components/productDetailsModal/ProductDetailsModal";
import SearchBar from "../_components/searchBar/SearchBar";
import InfoWizard from "../_components/InfoWizard/InfoWizard";
import { DisplayMode, DrawerLayout } from "@leafygreen-ui/drawer";
import { useDispatch, useSelector } from "react-redux";
import { setIsDrawerOpen, pushCustomerBehaviourItem, setCustomerBehaviour } from "@/redux/slices/CustomerRetentionSlice";
import { COLLECTIONS } from "@/lib/constants";
import { fetchCustomerBehaviours } from "@/lib/api";
import CustomerRetentionContainer from "../_components/customerRetention/CustomerRetentionContainer";
import ShopTalkTrackNoEvents from "../_components/customerRetention/talkTracks/shopTalkTrackNoEvents";
import ShopTalkTrackCustomerRetention from "../_components/customerRetention/talkTracks/ShopTalkTrackCustomerRetention";

export default function Page() {
  const dispatch = useDispatch();
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const { isDrawerOpen, isCustomerRetentionEnabled } = useSelector(state => state.CustomerRetention);
  const { initialFetch, isLoading } = useSelector(state => state.CustomerRetention.customerBehaviour);
  const selectedUser = useSelector(state => state.User.selectedUser);
  const sseConnection = useRef(null);
  const changeStreamSessionID = useRef(uuidv4());

  const listenToSSEUpdates = useCallback(() => {
    const sid = sessionStorage.getItem("sid");
    const uid = selectedUser?._id;

    if (!sid || !uid) {
      console.warn("Missing sid or uid for SSE connection");
      return null;
    }

    console.log("listenToSSEUpdates func - sid:", sid, "uid:", uid);
    const eventSource = new EventSource(
      `/api/sse?sessionId=${changeStreamSessionID.current}&colName=${COLLECTIONS.CUSTOMER_BEHAVIOUR}&uid=${uid}&sid=${sid}`
    );

    eventSource.onopen = () => {
      console.log("SSE connection opened for customer behaviour events.");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received SSE Update on Events:", data);
      if (data.operationType === "insert") {
        const newDocument = data.fullDocument;
        if (newDocument) {
          console.log("Received new customer behaviour document:", newDocument);
          dispatch(pushCustomerBehaviourItem(newDocument));
        }
      }
    };

    eventSource.onerror = (event) => {
      console.error("SSE Error for customer behaviour:", event);
    };

    // Close the previous connection if it exists
    if (sseConnection.current) {
      sseConnection.current.close();
      console.log("Previous SSE connection closed - customer behaviour.");
    }

    sseConnection.current = eventSource;
    return eventSource;
  }, [selectedUser, dispatch]);

  // Fetch initial customer behaviours
  useEffect(() => {
    if (!initialFetch && !isLoading && selectedUser && isCustomerRetentionEnabled) {
      dispatch(setCustomerBehaviour({ initialFetch: true, isLoading: true }));
      fetchCustomerBehaviours()
        .then((response) => {
          dispatch(setCustomerBehaviour({ isLoading: false, data: response }));
        })
        .catch((error) => {
          console.error("Error fetching customer behaviours:", error);
          dispatch(setCustomerBehaviour({ isLoading: false, data: [] }));
        });
    }
  }, [initialFetch, isLoading, selectedUser, isCustomerRetentionEnabled, dispatch]);

  // SSE connection for real-time updates
  useEffect(() => {
    if (selectedUser && isCustomerRetentionEnabled) {
      const eventSource = listenToSSEUpdates();
      return () => {
        if (eventSource) {
          eventSource.close();
          console.log("SSE connection closed - customer behaviour.");
        }
      };
    }
  }, [listenToSSEUpdates, selectedUser, isCustomerRetentionEnabled]);

  // Hide scrollbar on shop page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const tabs = [
    {
      heading: "How to demo",
      content: <><ShopTalkTrackNoEvents/></>,
    }
  ];
  const tabsCustomerRetention = [
    {
      heading: "How to demo",
      content: <ShopTalkTrackCustomerRetention section={1}/>,
    },
    {
      heading: "Behind the scenes",
      content: <ShopTalkTrackCustomerRetention section={2}/>,
    },
    {
      heading: "Customer Retention",
      content: <ShopTalkTrackCustomerRetention section={3}/>,
    },
    {
      heading: "Why MongoDB?",
      content: <ShopTalkTrackCustomerRetention section={4}/>,
    },
  ];

  if(!isCustomerRetentionEnabled){
    return <main>
          <Navbar />
          <div className="container mx-auto px-4 my-4 d-flex justify-content-between">
            <SearchBar />
            <InfoWizard
              open={openHelpModal}
              setOpen={setOpenHelpModal}
              tooltipText="Learn More!"
              iconGlyph="Wizard"
              tabs={ tabs }
              openModalIsButton={true}
            />
          </div>
          <div className="ProductListContainer container mx-auto px-4">
            <ProductList />
          </div>
          <ProductDetailsModal />
        </main>
  }
  return (
      <DrawerLayout
        className="drawer-layout"
        displayMode={DisplayMode.Embedded}
        isDrawerOpen={isDrawerOpen}
        drawer={ <CustomerRetentionContainer /> }
        onClose={() => dispatch(setIsDrawerOpen(false))}
        size="large"
      >
        <main>
          <Navbar />
          <div className="container mx-auto px-4 my-4 d-flex justify-content-between">
            <SearchBar />
            <InfoWizard
              open={openHelpModal}
              setOpen={setOpenHelpModal}
              tooltipText="Learn More!"
              iconGlyph="Wizard"
              tabs={tabsCustomerRetention}
              openModalIsButton={true}
            />
          </div>
          <div className="ProductListContainer container mx-auto px-4 mb-4">
            <ProductList />
          </div>
          <ProductDetailsModal/>
        </main>
      </DrawerLayout>
  );
}
