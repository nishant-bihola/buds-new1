import fetch from "node-fetch";

async function test() {
  const order = {
    orderId: "TEST-" + Date.now(),
    customer: {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890"
    },
    delivery: {
      method: "delivery",
      street: "123 Main St",
      city: "Test City",
      postal: "T1T 1T1",
      slot: "asap"
    },
    items: [
      { id: "product_test_002", name: "Test Product", price: 10, quantity: 1 }
    ],
    subtotal: 10,
    deliveryFee: 5,
    discount: 0,
    total: 15,
    paymentMethod: "pay_on_delivery"
  };

  const response = await fetch("http://localhost:3003/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
