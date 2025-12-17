import React, { useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Subtitle, Description } from "@leafygreen-ui/typography";
import Image from "next/image";
import PRCard from "../personalizedRecommendations/PRCard";
import { prettifyDateFormat } from "@/lib/helpers";
import { setLoading } from "@/redux/slices/InvoiceSlice";
import {
  addOperationAlert,
  addSucAutoCloseAlertHnd,
  addWarnAutoCloseAlertHnd,
  closeAlertWithDelay,
} from "@/lib/alerts";
import { GUIDE_CUE_MESSAGES, FEATURES } from "@/lib/constants";
import GuideCueContainer from "../guideCueContainer/GuideCuecontainer";
import Icon from "@leafygreen-ui/icon";

// ✅ Regular functional component (no forwardRef)
const DigitalReceiptData = () => {
  const dispatch = useDispatch();
  const openedInvoice = useSelector((state) => state.Invoice.openedInvoice);
  const invoiceIsLoading = useSelector(
    (state) => state.Invoice.invoiceIsLoading
  );
  const invoiceEndpoint = useSelector((state) => state.Invoice?.invoiceEndpoint) || null;
  const feature = useSelector((state) => state.Global.feature);

  // ✅ Create refs for guide steps
  const triggerRef1 = useRef(null); // Items section
  const triggerRef2 = useRef(null); // Recommendations section
  const triggerRef3 = useRef(null); // Download button

  const triggers = {
    [FEATURES.RECEIPTS]: [triggerRef1, triggerRef2, triggerRef3],
  };

  // ✅ Build config using constants + refs
  const currentConfig = useMemo(
    () =>
      GUIDE_CUE_MESSAGES.digitalReceipt[feature]
        ? {
            ...GUIDE_CUE_MESSAGES.digitalReceipt[feature],
            triggers: triggers[feature],
            steps: triggers[feature].length,
          }
        : null,
    [feature, triggers]
  );

  const onDownloadInvoice = async () => {
    console.log("onDownloadInvoice");
    if (invoiceIsLoading === true) return;
    if(!invoiceEndpoint)
      alert('Invoice download is not available at the moment. Sorry for the inconvenience')
    dispatch(setLoading(true));
    const downloadMDBRes = new Date();
    addOperationAlert({
      id: downloadMDBRes.getMilliseconds(),
      title: "Fetching Receipt",
      message: "Downloading digital receipt",
    });

    let res = await fetch(invoiceEndpoint);
    res = await res.json();
    let download_url = res.download_url;
    console.log(download_url, res);

    if (download_url) {
      window.open(download_url, "_blank");
      addSucAutoCloseAlertHnd({
        id: new Date().getMilliseconds(),
        title: "Fetching Receipt",
        message: `Receipt downloaded successfully`,
      });
    } else {
      addWarnAutoCloseAlertHnd({
        id: new Date().getMilliseconds(),
        title: "Could not download invoice",
      });
    }
    dispatch(setLoading(false));
    closeAlertWithDelay(downloadMDBRes.getMilliseconds(), 1500);
  };

  return (
    <div className="DigitalReceiptData w-100 d-flex flex-column align-items-center">
      <GuideCueContainer config={currentConfig} feature={feature} />
      <div className="w-100 d-flex justify-content-center mb-2">
        <Image src="/leafyLogo.png" alt="Logo" width={208} height={54} />
      </div>
      <Description>
        Created in {prettifyDateFormat(openedInvoice?.createdAt)}
      </Description>
      <Description>Order Id #{openedInvoice?.orderId}</Description>

      {/* ✅ STEP 2: Items section with conditional ref */}
      <div className="products-container mt-3">
        <strong className="m-0">Items</strong>
        <hr className="mt-0"></hr>
        <div
          className="product-price-list"
          ref={feature === FEATURES.RECEIPTS ? triggerRef1 : null}
        >
          <p className="mt-0">#</p>
          <p className="ms-4"></p>
          <p className="ms-4">Product</p>
          <p className="ms-4">Price</p>
        </div>
        {openedInvoice?.items.map((prod, index) => (
          <div className="product-price-list mb-1" key={index}>
            <p className="me-1">{index + 1}</p>
            <div
              style={{
                width: "50px",
                height: "50px",
                minWidth: "50px",
                minHeight: "50px",
                backgroundColor: "lightgrey",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Image
                src={prod.image.url}
                alt={"Img"}
                width={49}
                height={49}
                quality={50}
                unoptimized
                style={{
                  objectFit: "contain",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              />
            </div>
            <p className="ms-4 w-100">{prod.name}</p>
            <p className="ms-4" style={{ minWidth: "fit-content" }}>
              {prod?.amount} x ${prod?.price.amount}
            </p>
          </div>
        ))}
        <strong className="m-0">Details</strong>
        <hr className="mt-0"></hr>
        <div className="product-price-list">
          <p>Subtotal</p>
          <p className="ms-4"></p>
          <p className="ms-4">
            ${openedInvoice?.metadata?.erpDetails?.subtotal?.toFixed(2)}
          </p>
        </div>
        <div className="product-price-list">
          <p>Tax</p>
          <p className="ms-4"></p>
          <p className="ms-4">
            ${openedInvoice?.metadata?.erpDetails?.totalTax?.toFixed(2)}
          </p>
        </div>
        <div className="product-price-list">
          <p>TOTAL</p>
          <p className="ms-4"></p>
          <strong className="ms-4" style={{ color: "green" }}>
            ${openedInvoice?.metadata?.erpDetails?.totalAmount}
          </strong>
        </div>
        <strong className="m-0">Loyalty</strong>
        <hr className="mt-0"></hr>
        <div className="product-price-list">
          <p>Points earned</p>
          <p className="ms-4"></p>
          <p className="ms-4">
            +{openedInvoice?.metadata?.loyaltyRewards?.pointsEarned}
          </p>
        </div>
        <div className="product-price-list">
          <p>Tier</p>
          <p className="ms-4"></p>
          <p className="ms-4">
            {openedInvoice?.metadata?.loyaltyRewards?.tier}
          </p>
        </div>
        <hr className="mt-0"></hr>

        {/* ✅ STEP 4: Download button with conditional ref */}
        <div className="d-flex justify-content-center mb-3 w-100">
          <p
            ref={feature === FEATURES.RECEIPTS ? triggerRef3 : null}
            className={`fake-link ${invoiceIsLoading ? "disabled" : ""}`}
            onClick={() => onDownloadInvoice()}
          >
            Download receipt as PDF <Icon glyph="Download" />
          </p>
        </div>
      </div>

      {/* ✅ STEP 3: Recommendations section with conditional ref */}
      <div className="products-container">
        <Subtitle className="ms-0">
          Based on this order you might also like
        </Subtitle>
        <div className="recommendations-list mt-3" ref={feature === FEATURES.RECEIPTS ? triggerRef2 : null}>
          {openedInvoice?.recommendations.length > 0
            ? openedInvoice?.recommendations.map((prod, index) => (
                <PRCard
                  key={index}
                  product={prod}
                />
              ))
            : [0, 1, 2, 3, 4, 5].map((prod, index) => (
                <PRCard key={index} product={prod} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalReceiptData;
