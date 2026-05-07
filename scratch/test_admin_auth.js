import fetch from "node-fetch";

async function test() {
  const response = await fetch("http://localhost:3003/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: "bud" })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
