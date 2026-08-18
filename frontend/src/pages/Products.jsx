import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  deleteProduct,
  getProducts,
} from "../services/api";

import {
  getUserGroups,
} from "../services/auth";


function Products() {
  const [products, setProducts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const admin = groups.includes("ADMIN");


  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      console.log("PRODUCTS API RESPONSE:", data);

      /*
       * Supports either:
       *
       * [
       *   {...},
       *   {...}
       * ]
       *
       * OR:
       *
       * {
       *   products: [...]
       * }
       */

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data?.products)) {
        setProducts(data.products);
      } else {
        console.error(
          "Unexpected products response:",
          data
        );

        setProducts([]);

        setError(
          "The API returned an unexpected products response."
        );
      }

    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setProducts([]);

      setError(
        err.message || "Failed to load products"
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    async function initializePage() {
      try {
        const userGroups =
          await getUserGroups();

        setGroups(userGroups);

      } catch (err) {
        console.error(
          "Failed to load user groups:",
          err
        );
      }

      await loadProducts();
    }

    initializePage();
  }, []);


  async function handleDelete(productId) {
    const confirmed = window.confirm(
      `Delete product ${productId}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) =>
            product.productId !== productId
        )
      );

    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      alert(
        err.message || "Failed to delete product"
      );
    }
  }


  if (loading) {
    return (
      <div className="page">
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    );
  }


  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h2>Products</h2>

          <p>
            Manage CloudStock inventory.
          </p>
        </div>


        {admin && (
          <Link
            to="/products/new"
            className="primary-button"
          >
            Add Product
          </Link>
        )}

      </div>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {!error && products.length === 0 && (
        <div className="empty-state">

          <h3>No products found</h3>

          <p>
            There are currently no products
            in the inventory.
          </p>

        </div>
      )}


      {products.length > 0 && (

        <div className="table-container">

          <table className="products-table">

            <thead>

              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Low Stock Level</th>
                <th>Status</th>

                {admin && (
                  <th>Actions</th>
                )}

              </tr>

            </thead>


            <tbody>

              {products.map((product) => {

                const quantity =
                  Number(product.quantity ?? 0);

                const lowStockLevel =
                  Number(
                    product.lowStockLevel ?? 0
                  );

                const lowStock =
                  quantity <= lowStockLevel;


                return (

                  <tr key={product.productId}>

                    <td>

                      {product.imageUrl ? (

                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="product-image"
                        />

                      ) : (

                        <div className="product-image-placeholder">
                          No image
                        </div>

                      )}

                    </td>


                    <td>

                      <strong>
                        {product.name}
                      </strong>

                      <div className="product-id">
                        {product.productId}
                      </div>

                    </td>


                    <td>
                      {product.sku}
                    </td>


                    <td>
                      {product.category}
                    </td>


                    <td>
                      $
                      {Number(
                        product.price ?? 0
                      ).toFixed(2)}
                    </td>


                    <td>
                      {quantity}
                    </td>


                    <td>
                      {lowStockLevel}
                    </td>


                    <td>

                      {lowStock ? (

                        <span className="status-low">
                          Low Stock
                        </span>

                      ) : (

                        <span className="status-good">
                          In Stock
                        </span>

                      )}

                    </td>


                    {admin && (

                      <td>

                        <div className="table-actions">

                          <Link
                            to={
                              `/products/${product.productId}/edit`
                            }
                          >
                            Edit
                          </Link>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                product.productId
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    )}

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}


export default Products;