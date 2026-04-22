import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/portal-tasks
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const tasks = await prisma.portalTask.findMany({
    where: { trainerId: trainer.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(tasks);
}

// POST /api/portal-tasks
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as { title: string; description?: string };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });
  }

  const task = await prisma.portalTask.create({
    data: {
      trainerId:   trainer.id,
      title:       body.title.trim(),
      description: body.description?.trim() ?? null,
      completed:   false,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

// PATCH /api/portal-tasks – alterna completed
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as { id: string; completed: boolean };

  const updated = await prisma.portalTask.updateMany({
    where: { id: body.id, trainerId: trainer.id },
    data: { completed: body.completed },
  });

  return NextResponse.json({ ok: updated.count > 0 });
}
