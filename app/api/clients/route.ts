import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/clients
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const clients = await prisma.clientProfile.findMany({
    where:   { trainerId: trainer.id },
    include: { dogs: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

// POST /api/clients
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const trainer = await prisma.trainer.findUnique({ where: { userId: session.user.id } });
  if (!trainer) return NextResponse.json({ error: "Adestrador não encontrado" }, { status: 404 });

  const body = await request.json() as {
    clientName: string;
    phone?: string;
    propertyType?: string;
    environment?: string;
    plan?: string;
    contractAmount?: number;
    billingDay?: number;
    paymentMethod?: string;
    dogName: string;
    breed?: string;
    age?: string;
    weight?: string;
    trainingTypes?: string[];
  };

  const client = await prisma.clientProfile.create({
    data: {
      trainerId:      trainer.id,
      name:           body.clientName,
      phone:          body.phone          ?? "",
      propertyType:   body.propertyType   ?? "",
      environment:    body.environment    ?? "",
      plan:           body.plan           ?? "",
      contractAmount: body.contractAmount ?? 0,
      billingDay:     body.billingDay     ?? 10,
      paymentMethod:  body.paymentMethod  ?? "Pix",
      dogs: {
        create: {
          name:          body.dogName,
          breed:         body.breed         ?? "",
          age:           body.age           ?? "",
          weight:        body.weight        ?? "",
          trainingTypes: JSON.stringify(body.trainingTypes ?? []),
        },
      },
    },
    include: { dogs: true },
  });

  return NextResponse.json(client, { status: 201 });
}
