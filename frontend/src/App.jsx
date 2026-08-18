import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import CreateOrder from "./pages/CreateOrder";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Login>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/new"
            element={<AddProduct />}
          />

          <Route
            path="/products/:productId/edit"
            element={<EditProduct />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/new"
            element={<CreateOrder />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />
        </Route>
      </Routes>
    </Login>
  );
}

export default App;