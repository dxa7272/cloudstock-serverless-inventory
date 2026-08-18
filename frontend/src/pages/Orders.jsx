import {
  useEffect,
  useState,
} from "react";

import {
  getOrders,
} from "../services/api";


function Orders() {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    async function loadOrders() {

      try {

        setError("");

        const data =
          await getOrders();

        setOrders(data);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);
      }
    }


    loadOrders();

  }, []);


  if (loading) {

    return (
      <div className="page">
        <p>Loading orders...</p>
      </div>
    );
  }


  return (

    <div className="page">

      <div className="page-header">

        <h2>Order History</h2>

        <p>
          {orders.length} orders
        </p>

      </div>


      {error && (

        <p className="error-message">
          {error}
        </p>

      )}


      {!error &&
        orders.length === 0 && (

          <div className="welcome-card">

            <h3>No orders yet</h3>

            <p>
              Orders will appear here
              after they are created.
            </p>

          </div>

        )}


      {!error &&
        orders.length > 0 && (

          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>
                    Order ID
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Unit Price
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {orders.map(
                  (order) => (

                    <tr
                      key={
                        order.orderId
                      }
                    >

                      <td>
                        {order.orderId}
                      </td>

                      <td>
                        {
                          order.productName
                        }
                      </td>

                      <td>
                        {order.quantity}
                      </td>

                      <td>
                        $
                        {Number(
                          order.unitPrice
                        ).toFixed(2)}
                      </td>

                      <td>
                        $
                        {Number(
                          order.total
                        ).toFixed(2)}
                      </td>

                      <td>
                        {order.status}
                      </td>

                      <td>
                        {
                          order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString()
                            : ""
                        }
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

    </div>
  );
}


export default Orders;