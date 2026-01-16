import { setMinimizedOrderSchema } from "@/redux/slices/ChatbotSlice";
import { CUSTOMER_BEHAVIOUR_TYPES, EVENT_STREAMS_TYPES, ORDERS_LISTED_IN_CHATBOT } from "./constants";
import store from "@/redux/store";
import {
  addUsersNewOrder,
  setSelectedUserLastRecommendations,
  updateUsersOrder,
} from "@/redux/slices/UserSlice";

export const getMinimizedSchemaForDataworkz = async (orders) => {
  let result = [];
  for (let index = 0; index < orders.length; index++) {
    const order = orders[index];
    const status = order.status_history[order.status_history.length - 1];
    result.push({
      id: order._id,
      user: order.user,
      shipping_address: order.shipping_address,
      status: status.status,
      status_date: prettifyDateFormat(status.timestamp),
      type: order.type,
      products:
        order.products?.map((product) => ({
          id: product._id,
          name: product.name,
          description: product.description,
          code: product.code,
          brand: product.brand,
          price: `$${product.price.amount}`,
        })) || [],
    });
  }
  return result;
};

export const calculateInitialMessage = async (minimizedOrderSchema) => {
  let ordersListed = Math.min(
    ORDERS_LISTED_IN_CHATBOT,
    minimizedOrderSchema.length
  );
  let txt = `Hi there! Today's date is ${prettifyDateFormat(
    new Date()
  )} and I am a GenAI Chatbot design to assist you! Here are your latest orders: `;
  let html = `<div>
        Hi there! I am a GenAI Chatbot design to assist you! <br/> 
        Here are your latests orders:
         <ol>`;
  for (let index = 0; index < ordersListed; index++) {
    const order = minimizedOrderSchema[index];
    txt += ` ${index + 1}. Order Id ${order.id} with status ${order.status}. `;
    html += `<li>Order Id ${order.id} with status as '${order.status}'.</li>`; // and ${order.products?.length} ${order.products?.length > 1 ? 'items' : 'item'}
  }
  txt += "Which order would you like to track?";
  html += `</ol>
        Which order would you like to track?
    </div>`;
  console.log(txt);
  return { txt, html };
};

export const prettifyDateFormat = (timestamp) => {
  const date = new Date(timestamp);
  // Format the date part (e.g., "Jan 1, 2000")
  const datePart = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  // Format the time part (e.g., "12:00:00 AM")
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
};

export const handleChangeInOrders = async (orderId, order) => {
  // update orders list fron UserSlice redux
  store.dispatch(updateUsersOrder({ orderId, order }));
  // update minimizedOrderSchema list from ChatbotSlice redux
  const orders = store.getState().User.orders.list;
  let result = await getMinimizedSchemaForDataworkz(orders);
  if (result) store.dispatch(setMinimizedOrderSchema(result));
};

export const handleCreateNewOrder = async (order) => {
  // update orders list fron UserSlice redux
  store.dispatch(addUsersNewOrder({ order }));
  // update minimizedOrderSchema list from ChatbotSlice redux
  let result = await getMinimizedSchemaForDataworkz(
    store.getState().User.orders.list
  );
  if (result) store.dispatch(setMinimizedOrderSchema(result));
};

export const handleNewRecommendationsForUser = async (lastRecommendations) => {
  store.dispatch(setSelectedUserLastRecommendations(lastRecommendations));
};

export const getLastBoughtProducts = (amount) => {
  const orders = store.getState().User.orders.list;
  console.log(orders);
  let breakBool = false;
  let products = [];
  for (let orderIndex = 0; orderIndex < orders.length; orderIndex++) {
    const order = orders[orderIndex];
    for (let prodIndex = 0; prodIndex < order.products.length; prodIndex++) {
      let prod = order.products[prodIndex];
      products.push({
        ...prod,
        price: prod.price.amount,
        image: prod.image.url,
      });
      amount--;
      breakBool = amount === 0;
      if (breakBool) break;
    }
    if (breakBool) break;
  }
  return products;
};

export const getBehaviorConfig = (type) => {
  switch (type) {
    case CUSTOMER_BEHAVIOUR_TYPES.HIGH_INTENT.name:
      return {
        icon: "MagnifyingGlass",
        color: "#4CAF50",
        label: CUSTOMER_BEHAVIOUR_TYPES.HIGH_INTENT.label,
      };
    case CUSTOMER_BEHAVIOUR_TYPES.EXIT_RISK.name:
      return { icon: "LogOut", color: "#FF5722", label: CUSTOMER_BEHAVIOUR_TYPES.EXIT_RISK.label };
    case CUSTOMER_BEHAVIOUR_TYPES.SEARCH_FRICTION.name:
      return {
        icon: "QuestionMarkWithCircle",
        color: "#FF9800",
        label: CUSTOMER_BEHAVIOUR_TYPES.SEARCH_FRICTION.label,
      };
    default:
      return { icon: "LightningBolt", color: "#2196F3", label: type };
  }
};

export const getNextBestActionConfig = (actionType) => {
  switch (actionType) {
    case "social-proof-notification":
      return { icon: "Person" };
    case "product-recommendation":
      return { icon: "Sparkle" };
    case "free-delivery":
      return { icon: "Home" };
    default:
      return { icon: "Bell" };
  }
};



// Helper function to validate required fields
const validateEventFields = (eventType, metadata) => {
  const requiredFields = eventType.requiredFields || [];
  const missingFields = requiredFields.filter(field => !metadata[field]);
  
  if (missingFields.length > 0) {
    console.warn(`${eventType.name} event skipped: missing required fields (${missingFields.join(', ')})`);
    return false;
  }
  return true;
};

export const generateTimeSeriesEvent = (
  userId = null,
  sessionId = null,
  event = EVENT_STREAMS_TYPES.HEARTBEAT,
  metadata = {}
) => {
  // Fallback logic for userId and sessionId
  if (!userId) {
    const selectedUser = store.getState().User.selectedUser;
    userId = selectedUser?._id || null;
  }
  if (!sessionId) {
    sessionId = sessionStorage.getItem("sessionId") || null;
  }
  
  // Validate essential fields
  if (!userId || !sessionId) {
    console.warn("Event generation skipped: missing userId or sessionId");
    return null;
  }

  // Validate event-specific required fields
  if (!validateEventFields(event, metadata)) {
    return null;
  }

  const basePayload = {
    tags: {
      userId,
      sessionId,
      event: event.name,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...basePayload,
    metadata: { ...metadata },
  };
};
