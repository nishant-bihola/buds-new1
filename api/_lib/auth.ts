// Unified auth + response helpers that work with VercelRequest/VercelResponse

export function isAdmin(req: any): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("ADMIN_SECRET not configured");
  const auth = (req.headers?.authorization ?? req.headers?.Authorization ?? "") as string;
  return auth === `Bearer ${secret}`;
}

export function requireAdmin(req: any, res: any): boolean {
  if (!isAdmin(req)) {
    if (typeof res.status === "function") {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
    }
    return false;
  }
  return true;
}

export function cors(res: any) {
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
}

export function json(res: any, data: any, status = 200) {
  if (typeof res.status === "function") {
    return res.status(status).json(data);
  }
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

export async function parseBody(req: any): Promise<any> {
  if (req.body !== undefined) return req.body;
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: any) => { body += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}
