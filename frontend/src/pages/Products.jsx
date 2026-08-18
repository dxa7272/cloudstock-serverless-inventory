import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  getProducts,
  deleteProduct,
  changeStock,
} from "../services/api";

import { isAdmin } from "../services/auth";


function Products() {
  const [products, setProducts] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  async function loadProducts() {
    try {
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    async function initialize() {
      const userIsAdmin = await isAdmin();

      setAdmin(userIsAdmin);

      await loadProducts();
    }

    initialize();
  }, []);


  async function handleDelete(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);

      await loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }


  async function handleStock(productId, change) {
    try {
      await changeStock(productId, change);

      await loadProducts();
    } catch (err) {
      alert(err.message);
    }
  }


  if (loading) {
    return <p>Loading products...</p>;
  }


  return (
    <div className="page">

      <div className="page-header">
        <h2>Products</h2>

        {admin && (
          <Link
            className="primary-button"
            to="/products/new"
          >
            Add Product
          </Link>
        )}
      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="product-grid">

        {products.map((product) => (

          <div
            className="product-card"
            key={product.productId}
          >

          {product.imageUrl && (
  <img
    className="product-image"
    src={product.imageUrl}
    alt={product.name}
  />
)}

            <h3>{product.name}</h3>

            <p>
              <strong>SKU:</strong>{" "}
              {product.sku}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {product.category}
            </p>

            <p>
              <strong>Price:</strong>{" "}
              ${Number(product.price).toFixed(2)}
            </p>

            <p>
              <strong>Stock:</strong>{" "}
              {product.quantity}
            </p>

            <p>
              <strong>Low stock level:</strong>{" "}
              {product.lowStockLevel}
            </p>


            {Number(product.quantity) <=
              Number(product.lowStockLevel) && (
              <p className="low-stock">
                Low Stock
              </p>
            )}


            {admin && (
              <div className="admin-controls">

                <div className="stock-buttons">

                  <button
                    onClick={() =>
                      handleStock(
                        product.productId,
                        -1
                      )
                    }
                  >
                    -1
                  </button>

                  <button
                    onClick={() =>
                      handleStock(
                        product.productId,
                        1
                      )
                    }
                  >
                    +1
                  </button>

                  <button
                    onClick={() =>
                      handleStock(
                        product.productId,
                        5
                      )
                    }
                  >
                    +5
                  </button>

                </div>


                <Link
                  to={`/products/${product.productId}/edit`}
                >
                  Edit
                </Link>


                <button
                  onClick={() =>
                    handleDelete(
                      product.productId
                    )
                  }
                >
                  Delete
                </button>

              </div>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}


export default Products;