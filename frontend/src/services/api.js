import { fetchAuthSession } from "aws-amplify/auth";

const API_URL = import.meta.env.VITE_API_URL;

async function getToken() {
  const session = await fetchAuthSession();

  return session.tokens?.accessToken?.toString();
}

async function request(path, options = {}, authenticated = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authenticated) {
    const token = await getToken();

    if (!token) {
      throw new Error("You must be signed in to perform this action.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}


// ============================================================
// PRODUCTS
// ============================================================

export function getProducts() {
  return request("/products", {}, false);
}


export function getProduct(productId) {
  return request(`/products/${productId}`, {}, false);
}


export function createProduct(product) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}


export function updateProduct(productId, product) {
  return request(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}


export function deleteProduct(productId) {
  return request(`/products/${productId}`, {
    method: "DELETE",
  });
}


// ============================================================
// INVENTORY
// ============================================================

export function changeStock(productId, change) {
  return request(`/products/${productId}/stock`, {
    method: "PATCH",
    body: JSON.stringify({
      change,
    }),
  });
}


// ============================================================
// ORDERS
// ============================================================

export function createOrder(order) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
}


// ============================================================
// ANALYTICS
// ============================================================

export function getAnalytics() {
  return request("/analytics");
}