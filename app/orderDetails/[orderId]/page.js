"use client"; // app/order-details/[id]/page.js

import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { H1, H3 } from "@leafygreen-ui/typography";
import Banner from "@leafygreen-ui/banner";
import { Container } from "react-bootstrap";
import Badge from "@leafygreen-ui/badge";
import Button from "@leafygreen-ui/button";
import Icon from "@leafygreen-ui/icon";
import Card from "@leafygreen-ui/card";
import Stepper, { Step } from "@leafygreen-ui/stepper";
import { CardSkeleton, Skeleton } from "@leafygreen-ui/skeleton-loader";
import { v4 as uuidv4 } from "uuid";
import styles from "../orderDetails.module.css";
import Footer from "@/app/_components/footer/Footer";
import Navbar from "@/app/_components/navbar/Navbar";
import CartItem from "@/app/_components/cart/CartItem";
import { handleChangeInOrders, prettifyDateFormat } from "@/lib/helpers";
import {
  addOrderStatusHistory,
  fetchInvoice,
  fetchOrderDetails,
} from "@/lib/api";
import { setLoading, setOrder } from "@/redux/slices/OrderSlice";
import { shippingMethods } from "@/lib/constants";
import ShippingMethodBadgeComp from "@/app/_components/shippingMethodBadgeComp/ShippingMethodBadgeComp";
import { orderDetailsPage } from "@/lib/talkTrack";
import TalkTrackContainer from "@/app/_components/talkTrackContainer/talkTrackContainer";
import { setOpenedInvoice, fetchInvoiceUrl } from "@/redux/slices/InvoiceSlice";
import { GUIDE_CUE_MESSAGES, FEATURES } from "@/lib/constants";
import GuideCueContainer from "@/app/_components/guideCueContainer/GuideCuecontainer";

export default function OrderDetailsPage({ params }) {
  const dispatch = useDispatch();
  const sseConnection = useRef(null);
  const sessionId = useRef(uuidv4());
  const { orderId } = params;
  const orderDetails = useSelector((state) => state.Order);
  const feature = useSelector((state) => state.Global.feature);
  const { baseInvoiceUrl } = useSelector((state) => state.Invoice);
  const [isBtnDisabled, setIsBtnDisabled] = useState(false);
  const myStepperRef = useRef(null);

  // Fetch invoice URL when component mounts
  useEffect(() => {
    if (!baseInvoiceUrl) {
      dispatch(fetchInvoiceUrl());
    }
  }, [dispatch, baseInvoiceUrl]);

  // --- Receipts walkthrough refs (single step) ---
  const triggerRefReceipts1 = useRef(null); // Receipt link

  // --- OmnichannelOrdering walkthrough refs ---
  const triggerRefOmnichannel1 = useRef(null); // Status overview
  const triggerRefOmnichannel2 = useRef(null); // Status stepper

  // ✅ Define triggers mapping
  const triggers = useMemo(
    () => ({
      [FEATURES.RECEIPTS]: [triggerRefReceipts1],
      [FEATURES.OMNICHANNEL_ORDERING]: [
        triggerRefOmnichannel1,
        triggerRefOmnichannel2,
      ],
    }),
    []
  );

  // ✅ Build currentConfig using useMemo
  const currentConfig = useMemo(
    () =>
      GUIDE_CUE_MESSAGES.orderDetails[feature]
        ? {
            ...GUIDE_CUE_MESSAGES.orderDetails[feature],
            triggers: triggers[feature],
            steps: triggers[feature]?.length || 0,
          }
        : null,
    [feature, triggers]
  );
  console.log("🛠 Order Details Page currentConfig:", currentConfig);

  const onArrivedToStoreClick = async () => {
    if (!orderDetails.packageIsInTheStore || isBtnDisabled) return;
    setIsBtnDisabled(true);
    let result = await addOrderStatusHistory(orderId, {
      status: shippingMethods.bopis.steps[2].label,
      timestamp: Number(Date.now()),
    });
    if (result) {
      console.log("result", result);
    }
  };

  const onSeeReceiptClick = async () => {
    console.log(orderDetails);
    if (!orderDetails.invoiceId) return;
    dispatch(setOpenedInvoice(null));
    const invoice = await fetchInvoice(orderDetails.invoiceId);
    if (invoice) dispatch(setOpenedInvoice(invoice));
    else alert("Couldn't get receipt data, try again later");
  };

  const listenToSSEUpdates = useCallback(() => {
    console.log("listenToSSEUpdates func: ", orderId);
    console.log("-- orderId", orderId);
    console.log("-- sessionId", sessionId);
    const collection = "orders";
    const eventSource = new EventSource(
      `/api/sse?sessionId=${sessionId.current}&colName=${collection}&_id=${orderId}`
    );

    eventSource.onopen = () => {
      console.log("-- (onopen) SSE connection opened.");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("-- (onmessage) Received SSE Update:", data);
      handleChangeInOrders(orderId, data.fullDocument);
      dispatch(setOrder(data.fullDocument));
    };

    eventSource.onerror = (event) => {
      console.error("-- (onerror) SSE Error:", event);
      console.log("-- (onerror) SSE Error:", event);
    };

    if (sseConnection.current) {
      console.log(sseConnection.current);
      sseConnection.current.close();
      console.log(
        "-- Previous SSE connection closed - dashboard sessionId.",
        sessionId
      );
    }

    sseConnection.current = eventSource;
    return eventSource;
  }, [orderId]);

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const result = await fetchOrderDetails(orderId);
        if (result) {
          dispatch(setOrder(result));
        }
        dispatch(setLoading(false));
      } catch (err) {}
    };
    getOrderDetails();
    return () => {};
  }, [orderId]);

  useEffect(() => {
    if (orderDetails._id !== orderId) return;
    console.log(
      "myStepperRef 1",
      myStepperRef.current,
      document.getElementById("myStepperRef")
    );
    sseConnection?.current?.close();
    const eventSource = listenToSSEUpdates();
    console.log(
      "myStepperRef 2",
      myStepperRef.current,
      document.getElementById("myStepperRef")
    );
  }, [listenToSSEUpdates, orderDetails._id]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sseConnection.current) {
        console.info(
          "** Closing current SSE connection before unloading the page (order details)."
        );
        sseConnection.current.close();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      console.log("CLEAN COMPONENT ORDER DETAILS");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sseConnection]);

  const isPageReady = !orderDetails.loading && orderDetails._id !== null;

  return (
    <>
      <Navbar />
      <Container className="">
        {/* GuideCue component */}
        <GuideCueContainer
          config={currentConfig}
          feature={feature}
          ready={isPageReady}
        />

        <div className="d-flex flex-row">
          <div className="d-flex align-items-end w-100">
            <H1 onClick={() => console.log(orderDetails)}>Order details</H1>
          </div>
          <TalkTrackContainer sections={orderDetailsPage} />
        </div>
        <div className="mt-3">
          <H3 className="mb-2">Summary</H3>
          {orderDetails.loading ? (
            <>
              <CardSkeleton className="mb-2" />
              <H3 className="mb-2">Status</H3>
              <Skeleton className="mb-2" />
              <Skeleton className="mb-2" />
              <H3 className="mb-2">Products</H3>
              <CardSkeleton className="mb-2" />
              <CardSkeleton />
            </>
          ) : orderDetails._id !== null ? (
            <>
              <Card className="row m-0 mb-2">
                <div className="col">
                  <p className={styles.orderData}>
                    <strong>Date:</strong>{" "}
                    {prettifyDateFormat(
                      orderDetails.status_history[0]?.timestamp
                    )}
                  </p>
                  <p className={styles.orderData}>
                    <strong>ID:</strong> {orderId}
                  </p>
                  <p className={styles.orderData}>
                    <strong>Status:</strong>{" "}
                    {orderDetails.isCanceled ? (
                      <Badge variant="red">
                        {
                          orderDetails.status_history[
                            orderDetails.status_history.length - 1
                          ]?.status
                        }
                      </Badge>
                    ) : orderDetails.status_history[
                        orderDetails.status_history.length - 1
                      ]?.status === shippingMethods.bopis.steps[3]?.label ||
                      orderDetails.status_history[
                        orderDetails.status_history.length - 1
                      ]?.status === shippingMethods.home.steps[4]?.label ? (
                      <Badge variant="green">
                        {
                          orderDetails.status_history[
                            orderDetails.status_history.length - 1
                          ]?.status
                        }
                      </Badge>
                    ) : (
                      <Badge variant="gray">
                        {
                          orderDetails.status_history[
                            orderDetails.status_history.length - 1
                          ]?.status
                        }
                      </Badge>
                    )}
                  </p>
                </div>
                <div className="col">
                  <p className={styles.orderData}>
                    <strong>Type:</strong>
                    <ShippingMethodBadgeComp orderDetails={orderDetails} />
                  </p>
                  <p className={styles.orderData}>
                    <strong>Address:</strong> {orderDetails.shipping_address}
                  </p>
                </div>
                <div className="col">
                  <p className={styles.orderData}>
                    <strong>Total:</strong> ${orderDetails.totalPrice}{" "}
                  </p>
                  <p className={styles.orderData}>
                    <strong>Shipping:</strong> $0{" "}
                  </p>
                  <p className={styles.orderData}>
                    <strong>Receipt: </strong>
                    <a
                      className={styles.seeReceipt}
                      onClick={() => onSeeReceiptClick()}
                      ref={
                        feature === FEATURES.RECEIPTS
                          ? triggerRefReceipts1
                          : null
                      }
                    >
                      See details
                    </a>
                  </p>
                </div>
              </Card>

              <div
                ref={
                  feature === FEATURES.OMNICHANNEL_ORDERING
                    ? triggerRefOmnichannel1
                    : null
                }
              >
                <H3 className="mb-2">Status</H3>
                {!orderDetails.isCanceled && (
                  <Stepper
                    id="myStepperRef"
                    ref={myStepperRef}
                    className={`${
                      orderDetails.isCanceled ? styles.isCanceled : ""
                    }`}
                    currentStep={
                      orderDetails.isCanceled
                        ? 1
                        : orderDetails.status_history.length
                    }
                  >
                    {orderDetails.shippingMethod?.steps.map((step, index) => (
                      <Step
                        key={step.id}
                        
                      >
                        {step.label}
                      </Step>
                    ))}
                  </Stepper>
                )}
                <div style={{width: '10px' }} ref={
                          feature === FEATURES.OMNICHANNEL_ORDERING 
                            ? triggerRefOmnichannel2
                            : null
                        }> &nbsp; </div>
              </div>

              {orderDetails.packageIsInTheStore === true && (
                <Banner
                  className="mb-2 mt-2"
                  image={<Icon glyph="Bell"></Icon>}
                >
                  <div className="d-flex flex-row align-items-center justify-content-between">
                    <strong className="m-0">
                      Let the store know you have arrived for your package.
                    </strong>
                    <Button
                      disabled={isBtnDisabled}
                      onClick={() => onArrivedToStoreClick()}
                    >
                      I am here
                    </Button>
                  </div>
                </Banner>
              )}
              {orderDetails.status_history.map((statusHistory, index) => (
                <div key={`${index}-sh`}>
                  <p>
                    <strong>{statusHistory.status}: </strong>
                    {prettifyDateFormat(statusHistory.timestamp)}
                  </p>
                </div>
              ))}
              <H3 className="mb-2">
                Products
              </H3>
              {orderDetails.products?.map((product, index) => (
                <CartItem key={`cart-product-${index}`} product={product} />
              ))}
            </>
          ) : (
            "error"
          )}
        </div>
      </Container>
      <Footer />
    </>
  );
}
