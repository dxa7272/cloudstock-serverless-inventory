import {
  useEffect,
  useState,
} from "react";

import {
  createOrder,
  getProducts,
} from "../services/api";


function CreateOrder() {
  const [products, setProducts] =
    useState([]);

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  useEffect(() => {

    async function loadProducts() {
      try {
        const data =
          await getProducts();

        setProducts(data);

        if (data.length > 0) {
          setProductId(
            data[0].productId
          );
        }

      } catch (err) {
        setError(err.message);
      }
    }

    loadProducts();

  }, []);


  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");

      const result =
        await createOrder({
          productId,
          quantity:
            Number(quantity),
        });

      setMessage(
        `Order created successfully. Total: $${Number(
          result.order.total
        ).toFixed(2)}`
      );

    } catch (err) {
      setError(err.message);
    }
  }


  return (
    <div className="page">

      <h2>Create Order</h2>


      {message && (
        <p className="success-message">
          {message}
        </p>
      )}


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
          Product

          <select
            value={productId}
            onChange={(event) =>
              setProductId(
                event.target.value
              )
            }
          >

            {products.map(
              (product) => (
                <option
                  key={
                    product.productId
                  }
                  value={
                    product.productId
                  }
                >
                  {product.name}
                  {" - "}
                  Stock:
                  {" "}
                  {product.quantity}
                </option>
              )
            )}

          </select>

        </label>


        <label>
          Quantity

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) =>
              setQuantity(
                event.target.value
              )
            }
          />

        </label>


        <button
          className="primary-button"
          type="submit"
        >
          Create Order
        </button>

      </form>

    </div>
  );
}


export default CreateOrder;