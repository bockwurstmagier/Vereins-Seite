import { NextResponse } from "next/server";

import { HUJA_BRANDING } from "../../../lib/branding";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      product: HUJA_BRANDING.productName,
      version: HUJA_BRANDING.version,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    },
  );
}
