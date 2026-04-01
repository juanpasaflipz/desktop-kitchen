import type { NextApiRequest, NextApiResponse } from "next";

const POS_LEADS_URL = "https://pos.desktop.kitchen/api/leads";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch(POS_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch {
    return res.status(502).json({ error: "Failed to reach backend" });
  }
}
