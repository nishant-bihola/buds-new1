import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not found");
    return;
  }
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'orders'
    ORDER BY ordinal_position;
  `;
  console.log(JSON.stringify(result, null, 2));
}

check();
