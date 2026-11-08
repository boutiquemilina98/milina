import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface AnalyticsResponse {
  configured: boolean;
  period: string;
  since: string;
  until: string;
  summary: {
    pageviews: number;
    visitors: number;
    avgViewsPerVisitor: number;
  };
  timeseries: Array<{
    timestamp: string;
    pageviews: number;
    visitors: number;
  }>;
  paths: Array<{
    path: string;
    pageviews: number;
    visitors: number;
  }>;
  referrers: Array<{
    referrer: string;
    pageviews: number;
    visitors: number;
  }>;
  countries: Array<{
    country: string;
    pageviews: number;
    visitors: number;
  }>;
  devices: Array<{
    device: string;
    pageviews: number;
    visitors: number;
  }>;
  os: Array<{
    os: string;
    pageviews: number;
    visitors: number;
  }>;
}

export async function GET(req: NextRequest) {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      {
        configured: false,
        error: "Missing VERCEL_API_TOKEN or VERCEL_PROJECT_ID environment variables.",
      },
      { status: 200 }
    );
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30d";

  const now = new Date();
  const until = now.toISOString();

  let days = 30;
  let timeGroupBy: "hour" | "day" = "day";

  if (period === "24h") {
    days = 1;
    timeGroupBy = "hour";
  } else if (period === "7d") {
    days = 7;
    timeGroupBy = "day";
  } else if (period === "90d") {
    days = 90;
    timeGroupBy = "day";
  } else {
    days = 30;
    timeGroupBy = "day";
  }

  const sinceDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const since = sinceDate.toISOString();

  const baseUrl = "https://api.vercel.com/v1/query/web-analytics";
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const buildUrl = (endpoint: string, params: Record<string, string>) => {
    const url = new URL(`${baseUrl}/${endpoint}`);
    url.searchParams.set("projectId", projectId);
    if (teamId) url.searchParams.set("teamId", teamId);
    url.searchParams.set("since", since);
    url.searchParams.set("until", until);
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }
    return url.toString();
  };

  const fetchJson = async (url: string) => {
    try {
      const res = await fetch(url, {
        headers: authHeaders,
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Vercel API error (${res.status}):`, text);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error("Vercel API fetch error:", err);
      return null;
    }
  };

  try {
    const [timeSeriesRes, pathsRes, referrersRes, countriesRes, devicesRes, osRes] =
      await Promise.all([
        fetchJson(buildUrl("visits/aggregate", { by: timeGroupBy })),
        fetchJson(buildUrl("visits/aggregate", { by: "requestPath", limit: "15" })),
        fetchJson(buildUrl("visits/aggregate", { by: "referrerHostname", limit: "15" })),
        fetchJson(buildUrl("visits/aggregate", { by: "country", limit: "15" })),
        fetchJson(buildUrl("visits/aggregate", { by: "deviceType", limit: "10" })),
        fetchJson(buildUrl("visits/aggregate", { by: "osName", limit: "10" })),
      ]);

    const timeseries = Array.isArray(timeSeriesRes?.data)
      ? timeSeriesRes.data.map((item: any) => ({
          timestamp: item.timestamp,
          pageviews: Number(item.pageviews || 0),
          visitors: Number(item.visitors || 0),
        }))
      : [];

    const totalPageviews = timeseries.reduce(
      (sum: number, item: any) => sum + item.pageviews,
      0
    );
    const totalVisitors = timeseries.reduce(
      (sum: number, item: any) => sum + item.visitors,
      0
    );

    const paths = Array.isArray(pathsRes?.data)
      ? pathsRes.data.map((item: any) => ({
          path: item.requestPath || "/",
          pageviews: Number(item.pageviews || 0),
          visitors: Number(item.visitors || 0),
        }))
      : [];

    const referrers = Array.isArray(referrersRes?.data)
      ? referrersRes.data.map((item: any) => ({
          referrer: item.referrerHostname || "Direct",
          pageviews: Number(item.pageviews || 0),
          visitors: Number(item.visitors || 0),
        }))
      : [];

    const countries = Array.isArray(countriesRes?.data)
      ? countriesRes.data.map((item: any) => ({
          country: item.country || "Inconnu",
          pageviews: Number(item.pageviews || 0),
          visitors: Number(item.visitors || 0),
        }))
      : [];

    const devices = Array.isArray(devicesRes?.data)
      ? devicesRes.data.map((item: any) => ({
          device: item.deviceType || "Autre",
          pageviews: Number(item.pageviews || 0),
          visitors: Number(item.visitors || 0),
        }))
      : [];

    const os = Array.isArray(osRes?.data)
      ? osRes.data.map((item: any) => ({
          os: item.osName || "Autre",
          pageviews: Number(item.pageviews || 0),
          visitors: Number(item.visitors || 0),
        }))
      : [];

    const avgViewsPerVisitor =
      totalVisitors > 0 ? Number((totalPageviews / totalVisitors).toFixed(2)) : 0;

    const responseData: AnalyticsResponse = {
      configured: true,
      period,
      since,
      until,
      summary: {
        pageviews: totalPageviews,
        visitors: totalVisitors,
        avgViewsPerVisitor,
      },
      timeseries,
      paths,
      referrers,
      countries,
      devices,
      os,
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    return NextResponse.json(
      { configured: true, error: err.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
