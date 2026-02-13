import { COLLECTIONS, shippingMethods, AGGREGATION_PIPELINES } from "./constants";
import store from "@/redux/store";
import { getSessionAndUserId } from "./helpers";

export async function getProductsWithSearch(query = "", filters = {}) {
  console.log("getProductsWithSearch");
  const response = await fetch(`/api/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      facets: filters,
      pagination_page: store.getState("Products").Products.currentPage - 1,
    }),
  });
  if (!response.ok) {
    console.log(response);
    throw new Error(`Error fetching products: ${response.status}`);
  }
  const data = await response.json();
  console.log("data: ", data);
  return data;
}

export async function fetchUsers() {
  const response = await fetch("/api/getUsers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(),
  });
  if (!response.ok) {
    throw new Error(`Error fetching users: ${response.status}`);
  }

  const data = await response.json();
  return data.users;
}

export async function fetchStoreLocations() {
  const response = await fetch("/api/getStoreLocations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(),
  });
  if (!response.ok) {
    throw new Error(`Error fetching store locations: ${response.status}`);
  }

  const data = await response.json();
  return data.storeLocations;
}

export async function fillCartRandomly(userId, numProducts = null) {
  if (numProducts === null) {
    numProducts = Math.floor(Math.random() * 5) + 1; // get a random int number between 1 and 5
  }
  const response = await fetch("/api/fillCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, numProducts }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  return data.cart;
}

export async function fetchCart(userId) {
  const response = await fetch("/api/getCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userId),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }

  const data = await response.json();
  return data.cart;
}

export async function clearCart(userId) {
  const response = await fetch("/api/clearCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userId),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }

  const data = await response.json();
  return data.products;
}

export async function updateCartProduct(userId, productId, isInCart) {
  const product = await fetchproduct(productId);
  console.log("AQUI", productId, store.getState().Products, product);
  // si el User.cart._id === null -> create cart with this product
  // const cartId = store.getState().User.cart._id;
  // si no, const addtoCart = true o false
  const response = await fetch("/api/fillCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, productsToAdd: [product], numProducts: 0 }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }

  const data = await response.json();
  console.log("hola", data);
  return data.cart;
}

export async function fetchOrders(userId) {
  const response = await fetch("/api/getOrders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userId),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  return data.orders;
}

export async function fetchOrderDetails(orderId) {
  const response = await fetch("/api/getOrderDetails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderId),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  return data.order;
}

export async function createNewOrder(
  userId,
  userAddress,
  products = [],
  shippingMethod,
  storeAddress
) {
  const order = {
    userId,
    products,
    type: shippingMethod.label,
    shipping_address:
      shippingMethod.id === shippingMethods.bopis.id
        ? `${storeAddress.street_and_number}, ${storeAddress.city} ${storeAddress.cp}, ${storeAddress.country}`
        : shippingMethod.id === shippingMethods.home.id
          ? `${userAddress.street_and_number}, ${userAddress.city} ${userAddress.cp}, ${userAddress.country}`
          : "Unknown address",
  };
  const response = await fetch("/api/createOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  return data.order;
}

export async function addOrderStatusHistory(orderId, statusObj) {
  console.log(orderId, statusObj);
  const response = await fetch("/api/updateOrderStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, statusObj }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  return data.order;
}

export async function deleteOrder(orderId) {
  const response = await fetch("/api/deleteOrder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });
  if (!response.ok) {
    throw new Error(`Error deleting order: ${response.status}`);
  }
  const data = await response.json();
  return data.result;
}

export async function fetchAssistantResponse(
  userId,
  userText,
  messages,
  ordersMinimizedSchema
) {
  console.log("fetchAssistantResponse", userId, userText, messages, ordersMinimizedSchema);
  const response = await fetch("/api/getAssistantResponse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, userText, messages, ordersMinimizedSchema }),
  });
  if (!response.ok) {
    console.log(response);
    throw new Error(`Error fetching assistant response: ${response.status}`);
  }
  const data = await response.json();
  return { message: data.message, resJson: data.resJson };
}

export async function fetchInvoice(invoiceId) {
  const response = await fetch("/api/findDocuments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: { _id: invoiceId },
      collectionName: "invoices",
    }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  console.log(data);
  return data.result.length > 0 ? data.result[0] : null;
}

export async function chatbotLogin(email) {
  const timestamp = new Date();
  const response = await fetch("/api/insertDocument", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document: { email: email, timestamp: timestamp },
      collectionName: "sessions",
    }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  console.log(data);
  return data.document;
}

async function fetchproduct(productId) {
  let product = store.getState().Products.products[productId];
  if (product) return product;
  const response = await fetch("/api/findDocuments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: { _id: productId },
      collectionName: "products",
    }),
  });
  if (!response.ok) {
    throw new Error(`Error fetching cart: ${response.status}`);
  }
  const data = await response.json();
  console.log(data);
  return data.result.length > 0 ? data.result[0] : null;
}

export async function fetchCustomerBehaviours() {
  // Get sessionId and userId using centralized function
  const { sid, uid } = getSessionAndUserId();

  if (!uid || !sid) {
    console.warn(
      "Missing userId or sessionId for fetching customer behaviours"
    );
    return [];
  }

  const response = await fetch("/api/findDocuments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collectionName: COLLECTIONS.CUSTOMER_BEHAVIOUR,
      filter: {
        uid: uid,
        sid: sid,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching customer behaviours: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

export async function fetchNextBestActions() {
  // Get sessionId and userId using centralized function
  const { sid, uid } = getSessionAndUserId();

  if (!uid || !sid) {
    console.warn("Missing userId or sessionId for fetching next best actions");
    return [];
  }

  const response = await fetch("/api/findDocuments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      collectionName: COLLECTIONS.NEXT_BEST_ACTIONS,
      filter: {
        uid: uid,
        sid: sid,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching customer behaviours: ${response.status}`);
  }

  const data = await response.json();
  return data.result;
}

export async function redeemNextBestAction(nbaId) {
  const response = await fetch("/api/updateDocument", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filter: { _id: nbaId },
      update: { $set: { redeemed: true } },
      collectionName: COLLECTIONS.NEXT_BEST_ACTIONS,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error redeeming next best action: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function getCustomerBehaviorAnalysis() {
  const { uid } = getSessionAndUserId();
  
  // Get pipeline from constants and replace placeholder with actual uid
  const aggregatePipeline = AGGREGATION_PIPELINES.CUSTOMER_BEHAVIOR_ANALYSIS.map(stage => {
    if (stage.$match && stage.$match.uid === "USER_ID_PLACEHOLDER") {
      return { ...stage, $match: { ...stage.$match, uid: uid } };
    }
    return stage;
  });

  const response = await fetch("/api/aggregate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aggregatePipeline,
      collectionName: COLLECTIONS.CUSTOMER_BEHAVIOUR,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching customer behavior analysis: ${response.status}`
    );
  }

  const data = await response.json();
  return data.result;
}

export async function getNextBestActionsAnalysis(includeRedeemed = true) {
  const { uid } = getSessionAndUserId();
  
  console.log("getNextBestActionsAnalysis - uid:", uid);

  
  // Get pipeline from constants and replace placeholder with actual uid
  const aggregatePipeline = AGGREGATION_PIPELINES.NEXT_BEST_ACTIONS_ANALYSIS.map(stage => {
    if (stage.$match && stage.$match.uid === "USER_ID_PLACEHOLDER") {
      return { ...stage, $match: { ...stage.$match, uid: uid } };
    }
    return stage;
  });

  console.log("getNextBestActionsAnalysis - pipeline:", JSON.stringify(aggregatePipeline, null, 2));

  const response = await fetch("/api/aggregate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aggregatePipeline,
      collectionName: COLLECTIONS.NEXT_BEST_ACTIONS,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching next best actions analysis: ${response.status}`
    );
  }

  const data = await response.json();
  console.log("getNextBestActionsAnalysis - result:", data.result);
  return data.result;
}

export async function getEngagedActionsAnalysis() {
  const { uid } = getSessionAndUserId();

  // Get pipeline from constants and replace placeholder with actual uid
  const aggregatePipeline = AGGREGATION_PIPELINES.ENGAGED_ACTIONS_ANALYSIS.map(stage => {
    if (stage.$match && stage.$match.uid === "USER_ID_PLACEHOLDER") {
      return { ...stage, $match: { ...stage.$match, uid: uid, redeemed: true } };
    }
    return stage;
  });

  const response = await fetch("/api/aggregate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      aggregatePipeline,
      collectionName: COLLECTIONS.NEXT_BEST_ACTIONS,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching engaged actions analysis: ${response.status}`
    );
  }

  const data = await response.json();
  return data.result;
}
