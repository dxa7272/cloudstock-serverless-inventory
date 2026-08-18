import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router";

import {
  getProduct,
  updateProduct,
} from "../services/api";


function EditProduct() {
  const { productId } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");


  useEffect(() => {

    async function loadProduct() {
      try {
        const product =
          await getProduct(productId);

        setForm(product);

      } catch (err) {
        setError(err.message);
      }
    }

    loadProduct();

  }, [productId]);


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
      await updateProduct(
        productId,
        {
          name: form.name,
          sku: form.sku,
          category: form.category,
          price: Number(form.price),
          quantity: Number(form.quantity),
          lowStockLevel:
            Number(form.lowStockLevel),
        }
      );

      navigate("/products");

    } catch (err) {
      setError(err.message);
    }
  }


  if (!form) {
    return <p>Loading product...</p>;
  }


  return (
    <div className="page">

      <h2>Edit Product</h2>

      <p>
        Product ID: {productId}
      </p>


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
          Name

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />

        </label>


        <label>
          SKU

          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
          />

        </label>


        <label>
          Category

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
          />

        </label>


        <label>
          Price

          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
          />

        </label>


        <label>
          Quantity

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
          />

        </label>


        <label>
          Low Stock Level

          <input
            name="lowStockLevel"
            type="number"
            value={form.lowStockLevel}
            onChange={handleChange}
          />

        </label>


        <button
          className="primary-button"
          type="submit"
        >
          Save Changes
        </button>

      </form>

    </div>
  );
}


export default EditProduct;