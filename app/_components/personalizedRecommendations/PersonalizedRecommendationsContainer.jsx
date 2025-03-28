import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from "uuid";
import { Container } from 'react-bootstrap'

import './personalizedRecommendations.css'
import PRList from './PRList';
import InfoWizard from '../InfoWizard/InfoWizard';
import { landingPagePersonalizedRecommendations } from '@/lib/talkTrack';
import { getLastBoughtProducts, handleNewRecommendationsForUser } from '@/lib/helpers';
import { setSelectedUserLastBoughtProducts } from '@/redux/slices/UserSlice';
// import { CardSkeleton } from '@leafygreen-ui/skeleton-loader';

const PersonalizedRecommendationsContainer = () => {
  const dispatch = useDispatch();
  const sseConnection = useRef(null);
  const sessionId = useRef(uuidv4());
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const userId = useSelector(state => state.User.selectedUser?._id)
  const lastRecommendations = useSelector(state => state.User.selectedUser?.lastRecommendations)
  const lastBoughtProducts = useSelector(state => state.User?.lastBoughtProducts)
  const ordersLoaded = useSelector(state => state.User.orders?.initialLoad)

  const listenToSSEUpdates = useCallback(() => {
    console.log('listenToSSEUpdates func: ', userId)
    const collection = "users";
    const eventSource = new EventSource(
      `/api/sse?sessionId=${sessionId.current}&colName=${collection}&_id=${userId}`
    )
    eventSource.onopen = () => {
      console.log('SSE connection opened.')
      // Save the SSE connection reference in the state
    }
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received SSE Update on User:', data);
      if (data.fullDocument.version != 2)
        return
      if (data.operationType === 'update' )
        handleNewRecommendationsForUser(data.fullDocument.lastRecommendations || [])
    }
    eventSource.onerror = (event) => {
      console.error('SSE Error:', event);
    }
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
      let lbp = getLastBoughtProducts(20)
      dispatch(setSelectedUserLastBoughtProducts(lbp))
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
    <Container className='personalizedRecommendationsContainer'>
      <div className='d-flex flex-row-reverse w-100'>
        <InfoWizard
          open={openHelpModal}
          setOpen={setOpenHelpModal}
          tooltipText="Talk track!"
          iconGlyph="Wizard"
          sections={landingPagePersonalizedRecommendations}
          openModalIsButton={true}
        />
      </div>
      <PRList sections={[
        {
          id: 1,
          title: 'Based on your last order you might like',//'Because you bought X product',
          query: 'db.products.find({})',
          items: lastRecommendations || []
        },
        {
          id: 2,
          title: 'Buy again',
          query: 'db.products.find({})',
          items: lastBoughtProducts || []
          // ordersLoaded === false
          //   ? <CardSkeleton></CardSkeleton>
          //   : lastBoughtProducts || []
        }
      ]} />
    </Container>
  )
}

export default PersonalizedRecommendationsContainer