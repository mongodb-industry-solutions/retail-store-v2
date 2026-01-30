import Card from "@leafygreen-ui/card";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import SectionHeader from "./SectionHeader";
import { COLLECTIONS } from "@/lib/constants";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import { getBehaviorConfig } from "@/lib/helpers";
import useAutoScroll from "@/hooks/useAutoScroll";
import {
  pushCustomerBehaviourItem,
  setCustomerBehaviour,
} from "@/redux/slices/CustomerRetentionSlice";
import { fetchCustomerBehaviours } from "@/lib/api";

const BehaviourLogs = () => {
  const [openLogId, setOpenLogId] = useState(null);
  const dispatch = useDispatch();
  const {
    initialFetch,
    isLoading,
    data: customerBehaviour,
  } = useSelector((state) => state.CustomerRetention.customerBehaviour);
  const selectedUser = useSelector((state) => state.User.selectedUser);
  const { containerRef } = useAutoScroll(customerBehaviour);
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
      // Here you can update the customer behaviour data based on the received events
      if (data.operationType === "insert") {
        // Add the new document to the existing customerBehaviour array
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

  useEffect(() => {
    if (!initialFetch && !isLoading && selectedUser) {
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
  }, [initialFetch, isLoading, selectedUser, dispatch]);

  // SSE connection for real-time updates
  useEffect(() => {
    if (selectedUser) {
      const eventSource = listenToSSEUpdates();
      return () => {
        if (eventSource) {
          eventSource.close();
          console.log("SSE connection closed - customer behaviour.");
        }
      };
    }
  }, [listenToSSEUpdates, selectedUser]);

  const LogItem = ({ log }) => {
    const isOpen = openLogId === log._id;
    const toggleDocument = () => {
      setOpenLogId(isOpen ? null : log._id);
    };

    const behaviorConfig = getBehaviorConfig(log.signal);

    return (
      <div className="log-item blue" key={`log-${log._id}`}>
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex align-items-center">
            <div
              style={{
                backgroundColor: behaviorConfig.color,
                borderRadius: "50%",
                padding: "6px",
                marginRight: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                glyph={behaviorConfig.icon}
                size="small"
                style={{ color: "white" }}
              />
            </div>
            <div>
              <p
                className="m-0"
                style={{ fontWeight: 600, fontSize: "14px", color: "#1976D2" }}
              >
                {behaviorConfig.label}
              </p>
              <p
                className="m-0"
                style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}
              >
                {new Date(log?.ts).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <IconButton onClick={toggleDocument} aria-label="Toggle Document">
            <Icon glyph="CurlyBraces" size="small" />
          </IconButton>
        </div>
        {isOpen && (
          <pre className="log-document" style={{ marginTop: "12px" }}>
            {JSON.stringify(log, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-2">
      <SectionHeader
        title="2. Customer behaviour signals"
        amount={customerBehaviour.length.toString()}
        learnMoreElement={
          <p className="m-0">
            <a
              href="https://www.mongodb.com/atlas/stream-processing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Atlas Stream Processing (ASP)
            </a>{" "}
             process the real-time events from step 1 and extracts information from them as they arrive. It identifies patterns in the session and generates the below customer
            behaviour signals.
          </p>
        }
      />
      <div className="list-container" ref={containerRef}>
        {customerBehaviour.map((log) => (
          <LogItem key={`log-${log._id}`} log={log} />
        ))}
      </div>
    </Card>
  );
};

export default BehaviourLogs;
