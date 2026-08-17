import { NavLink, Outlet } from "react-router";
import { signOut } from "aws-amplify/auth";

function Layout() {
  async function handleLogout() {
    await signOut();
    window.location.reload();
  }

  return (
    <div>
      <header>
        <h1>CloudStock</h1>

        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>{" "}
          <NavLink to="/products">Products</NavLink>{" "}
          <NavLink to="/orders/new">Create Order</NavLink>{" "}
          <NavLink to="/analytics">Analytics</NavLink>{" "}

          <button onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;