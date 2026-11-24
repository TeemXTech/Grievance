import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-middleware"

// Manthani constituency, Peddapalli district, Telangana
const LAT = 18.6558
const LON = 79.6647

const WMO: Record<number, { label: string; icon: string }> = {
  0:  { label: "Clear sky",      icon: "☀️" },
  1:  { label: "Mainly clear",   icon: "🌤️" },
  2:  { label: "Partly cloudy",  icon: "⛅" },
  3:  { label: "Overcast",       icon: "☁️" },
  45: { label: "Foggy",          icon: "🌫️" },
  48: { label: "Icy fog",        icon: "🌫️" },
  51: { label: "Light drizzle",  icon: "🌦️" },
  61: { label: "Light rain",     icon: "🌧️" },
  63: { label: "Moderate rain",  icon: "🌧️" },
  65: { label: "Heavy rain",     icon: "⛈️" },
  80: { label: "Rain showers",   icon: "🌦️" },
  81: { label: "Rain showers",   icon: "🌧️" },
  82: { label: "Heavy showers",  icon: "⛈️" },
  95: { label: "Thunderstorm",   icon: "⛈️" },
  99: { label: "Thunderstorm",   icon: "⛈️" },
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,weathercode,windspeed_10m,precipitation` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum` +
      `&timezone=Asia%2FKolkata&forecast_days=3`

    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) throw new Error("Weather API unavailable")
    const data = await res.json()

    const code = data.current.weathercode
    const meta = WMO[code] || { label: "Unknown", icon: "🌡️" }

    const forecast = (data.daily.time as string[]).map((date: string, i: number) => ({
      date,
      maxTemp: Math.round(data.daily.temperature_2m_max[i]),
      minTemp: Math.round(data.daily.temperature_2m_min[i]),
      rain: data.daily.precipitation_sum[i],
      icon: (WMO[data.daily.weathercode[i]] || { icon: "🌡️" }).icon,
      label: (WMO[data.daily.weathercode[i]] || { label: "Unknown" }).label,
    }))

    const rainToday = forecast[0]?.rain > 5
    const rainTomorrow = forecast[1]?.rain > 5

    return NextResponse.json({
      success: true,
      location: "Manthani, Peddapalli",
      current: {
        temp: Math.round(data.current.temperature_2m),
        icon: meta.icon,
        label: meta.label,
        wind: Math.round(data.current.windspeed_10m),
        rain: data.current.precipitation,
      },
      forecast,
      advisory: rainToday
        ? "⚠️ Rain expected today — review outdoor tour plans"
        : rainTomorrow
        ? "🌧️ Rain forecast tomorrow — plan field visits accordingly"
        : "✅ Clear weather — good for field visits",
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
