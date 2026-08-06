import { NextResponse } from "next/server";

const LATITUDE = 51.5177;
const LONGITUDE = 7.0857;

export const revalidate = 900;

export async function GET() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(LATITUDE));
  url.searchParams.set("longitude", String(LONGITUDE));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
    ].join(","),
  );
  url.searchParams.set("timezone", "Europe/Berlin");
  url.searchParams.set("forecast_days", "3");

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(
      {
        location: "Gelsenkirchen",
        current: data.current,
        daily: data.daily,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      },
    );
  } catch (error) {
    console.error("Dashboard weather failed:", error);
    return NextResponse.json(
      { error: "Wetter konnte nicht geladen werden." },
      { status: 503 },
    );
  }
}
