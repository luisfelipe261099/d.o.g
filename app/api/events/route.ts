import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureTrainer(userId: string) {
  const existing = await prisma.trainer.findUnique({ where: { userId } });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) return null;

  const fallbackName = user.email?.split("@")[0]?.trim() || "Adestrador";

  return prisma.trainer.create({
    data: {
      userId,
      name: user.name?.trim() || fallbackName,
    },
  });
}

// GET /api/events
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const role = ((session.user as { role?: string }).role ?? "").toLowerCase();
  if (role !== "trainer") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const trainer = await ensureTrainer(session.user.id);
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
  const role = ((session.user as { role?: string }).role ?? "").toLowerCase();
  if (role !== "trainer") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const trainer = await ensureTrainer(session.user.id);
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    clientId?: string;
    dogId?: string;
    day: string;
    time: string;
    dog?: string;
    client?: string;
    plan?: string;
    sessionNumber?: number;
    status?: "Confirmado" | "Pendente" | "Aguardando" | "Recorrente" | "Cancelado";
  };

  const clientId = (body.clientId ?? "").trim();
  const dogId = (body.dogId ?? "").trim();

  if (!clientId || !dogId) {
    return NextResponse.json({ error: "clientId e dogId são obrigatórios" }, { status: 400 });
  }

  const dog = await prisma.dog.findFirst({
    where: {
      id: dogId,
      clientId,
      client: {
        trainerId: trainer.id,
      },
    },
    select: {
      id: true,
      name: true,
      client: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
    },
  });

  if (!dog) {
    return NextResponse.json({ error: "Cliente ou cão inválido para este adestrador" }, { status: 404 });
  }

  const created = await prisma.calendarEvent.create({
    data: {
      trainerId:     trainer.id,
      clientId:      dog.client.id,
      dogId:         dog.id,
      day:           body.day,
      time:          body.time,
      dog:           dog.name,
      client:        dog.client.name,
      plan:          body.plan?.trim() || dog.client.plan || "",
      sessionNumber: body.sessionNumber ?? 1,
      status:        body.status        ?? "Pendente",
    },
  });

  return NextResponse.json(created, { status: 201 });
}

// PATCH /api/events – atualiza status de um evento
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const role = ((session.user as { role?: string }).role ?? "").toLowerCase();
  if (role !== "trainer") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const trainer = await ensureTrainer(session.user.id);
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    id: string;
    status: "Confirmado" | "Pendente" | "Aguardando" | "Recorrente" | "Cancelado";
  };

  const allowedStatuses = new Set(["Confirmado", "Pendente", "Aguardando", "Recorrente", "Cancelado"]);
  if (!allowedStatuses.has(body.status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const updated = await prisma.calendarEvent.updateMany({
    where: { id: body.id, trainerId: trainer.id },
    data: { status: body.status },
  });

  return NextResponse.json({ ok: updated.count > 0 });
}
