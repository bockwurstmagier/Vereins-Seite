import { NextResponse } from "next/server";

import { HUJA_BRANDING } from "../../../lib/branding";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return NextResponse.json(
    {
      product: HUJA_BRANDING.productName,
      version: HUJA_BRANDING.version,
      checkedAt: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "CDN-Cache-Control": "no-store",
        "Vercel-CDN-Cache-Control": "no-store",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
