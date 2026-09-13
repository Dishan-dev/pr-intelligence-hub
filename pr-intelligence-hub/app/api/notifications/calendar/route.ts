import { NextResponse } from "next/server";

import { PR_CALENDAR_DATES } from "@/lib/data/pr-calendar";
import { sendGoogleChatNotification } from "@/lib/notifications/google-chat";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const currentMonth = today.getUTCMonth() + 1;
  const currentDay = today.getUTCDate();
  const year = today.getUTCFullYear();
  const reminders = [15, 10, 1]
    .map((daysBefore) => {
      const target = new Date(Date.UTC(year, today.getUTCMonth(), currentDay + daysBefore));
      return {
        daysBefore,
        month: target.getUTCMonth() + 1,
        day: target.getUTCDate(),
      };
    })
    .filter((reminder) => reminder.month !== currentMonth || reminder.day !== currentDay);

  const dueDates = PR_CALENDAR_DATES.filter((date) =>
    reminders.some((reminder) => reminder.month === date.month && reminder.day === date.day),
  );
  if (dueDates.length === 0) return NextResponse.json({ sent: 0, date: today.toISOString().slice(0, 10) });

  const message = [
    "CS PR HUB: Upcoming PR calendar dates",
    ...dueDates.map((date) => {
      const target = reminders.find((reminder) => reminder.month === date.month && reminder.day === date.day);
      return `• ${date.name} (${date.category}) - ${target?.daysBefore} days from now\n  PR angle: ${date.prAngle}`;
    }),
  ].join("\n");
  const sent = await sendGoogleChatNotification(message);
  return NextResponse.json({ sent: sent ? dueDates.length : 0, date: today.toISOString().slice(0, 10) });
}
