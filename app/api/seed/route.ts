import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// POST /api/seed  – cria adestrador Luis + dados completos no TiDB Cloud
// Protegido por SEED_SECRET no header x-seed-secret
export async function POST(request: Request) {
  const secret = request.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const log: string[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      // ── 1. Usuários base ──────────────────────────────────────────────────

      const seedUsers = [
        { email: "luis@pegadacerta.com.br",    password: "luis123",  role: "TRAINER" as const, name: "Luis Araújo" },
        { email: "admin@pegadacerta.com.br",    password: "admin123", role: "ADMIN"   as const, name: "Admin PegadaCerta" },
      ];

      const trainerUserId = await (async () => {
        for (const u of seedUsers) {
          const exists = await tx.user.findUnique({ where: { email: u.email } });
          if (exists) {
            log.push(`já existe: ${u.email}`);
            if (u.role === "TRAINER") return exists.id;
            continue;
          }
          const created = await tx.user.create({
            data: {
              email:    u.email,
              password: await bcrypt.hash(u.password, 12),
              role:     u.role,
              name:     u.name,
            },
          });
          log.push(`usuário criado: ${u.email}`);
          if (u.role === "TRAINER") return created.id;
        }
        throw new Error("Erro ao criar usuário trainer");
      })();

      // ── 2. Trainer ────────────────────────────────────────────────────────

      let trainer = await tx.trainer.findUnique({ where: { userId: trainerUserId } });
      if (!trainer) {
        trainer = await tx.trainer.create({
          data: {
            userId: trainerUserId,
            name:   "Luis Araújo",
            plan:   "Pro",
          },
        });
        log.push("trainer criado: Luis Araújo");
      } else {
        log.push("trainer já existe, pulando criação");
      }

      const trainerId = trainer.id;

      // ── 3. Clientes + cães ────────────────────────────────────────────────

      const existingClients = await tx.clientProfile.findMany({ where: { trainerId } });
      if (existingClients.length > 0) {
        log.push("clientes já existem, pulando seed de clientes/cães/sessões/eventos/pagamentos");
        return;
      }

      // Cliente 1 — Felipe Magalhães + Apolo
      const felipe = await tx.clientProfile.create({
        data: {
          trainerId,
          name:           "Felipe Magalhães",
          phone:          "(11) 98877-3344",
          propertyType:   "Apartamento",
          environment:    "Condomínio com elevador movimentado, duas crianças pequenas e visitas frequentes.",
          plan:           "Plano Pro • 12 sessões",
          contractAmount: 780,
          billingDay:     8,
          paymentMethod:  "Pix",
          nextChargeDate: "08/05/2026",
        },
      });

      const apolo = await tx.dog.create({
        data: {
          clientId:      felipe.id,
          name:          "Apolo",
          breed:         "Border Collie",
          age:           "3 anos",
          weight:        "24 kg",
          photoUrl:      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
          trainingTypes: JSON.stringify(["Reatividade", "Guia", "Place"]),
        },
      });

      log.push("cliente criado: Felipe Magalhães + cão Apolo");

      // Cliente 2 — Juliana Rocha + Luna
      const juliana = await tx.clientProfile.create({
        data: {
          trainerId,
          name:           "Juliana Rocha",
          phone:          "(21) 99266-8801",
          propertyType:   "Casa com quintal",
          environment:    "Quintal amplo com acesso à rua, dois gatos e rotina home office.",
          plan:           "Pacote Filhotes • 8 sessões",
          contractAmount: 520,
          billingDay:     15,
          paymentMethod:  "Cartao",
          nextChargeDate: "15/05/2026",
        },
      });

      const luna = await tx.dog.create({
        data: {
          clientId:      juliana.id,
          name:          "Luna",
          breed:         "Golden Retriever",
          age:           "5 meses",
          weight:        "14 kg",
          photoUrl:      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
          trainingTypes: JSON.stringify(["Filhotes", "Guia", "Obediência"]),
        },
      });

      log.push("cliente criado: Juliana Rocha + cão Luna");

      // ── 4. Sessões de treino ──────────────────────────────────────────────

      await tx.trainingSession.createMany({
        data: [
          {
            trainerId,
            dogId:      apolo.id,
            clientName: "Felipe Magalhães",
            dogName:    "Apolo",
            number:     1,
            title:      "Visita inicial — avaliação de linha de base",
            date:       "02/04/2026",
            notes:      JSON.stringify([
              { block: "Guia",        score: 5, comment: "Puxava muito no início, mas respondeu bem às mudanças de direção após ajuste de ritmo." },
              { block: "Reatividade", score: 4, comment: "Latiu para dois cães na calçada. Distância de segurança ainda necessária acima de 8 m." },
            ]),
          },
          {
            trainerId,
            dogId:      apolo.id,
            clientName: "Felipe Magalhães",
            dogName:    "Apolo",
            number:     4,
            title:      "Foco e controle no elevador",
            date:       "10/04/2026",
            notes:      JSON.stringify([
              { block: "Guia",  score: 8, comment: "Evolução clara — guia frouxa mantida por 15 min com apenas 2 correções." },
              { block: "Place", score: 7, comment: "Permaneceu no place com distração de porta em 3 de 4 tentativas." },
            ]),
          },
          {
            trainerId,
            dogId:      luna.id,
            clientName: "Juliana Rocha",
            dogName:    "Luna",
            number:     1,
            title:      "Base de filhote — nome e foco",
            date:       "07/04/2026",
            notes:      JSON.stringify([
              { block: "Nome", score: 9, comment: "Respondeu ao nome com 100% de taxa em ambiente interno. Pronta para generalização externa." },
              { block: "Guia", score: 5, comment: "Ainda puxa em distâncias longas. Ciclos curtos com pausa mostraram resultado positivo." },
            ]),
          },
          {
            trainerId,
            dogId:      luna.id,
            clientName: "Juliana Rocha",
            dogName:    "Luna",
            number:     2,
            title:      "Socialização e autocontrole",
            date:       "12/04/2026",
            notes:      JSON.stringify([
              { block: "Autocontrole", score: 7, comment: "Esperou sinal antes de entrar na cozinha em 4 de 5 tentativas. Ótima evolução para a idade." },
              { block: "Obediência",   score: 6, comment: "Senta e deita com reforço contínuo. Próxima etapa: reduzir frequência do reforço." },
            ]),
          },
        ],
      });

      log.push("4 sessões de treino criadas");

      // ── 5. Eventos de agenda ─────────────────────────────────────────────

      await tx.calendarEvent.createMany({
        data: [
          {
            trainerId,
            day:           "Terça",
            time:          "08:30",
            dog:           "Luna",
            client:        "Juliana Rocha",
            plan:          "Filhotes • generalização de nome em ambiente externo",
            sessionNumber: 3,
            status:        "Confirmado",
          },
          {
            trainerId,
            day:           "Quinta",
            time:          "18:00",
            dog:           "Apolo",
            client:        "Felipe Magalhães",
            plan:          "Reatividade • rua com exposição gradual a outros cães",
            sessionNumber: 5,
            status:        "Aguardando",
          },
          {
            trainerId,
            day:           "Sábado",
            time:          "10:00",
            dog:           "Luna",
            client:        "Juliana Rocha",
            plan:          "Guia e autocontrole • parque com distrações",
            sessionNumber: 4,
            status:        "Pendente",
          },
        ],
      });

      log.push("3 eventos de agenda criados");

      // ── 6. Pagamentos ─────────────────────────────────────────────────────

      await tx.payment.createMany({
        data: [
          {
            trainerId,
            clientId:      felipe.id,
            clientName:    "Felipe Magalhães",
            amount:        780,
            status:        "Pendente",
            source:        "Cliente",
            paymentMethod: "Pix",
            dueDate:       "08/05/2026",
            reference:     "Plano Pro • 12 sessões",
          },
          {
            trainerId,
            clientId:      felipe.id,
            clientName:    "Felipe Magalhães",
            amount:        780,
            status:        "Pago",
            source:        "Cliente",
            paymentMethod: "Pix",
            dueDate:       "08/04/2026",
            reference:     "Plano Pro • 12 sessões",
          },
          {
            trainerId,
            clientId:      juliana.id,
            clientName:    "Juliana Rocha",
            amount:        520,
            status:        "Pago",
            source:        "Cliente",
            paymentMethod: "Cartao",
            dueDate:       "15/04/2026",
            reference:     "Pacote Filhotes • 8 sessões",
          },
        ],
      });

      log.push("3 pagamentos criados");
    });
  } catch (err) {
    console.error("[seed] erro:", err);
    return NextResponse.json({ error: "Erro no seed", detail: String(err) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, log });
}
