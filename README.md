# D.O.G Platform Preview

Protótipo visual em Next.js para apresentar a proposta de uma plataforma SaaS para adestradores profissionais de cães.

## Objetivo

Este projeto não implementa backend real. Ele serve para mostrar ao cliente como a plataforma pode ficar antes do desenvolvimento completo.

## Páginas incluídas

- `/` visão geral comercial
- `/dashboard` home do adestrador
- `/clientes` CRM de clientes e cães
- `/treinos` timeline e evolução de sessões
- `/agenda` agenda com confirmações e alertas
- `/portal` portal externo do cliente
- `/financeiro` contratos, cobranças e renovação

## Como rodar

```bash
npm install
npm run dev
```

Depois, abra `http://localhost:3000`.

## Stack do protótipo

- Next.js 16 com App Router
- TypeScript
- Tailwind CSS 4

## Próximo passo natural

Se o cliente aprovar a interface, a evolução recomendada é implementar o MVP com autenticação, banco de dados, agenda, treinos, portal externo e contratos/pagamentos.
