import {
  NavLink,
  Outlet,
} from "react-router";

import {
  signOut,
} from "aws-amplify/auth";

import {
  useEffect,
  useState,
} from "react";

import {
  getUserGroups,
} from "../services/auth";


function Layout() {
  const [groups, setGroups] = useState([]);


  useEffect(() => {
    async function loadGroups() {
      const userGroups = await getUserGroups();

      setGroups(userGroups);
    }

    loadGroups();
  }, []);


  const admin = groups.includes("ADMIN");


  async function handleLogout() {
    await signOut();

    window.location.reload();
  }


  return (
    <div className="app-shell">

      <aside className="sidebar">

        <h1>CloudStock</h1>


        <nav>

          <NavLink to="/dashboard">
            Dashboard
          </NavLink>


          <NavLink to="/products">
            Products
          </NavLink>


          <NavLink to="/orders/new">
            Create Order
          </NavLink>


          {admin && (
            <NavLink to="/orders">
              Orders
            </NavLink>
          )}


          {admin && (
            <NavLink to="/analytics">
              Analytics
            </NavLink>
          )}


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </nav>

      </aside>


      <main className="main-content">

        <Outlet />

      </main>

    </div>
  );
}


export default Layout;