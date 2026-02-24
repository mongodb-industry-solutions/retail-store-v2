import Card from "@leafygreen-ui/card";
import React from "react";
import SectionHeader from "./SectionHeader";
import { useSelector, useDispatch } from "react-redux";
import { getSessionAndUserId } from "@/lib/helpers";
import { setSessionState } from "@/redux/slices/CustomerRetentionSlice";
import Code from "@leafygreen-ui/code";
import { COLLECTIONS } from "@/lib/constants";

const SessionState = () => {
  const dispatch = useDispatch();
  const { uid, sid } = getSessionAndUserId();
  const sessionState = useSelector(
    (state) => state.CustomerRetention?.sessionState || null
  );

  React.useEffect(() => {
    if (!uid || !sid) return;
    const sessionId = { current: sid };
    const url = `/api/sse?sessionId=${sessionId.current}&colName=${COLLECTIONS.SESSION_STATE}&uid=${uid}&sid=${sid}`;
    const eventSource = new window.EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.operationType === "insert" || data.operationType === "update") {
          if (data.fullDocument) {
            dispatch(setSessionState(data.fullDocument));
          }
        }
      } catch (err) {
        // Optionally handle error
      }
    };

    return () => {
      eventSource.close();
    };
  }, [uid, sid, dispatch]);

  return (
    <Card className="mt-2 SessionState">
      <SectionHeader
        title="Session State"
        subtitle={null}
        amount={null}
        learnMoreElement={
          <p className="m-0">
            This is the session state document managed by the first{" "}
            <a
              href="https://www.mongodb.com/atlas/stream-processing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Atlas Stream Processing (ASP)
            </a>
            , it gets updated every 10 seconds.
          </p>
        }
      />
      <div>
        <Code language="javascript" expandable>
          {JSON.stringify(sessionState, null, 2)}
        </Code>
      </div>
    </Card>
  );
};

export default SessionState;
