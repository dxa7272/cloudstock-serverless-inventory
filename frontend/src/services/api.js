import { fetchAuthSession } from "aws-amplify/auth";


const API_URL = import.meta.env.VITE_API_URL;


// ============================================================
// CHECK CONFIGURATION
// ============================================================

if (!API_URL) {
  console.error(
    "VITE_API_URL is missing. Check frontend/.env"
  );
} else {
  console.log(
    "CloudStock API URL:",
    API_URL
  );
}


// ============================================================
// AUTH TOKEN
// ============================================================

async function getToken() {
  const session = await fetchAuthSession();

  return session.tokens?.accessToken?.toString();
}


// ============================================================
// GENERIC API REQUEST
// ============================================================

async function request(
  path,
  options = {},
  authenticated = true
) {

  if (!API_URL) {
    throw new Error(
      "CloudStock API URL is not configured. Check frontend/.env."
    );
  }


  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };


  if (authenticated) {

    const token = await getToken();

    if (!token) {
      throw new Error(
        "You must be signed in."
      );
    }

    headers.Authorization =
      `Bearer ${token}`;
  }


  const url = `${API_URL}${path}`;

  console.log(
    "API REQUEST:",
    url
  );


  const response = await fetch(
    url,
    {
      ...options,
      headers,
    }
  );


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

    console.error(
      "API ERROR:",
      response.status,
      data
    );

    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`
    );
  }


  return data;
}


// ============================================================
// PRODUCTS
// ============================================================

export function getProducts() {

  return request(
    "/products",
    {},
    false
  );
}


export function getProduct(productId) {

  return request(
    `/products/${productId}`,
    {},
    false
  );
}


export function createProduct(product) {

  return request(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(product),
    }
  );
}


export function updateProduct(
  productId,
  product
) {

  return request(
    `/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(product),
    }
  );
}


export function deleteProduct(productId) {

  return request(
    `/products/${productId}`,
    {
      method: "DELETE",
    }
  );
}


// ============================================================
// INVENTORY
// ============================================================

export function changeStock(
  productId,
  change
) {

  return request(
    `/products/${productId}/stock`,
    {
      method: "PATCH",

      body: JSON.stringify({
        change,
      }),
    }
  );
}


// ============================================================
// ORDERS
// ============================================================

export function createOrder(order) {

  return request(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify(order),
    }
  );
}


export function getOrders() {

  return request(
    "/orders"
  );
}


// ============================================================
// ANALYTICS
// ============================================================

export function getAnalytics() {

  return request(
    "/analytics"
  );
}