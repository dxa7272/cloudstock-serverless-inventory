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
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value,
    });
  }


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      await createProduct({
        productId: form.productId,
        name: form.name,
        sku: form.sku,
        category: form.category,
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
    <div className="page">

      <h2>Add Product</h2>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <label>
          Product ID
          <input
            name="productId"
            value={form.productId}
            onChange={handleChange}
            placeholder="prod-006"
            required
          />
        </label>


        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>


        <label>
          SKU
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
          />
        </label>


        <label>
          Category
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
        </label>


        <label>
          Price
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>


        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>


        <label>
          Low Stock Level
          <input
            name="lowStockLevel"
            type="number"
            min="0"
            value={form.lowStockLevel}
            onChange={handleChange}
            required
          />
        </label>


        <button
          className="primary-button"
          type="submit"
        >
          Create Product
        </button>

      </form>

    </div>
  );
}


export default AddProduct;