import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    if (!user.emailAddresses || user.emailAddresses.length === 0) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const userName = user.fullName || user.firstName || "User";

    try {

      let userData = await prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });


      if (userData) {
        return NextResponse.json(userData);
      }


      userData = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
          // credit: 10,
        }
      });

      return NextResponse.json(userData);
    } catch (dbError) {
      console.error("Database error:", dbError);

      
      return NextResponse.json({
        id: 0,
        email: userEmail,
        name: userName,
        credit: 10
      });
    }
  } catch (error) {
    console.error("Error processing user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}