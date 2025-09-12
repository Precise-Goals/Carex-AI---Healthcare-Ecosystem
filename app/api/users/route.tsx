import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { currentUser } from "@clerk/nextjs/server";

declare global {
  var prisma: PrismaClient | undefined;
}


let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {

  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

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