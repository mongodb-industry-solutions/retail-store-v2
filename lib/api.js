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


export async function fillCartRandomly(userId, numProducts = 5) {
  const response = await fetch("/api/fillCart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({userId, numProducts}),
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