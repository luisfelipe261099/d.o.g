import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function assertAdmin(role?: string) {
  return role === "ADMIN";
}

function planToMonthlyValue(plan: string): number {
  if (plan === "Premium") return 990;
  if (plan === "Pro") return 690;
  if (plan === "Essencial") return 420;
  return 0;
}

// GET /api/admin/trainers
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!assertAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const trainers = await prisma.trainer.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    trainers.map((trainer) => ({
      id: trainer.id,
      userId: trainer.userId,
      name: trainer.name,
      email: trainer.user.email,
      joinedAt: trainer.createdAt.toLocaleDateString("pt-BR"),
      status: trainer.plan === "Trial" ? "Trial" : "Ativo",
      planType: trainer.plan,
      monthlyValue: planToMonthlyValue(trainer.plan),
    })),
  );
}

// POST /api/admin/trainers
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!assertAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json() as {
    name?: string;
    email?: string;
    planType?: "Essencial" | "Pro" | "Premium" | "Trial";
    status?: "Ativo" | "Trial";
  };

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const planType = body.planType ?? "Essencial";
  const status = body.status ?? "Ativo";

  if (!name || !email) {
    return NextResponse.json({ error: "Nome e e-mail são obrigatórios" }, { status: 422 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const finalPlan = status === "Trial" ? "Trial" : planType;
  const trialEndsAt = status === "Trial" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash("123456", 12),
        role: "TRAINER",
      },
    });

    const trainer = await tx.trainer.create({
      data: {
        userId: user.id,
        name,
        plan: finalPlan,
        trialEndsAt,
      },
    });

    return { user, trainer };
  });

  return NextResponse.json({
    ok: true,
    trainer: {
      id: created.trainer.id,
      userId: created.trainer.userId,
      name: created.trainer.name,
      email: created.user.email,
      joinedAt: created.trainer.createdAt.toLocaleDateString("pt-BR"),
      status: created.trainer.plan === "Trial" ? "Trial" : "Ativo",
      planType: created.trainer.plan,
      monthlyValue: planToMonthlyValue(created.trainer.plan),
    },
  });
}

// PATCH /api/admin/trainers
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!assertAdmin((session.user as { role?: string }).role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json() as {
    id?: string;
    name?: string;
    email?: string;
    planType?: "Essencial" | "Pro" | "Premium" | "Trial";
    status?: "Ativo" | "Trial";
  };

  if (!body.id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 422 });
  }

  const trainer = await prisma.trainer.findUnique({ where: { id: body.id } });
  if (!trainer) {
    return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });
  }

  const nextStatus = body.status ?? (trainer.plan === "Trial" ? "Trial" : "Ativo");
  const nextPlan = nextStatus === "Trial" ? "Trial" : (body.planType ?? trainer.plan);
  const trialEndsAt = nextStatus === "Trial" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;

  await prisma.$transaction(async (tx) => {
    if (body.name || body.email) {
      await tx.user.update({
        where: { id: trainer.userId },
        data: {
          ...(body.name ? { name: body.name.trim() } : {}),
          ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
        },
      });
    }

    await tx.trainer.update({
      where: { id: trainer.id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        plan: nextPlan,
        trialEndsAt,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
