import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const user = await currentUser();
  const { notes, selectedDoctor } = await request.json();

  try {
    const sessionId = uuidv4()
    const result = await prisma.session.create({
      data: {
        sessionId,
        createdBy: user?.emailAddresses[0]?.emailAddress || 'unknown',
        notes: notes || "",
        createdOn: new Date().toString(),
        selectedDocter: selectedDoctor || null,
      }
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error("Error creating session:", e);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress || 'unknown';

    const result = await prisma.session.findFirst({
      where: {
        sessionId: sessionId,
          
        ...(userEmail !== 'unknown' ? { createdBy: userEmail } : {})
      },
    })

    if (!result) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}