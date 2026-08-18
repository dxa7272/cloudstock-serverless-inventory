import { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";
import { isAdmin } from "../services/auth";


function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadDashboard() {
      try {
        const userIsAdmin = await isAdmin();

        setAdmin(userIsAdmin);

        if (userIsAdmin) {
          const data = await getAnalytics();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);


  if (loading) {
    return <p>Loading dashboard...</p>;
  }


  return (
    <div className="page">
      <h2>Dashboard</h2>

      {!admin && (
        <div className="welcome-card">
          <h3>Welcome to CloudStock</h3>
          <p>
            Use the Products page to view inventory or create an order.
          </p>
        </div>
      )}

      {admin && analytics && (
        <div className="stats-grid">

          <div className="stat-card">
            <h3>Revenue</h3>
            <p>
              ${Number(analytics.totalRevenue || 0).toFixed(2)}
            </p>
          </div>

          <div className="stat-card">
            <h3>Orders</h3>
            <p>{analytics.totalOrders || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Products Sold</h3>
            <p>{analytics.productsSold || 0}</p>
          </div>

          <div className="stat-card">
            <h3>Low Stock</h3>
            <p>{analytics.lowStockProducts || 0}</p>
          </div>

        </div>
      )}
    </div>
  );
}


export default Dashboard;