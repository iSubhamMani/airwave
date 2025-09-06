import { Redis } from "ioredis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const meetId = req.nextUrl.searchParams.get("meetId");
  const redis = new Redis(process.env.REDIS_URL!);

  if (!meetId) {
    return NextResponse.json(
      { error: "Missing meetId parameter" },
      { status: 400 }
    );
  }

  const meetingData = await redis.get(meetId);
  if (!meetingData) {
    return NextResponse.json(
      { error: "Podcast not found", success: false },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
