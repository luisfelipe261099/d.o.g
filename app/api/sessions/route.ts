import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/sessions
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const sessions = await prisma.trainingSession.findMany({
    where:   { trainerId: trainer.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions.map((s) => ({
    ...s,
    notes: JSON.parse(s.notes || "[]"),
  })));
}

// POST /api/sessions
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    number?: number;
    title: string;
    date: string;
    clientName?: string;
    dogId?: string;
    dogName?: string;
    notes?: unknown[];
  };

  const created = await prisma.trainingSession.create({
    data: {
      trainerId:  trainer.id,
      number:     body.number    ?? 1,
      title:      body.title,
      date:       body.date,
      clientName: body.clientName ?? "",
      dogId:      body.dogId,
      dogName:    body.dogName    ?? "",
      notes:      JSON.stringify(body.notes ?? []),
    },
  });

  return NextResponse.json({ ...created, notes: body.notes ?? [] }, { status: 201 });
}
