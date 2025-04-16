import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from "uuid";
import { Container } from 'react-bootstrap'
import Code from '@leafygreen-ui/code';
import { Tab, Tabs } from '@leafygreen-ui/tabs';
import { H2, H3 } from '@leafygreen-ui/typography';

import './personalizedRecommendations.css'
import PRList from './PRList';
import InfoWizard from '../InfoWizard/InfoWizard';
import { landingPagePersonalizedRecommendations } from '@/lib/talkTrack';
import { getLastBoughtProducts, handleNewRecommendationsForUser } from '@/lib/helpers';
import { setSelectedUserLastBoughtProducts } from '@/redux/slices/UserSlice';

const PersonalizedRecommendationsContainer = () => {
  const dispatch = useDispatch();
  const sseConnection = useRef(null);
  const sessionId = useRef(uuidv4());
  const [openHelpModal, setOpenHelpModal] = useState(false);
  const userId = useSelector(state => state.User.selectedUser?._id)
  const lastRecommendations = useSelector(state => state.User.selectedUser?.lastRecommendations)
  const selectedUser = useSelector(state => state.User.selectedUser)
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
      if (data.operationType === 'update')
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
          addModal: true,
          modalContentTabs: [
            {
              heading: "Document",
              content: <Container className={` p-3 h-100`}>
                <H3 className='mb-2'>User document</H3>
                <Code language="javascript">{JSON.stringify(selectedUser, null, 2)}</Code>
              </Container>
            },
            {
              heading: "Understanding the document",
              content: <Container className={` p-3 h-100`}>
                <H3 className='mb-2 mt-2'>Understanding the document</H3>
                <p>
                  The <code>user.lastRecommendations</code> field contains the products that
                  the e-commerce recommends to this user based on their last order placed.
                </p>
                <p>
                  When a user makes a purchase a microservice is triggered to take the invoice
                  data and based on one of the items selected (i.e. the most expensive item of the invoice)
                  it performs an <a href='https://www.mongodb.com/products/platform/atlas-vector-search' target='_blank'>
                    Atlas Vector Search</a> query to retrieve similar products from the catalog.
                  The results are then embedded into the <code>user.lastRecommendations</code> field, this is known
                  as <a href='https://www.mongodb.com/blog/post/building-with-patterns-the-extended-reference-pattern'
                    target='_blank'>Extended Reference Pattern</a>.
                </p>
                <p>
                  Retailers can leverage this microservice to, in addition of keeping the lastRecommendations fresh on the user document,
                  insert last recommendations of this user in a different collection. That separate collection can be used for further 
                  analysis of this users preferences or enhancements of personalized marketing.
                </p>
              </Container>
            }
          ],
          items: lastRecommendations || []
        },
        {
          id: 2,
          title: 'Buy again',
          items: lastBoughtProducts || []
        }
      ]} />
    </Container >
  )
}

export default PersonalizedRecommendationsContainer