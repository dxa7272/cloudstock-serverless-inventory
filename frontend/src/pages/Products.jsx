import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getProducts } from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2>Products</h2>

      <Link to="/products/new">Add Product</Link>

      {products.map((product) => (
        <div key={product.productId}>
          <h3>{product.name}</h3>

          <p>SKU: {product.sku}</p>
          <p>Category: {product.category}</p>
          <p>Price: ${Number(product.price).toFixed(2)}</p>
          <p>Quantity: {product.quantity}</p>

          <Link to={`/products/${product.productId}/edit`}>
            Edit
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Products;