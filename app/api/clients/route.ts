import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DOG_BREED_DEFAULTS: Array<{ keywords: string[]; url: string }> = [
  {
    keywords: ["golden retriever", "golden"],
    url: "https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg",
  },
  {
    keywords: ["labrador"],
    url: "https://images.dog.ceo/breeds/labrador/n02099712_6856.jpg",
  },
  {
    keywords: ["border collie", "collie"],
    url: "https://images.dog.ceo/breeds/collie-border/n02106166_355.jpg",
  },
  {
    keywords: ["pastor alemao", "german shepherd", "pastor"],
    url: "https://images.dog.ceo/breeds/germanshepherd/n02106662_24175.jpg",
  },
  {
    keywords: ["poodle"],
    url: "https://images.dog.ceo/breeds/poodle-standard/n02113799_2280.jpg",
  },
  {
    keywords: ["spitz", "lulu da pomerania", "pomerania"],
    url: "https://images.dog.ceo/breeds/pomeranian/n02112018_1002.jpg",
  },
  {
    keywords: ["bulldog"],
    url: "https://images.dog.ceo/breeds/bulldog-french/n02108915_5306.jpg",
  },
  {
    keywords: ["beagle"],
    url: "https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg",
  },
  {
    keywords: ["rottweiler", "rott"],
    url: "https://images.dog.ceo/breeds/rottweiler/n02106550_10620.jpg",
  },
  {
    keywords: ["shih tzu", "shitzu"],
    url: "https://images.dog.ceo/breeds/shihtzu/n02086240_2329.jpg",
  },
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function sanitizePhotoUrl(photoUrl?: string): string | undefined {
  const value = (photoUrl ?? "").trim();
  if (!value) return undefined;

  if (value.startsWith("data:image/")) return value;
  if (/^https?:\/\//i.test(value)) return value;

  return undefined;
}

function getDefaultDogPhotoByBreed(breed?: string): string | undefined {
  const normalizedBreed = normalizeText(breed ?? "");
  if (!normalizedBreed) return undefined;

  for (const item of DOG_BREED_DEFAULTS) {
    if (item.keywords.some((keyword) => normalizedBreed.includes(normalizeText(keyword)))) {
      return item.url;
    }
  }

  return undefined;
}

function getNextChargeDate(billingDay: number): string {
  const now = new Date();
  const safeDay = Math.min(Math.max(billingDay, 1), 28);
  const next = new Date(now.getFullYear(), now.getMonth(), safeDay);

  if (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }

  return next.toLocaleDateString("pt-BR");
}

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
    photoUrl?: string;
    trainingTypes?: string[];
  };

  const billingDay = body.billingDay ?? 10;
  const contractAmount = body.contractAmount ?? 0;
  const paymentMethod = body.paymentMethod ?? "Pix";
  const nextChargeDate = getNextChargeDate(billingDay);
  const resolvedDogPhotoUrl = sanitizePhotoUrl(body.photoUrl) ?? getDefaultDogPhotoByBreed(body.breed);

  const client = await prisma.$transaction(async (tx) => {
    const createdClient = await tx.clientProfile.create({
      data: {
        trainerId:      trainer.id,
        name:           body.clientName,
        phone:          body.phone          ?? "",
        propertyType:   body.propertyType   ?? "",
        environment:    body.environment    ?? "",
        plan:           body.plan           ?? "",
        contractAmount,
        billingDay,
        paymentMethod,
        nextChargeDate,
        dogs: {
          create: {
            name:          body.dogName,
            breed:         body.breed         ?? "",
            age:           body.age           ?? "",
            weight:        body.weight        ?? "",
            photoUrl:      resolvedDogPhotoUrl,
            trainingTypes: JSON.stringify(body.trainingTypes ?? []),
          },
        },
      },
      include: { dogs: true },
    });

    await tx.payment.create({
      data: {
        trainerId: trainer.id,
        clientId: createdClient.id,
        clientName: createdClient.name,
        amount: contractAmount,
        status: "Pendente",
        source: "Cliente",
        paymentMethod,
        dueDate: nextChargeDate,
        reference: createdClient.plan ?? "",
      },
    });

    return createdClient;
  });

  return NextResponse.json(client, { status: 201 });
}
