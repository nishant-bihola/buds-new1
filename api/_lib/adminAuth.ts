export function isAdmin(req: any): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const auth = req.headers["authorization"] ?? "";
  return auth === `Bearer ${secret}`;
}

export function requireAdmin(req: any, res: any): boolean {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}
