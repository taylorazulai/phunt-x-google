import { NextRequest, NextResponse } from "next/server";
import { LeadRecord } from "@/lib/types";
import { saveLead } from "@/lib/kv";
import { nanoid } from "nanoid";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, email, pageId, sourceAction = "copy_html" } = body;

    const trimmedFirst = typeof firstName === "string" ? firstName.trim() : "";
    const trimmedLast = typeof lastName === "string" ? lastName.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedFirst) {
      return NextResponse.json(
        { success: false, error: "First name is required." },
        { status: 400 }
      );
    }

    if (!trimmedLast) {
      return NextResponse.json(
        { success: false, error: "Last name is required." },
        { status: 400 }
      );
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "A valid work email address is required." },
        { status: 400 }
      );
    }

    const leadRecord: LeadRecord = {
      id: `lead_${nanoid(10)}`,
      firstName: trimmedFirst,
      lastName: trimmedLast,
      name: `${trimmedFirst} ${trimmedLast}`,
      email: trimmedEmail,
      pageId: typeof pageId === "string" ? pageId : undefined,
      sourceAction: sourceAction || "copy_html",
      createdAt: Date.now(),
    };

    await saveLead(leadRecord);

    return NextResponse.json(
      {
        success: true,
        leadId: leadRecord.id,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Error in /api/leads route:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to record lead",
      },
      { status: 500 }
    );
  }
}
