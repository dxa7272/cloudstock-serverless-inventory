import { useState } from "react";
import { useNavigate } from "react-router";
import { createProduct } from "../services/api";

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productId: "",
    name: "",
    sku: "",
    category: "",
    price: "",
    quantity: "",
    lowStockLevel: 5,
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await createProduct({
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        lowStockLevel: Number(form.lowStockLevel),
      });

      navigate("/products");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Add Product</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="productId"
          placeholder="Product ID"
          value={form.productId}
          onChange={handleChange}
        />

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="sku"
          placeholder="SKU"
          value={form.sku}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
        />

        <input
          name="lowStockLevel"
          type="number"
          placeholder="Low Stock Level"
          value={form.lowStockLevel}
          onChange={handleChange}
        />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;