import {
  useEffect,
  useState,
} from "react";

import { getAnalytics } from "../services/api";


function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  const [error, setError] =
    useState("");


  useEffect(() => {

    async function loadAnalytics() {
      try {
        const data =
          await getAnalytics();

        setAnalytics(data);

      } catch (err) {
        setError(err.message);
      }
    }

    loadAnalytics();

  }, []);


  if (error) {
    return (
      <div className="page">
        <h2>Analytics</h2>

        <p className="error-message">
          {error}
        </p>
      </div>
    );
  }


  if (!analytics) {
    return <p>Loading analytics...</p>;
  }


  return (
    <div className="page">

      <h2>Sales Analytics</h2>


      <div className="stats-grid">

        <div className="stat-card">

          <h3>Revenue</h3>

          <p>
            $
            {Number(
              analytics.totalRevenue ||
                0
            ).toFixed(2)}
          </p>

        </div>


        <div className="stat-card">

          <h3>Orders</h3>

          <p>
            {analytics.totalOrders ||
              0}
          </p>

        </div>


        <div className="stat-card">

          <h3>Products Sold</h3>

          <p>
            {analytics.productsSold ||
              0}
          </p>

        </div>


        <div className="stat-card">

          <h3>Low Stock</h3>

          <p>
            {
              analytics.lowStockProducts ||
                0
            }
          </p>

        </div>

      </div>

    </div>
  );
}


export default Analytics;