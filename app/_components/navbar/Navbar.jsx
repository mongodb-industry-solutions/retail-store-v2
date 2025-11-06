"use client";
import React, { useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";

import Link from "next/link";
import "./navbar.css";
import Image from "next/image";
import Profile from "./Profile";
import { Container } from "react-bootstrap";
import {
  getLastBoughtProducts,
  handleNewRecommendationsForUser,
} from "@/lib/helpers";
import { setSelectedUserLastBoughtProducts } from "@/redux/slices/UserSlice";
import { setIsDrawerOpen } from "@/redux/slices/CustomerRetentionSlice";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import Notifications from "./Notifications";

const Navbar = () => {
  const dispatch = useDispatch();
  const sseConnection = useRef(null);
  const sessionId = useRef(uuidv4());
  const ordersLoaded = useSelector((state) => state.User.orders?.initialLoad);
  const userId = useSelector((state) => state.User.selectedUser?._id);
  const isDrawerOpen = useSelector((state) => state.CustomerRetention.isDrawerOpen);
  const pathname = usePathname();

  const listenToSSEUpdates = useCallback(() => {
    console.log("listenToSSEUpdates func: ", userId);
    const collection = "users";
    const eventSource = new EventSource(
      `/api/sse?sessionId=${sessionId.current}&colName=${collection}&_id=${userId}`
    );
    eventSource.onopen = () => {
      console.log("SSE connection opened.");
      // Save the SSE connection reference in the state
    };
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received SSE Update on User:", data);
      if (data.fullDocument.version != 2) return;
      if (data.operationType === "update")
        handleNewRecommendationsForUser(
          data.fullDocument.lastRecommendations || []
        );
    };
    eventSource.onerror = (event) => {
      console.error("SSE Error:", event);
    };
    // Close the previous connection if it exists
    if (sseConnection.current) {
      sseConnection.current.close();
      console.log("Previous SSE connection closed - dashboard.");
    }

    sseConnection.current = eventSource;
    return eventSource;
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const eventSource = listenToSSEUpdates();
      return () => {
        if (eventSource) {
          eventSource.close();
          console.log("SSE connection closed.");
        }
      };
    }
  }, [listenToSSEUpdates, userId]);

  useEffect(() => {
    if (userId && ordersLoaded == true) {
      let lbp = getLastBoughtProducts(20);
      dispatch(setSelectedUserLastBoughtProducts(lbp));
    }
  }, [userId, ordersLoaded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sseConnection.current) {
        console.info("Closing SSE connection before unloading the page.");
        sseConnection.current.close();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sseConnection]);

  return (
    <nav className={'navbar'}>
      <Container className="d-flex justify-content-between">
        <div className={'logo'}>
          <Link href="/">
            <Image
              src="/leafyLogo.png"
              alt="MongoDB logo"
              width={150}
              height={40}
            ></Image>
          </Link>
        </div>

        <div className={'links'}>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/about">About</Link>
        </div>
        <div className={'iconButtons'}>
          <Notifications />
          {pathname === "/shop" && (
            <IconButton
              className={'profileIcon'}
              onClick={() => dispatch(setIsDrawerOpen(!isDrawerOpen))}
              aria-label="Toggle Profile"
            >
              <Icon glyph={isDrawerOpen?"NavCollapse":"NavExpand"} />
            </IconButton>
          )}
          <Profile />
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;
