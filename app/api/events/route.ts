import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/events
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const events = await prisma.calendarEvent.findMany({
    where:   { trainerId: trainer.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}

// POST /api/events
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    day: string;
    time: string;
    dog: string;
    client: string;
    plan?: string;
    sessionNumber?: number;
  };

  const created = await prisma.calendarEvent.create({
    data: {
      trainerId:     trainer.id,
      day:           body.day,
      time:          body.time,
      dog:           body.dog,
      client:        body.client,
      plan:          body.plan          ?? "",
      sessionNumber: body.sessionNumber ?? 1,
      status:        "Confirmado",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
