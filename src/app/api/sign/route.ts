import { db } from "../../../../database/drizzle";
import { signatureTable } from "../../../../database/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "no image provided" }, { status: 400 });
    }

    const [newSign] = await db
      .insert(signatureTable)
      .values({ image })
      .returning();

    return NextResponse.json({ success: true, data: newSign });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save signature" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const signatures = await db
      .select()
      .from(signatureTable)
      .orderBy(signatureTable.createdAt);
    return NextResponse.json({ success: true, data: signatures });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch signatures" },
      { status: 500 }
    );
  }
}
