import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import Badge from "@leafygreen-ui/badge";
import React, { useEffect, useCallback, useRef } from 'react'
import { COLLECTIONS } from '@/lib/constants'
import { v4 as uuidv4 } from 'uuid'
import { getSessionAndUserId } from '@/lib/helpers'

import ListGroup from "react-bootstrap/ListGroup";
import { useSelector, useDispatch } from 'react-redux'
import NotificationItem from "./NotificationItem";
import { fetchNextBestActions } from "@/lib/api";
import { pushNextBestActionItem, setNextBestActions } from "@/redux/slices/CustomerRetentionSlice";

const Notifications = ({ isMenuOpened, onToggle }) => {
  const {initialFetch, isLoading, data: nextBestActions} = useSelector(state => state.CustomerRetention.nextBestActions);
    const dispatch = useDispatch();

  const sseConnection = useRef(null);
  const changeStreamSessionID = useRef(uuidv4());
  const selectedUser = useSelector(state => state.User.selectedUser);


  const listenToSSEUpdates = useCallback(() => {
    const { sid, uid } = getSessionAndUserId();
    
    if (!sid || !uid) {
      console.warn('Missing sessionId or userId for SSE connection');
      return null;
    }

    console.log("listenToSSEUpdates func - sessionId:", sid, "userId:", uid);
    const eventSource = new EventSource(
      `/api/sse?sessionId=${changeStreamSessionID.current}&colName=${COLLECTIONS.NEXT_BEST_ACTIONS}&uid=${uid}&sid=${sid}`
    );
    
    eventSource.onopen = () => {
      console.log("SSE connection opened for next best actions events.");
    };
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received SSE Update on Next Best Actions:", data);
      if (data.operationType === "insert") {
        const newDocument = data.fullDocument;
        if (newDocument) {
          console.log("Received new next best action document:", newDocument);
          dispatch(pushNextBestActionItem(newDocument));
        }
      }
    };
    
    eventSource.onerror = (event) => {
      console.error("SSE Error for next best actions:", event);
    };
    
    // Close the previous connection if it exists
    if (sseConnection.current) {
      sseConnection.current.close();
      console.log("Previous SSE connection closed - next best actions.");
    }

    sseConnection.current = eventSource;
    return eventSource;
  }, [selectedUser, dispatch]);

  useEffect(() => {
    if(!initialFetch && !isLoading && selectedUser){        
      dispatch(setNextBestActions({initialFetch: true, isLoading: true}));
      fetchNextBestActions()
        .then(response => {
          dispatch(setNextBestActions({isLoading: false, data: response}));
        })
        .catch(error => {
          console.error('Error fetching next best actions:', error);
          dispatch(setNextBestActions({isLoading: false, data: []}));
        });
    }
  }, [initialFetch, isLoading, selectedUser, dispatch])

    // SSE connection for real-time updates
  useEffect(() => {
    if (selectedUser) {
      const eventSource = listenToSSEUpdates();
      return () => {
        if (eventSource) {
          eventSource.close();
          console.log("SSE connection closed - next best actions.");
        }
      };
    }
  }, [listenToSSEUpdates, selectedUser]);
  

  return (
    <div className={"profileContainer"}>
      <div style={{ position: "relative", display: "inline-block" }} onClick={onToggle}>
        <IconButton
          //onClick={}
          aria-label="Toggle Notifications"
          className={"NavbarButtonIcon cursorPointer"}
        >
          <Icon glyph="Bell" />
        </IconButton>
        {nextBestActions.length > 0 && (
          <div className="cursorPointer" style={{ position: "absolute", top: "-8px", right: "-8px" }}>
            <Badge
              variant="red"
              style={{ backgroundColor: "#dc2626", color: "white" }}
            >
              {nextBestActions.length}
            </Badge>
          </div>
        )}
      </div>
      {isMenuOpened && (
        <div className={"profilePopup notificationsPopup"}>
          <div className="d-flex flex-row align-items-center">
            <Icon size={"xlarge"} glyph="Bell" className="me-3" />
            <div onClick={() => console.log("selectedUser: ", selectedUser)}>
              <p className={"textMyProfile"}>Notifications</p>
              <small>Next Best Actions</small>
            </div>
          </div>
          <ListGroup className="scroll-list">
            {nextBestActions.map((action, index) => (
              <ListGroup.Item
                className={"p-0"}
                key={`notification-item-${index}`}
              >
                <NotificationItem item={action} />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default Notifications;
