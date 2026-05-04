export function isAdmin(req: any): boolean {
  const auth = req.headers["authorization"] ?? "";
  const secret = process.env.ADMIN_SECRET || "budnbuddies2026";
  return auth === `Bearer ${secret}`;
}

export function requireAdmin(req: any, res: any): boolean {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
