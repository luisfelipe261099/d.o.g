import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/payments
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const payments = await prisma.payment.findMany({
    where:   { trainerId: trainer.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}

// PATCH /api/payments  – marca como pago
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json() as { id: string };

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const updated = await prisma.payment.updateMany({
    where: { id: body.id, trainerId: trainer.id },
    data:  { status: "Pago" },
  });

  return NextResponse.json({ ok: updated.count > 0 });
}

// POST /api/payments  – cria nova cobrança
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    clientId?: string;
    clientName: string;
    amount: number;
    source?: string;
    paymentMethod?: string;
    dueDate?: string;
    reference?: string;
  };

  const payment = await prisma.payment.create({
    data: {
      trainerId:     trainer.id,
      clientId:      body.clientId,
      clientName:    body.clientName,
      amount:        body.amount,
      status:        "Pendente",
      source:        body.source        ?? "Cliente",
      paymentMethod: body.paymentMethod,
      dueDate:       body.dueDate,
      reference:     body.reference,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
