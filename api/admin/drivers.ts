import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDrivers, upsertDriver, deleteDriver } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const driverList = await getDrivers();
      return json(res as any, { drivers: driverList });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body.name) return json(res as any, { error: "Driver name required" }, 400);
      const driver = await upsertDriver(body);
      return json(res as any, { driver: driver[0] });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return json(res as any, { error: "Missing ID" }, 400);
      await deleteDriver(id as string);
      return json(res as any, { success: true });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[admin/drivers]", err);
    return json(res as any, { error: err.message || "Internal server error" }, 500);
  }
}
