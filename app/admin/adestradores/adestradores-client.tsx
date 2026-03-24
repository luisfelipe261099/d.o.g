"use client";

import { useState } from "react";

const mockTrainers = [
  {
    id: "trainer-1",
    name: "Marina Costa",
    email: "marina@email.com",
    joinedAt: "15/02/2024",
    status: "Ativo",
    planType: "Pro",
    monthlyValue: "R$ 690",
  },
  {
    id: "trainer-2",
    name: "Carla Nunes",
    email: "carla@email.com",
    joinedAt: "10/03/2024",
    status: "Ativo",
    planType: "Essencial",
    monthlyValue: "R$ 420",
  },
  {
    id: "trainer-3",
    name: "Rafael Prado",
    email: "rafael@email.com",
    joinedAt: "05/03/2024",
    status: "Ativo",
    planType: "Premium",
    monthlyValue: "R$ 990",
  },
];

export function AdestradoresClient() {
  const [filter, setFilter] = useState("todos");

  const filteredTrainers = filter === "todos" ? mockTrainers : mockTrainers.filter((t) => t.status === filter);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { value: "todos", label: "Todos" },
            { value: "Ativo", label: "Ativos" },
            { value: "Inativo", label: "Inativos" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition border ${
                filter === option.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-700 bg-white text-slate-900 font-bold"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button className="rounded-full bg-sky-600 px-6 py-3 text-base font-bold text-white hover:bg-sky-700">
          + Novo Adestrador
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100">
                <th className="px-6 py-4 text-left font-bold text-slate-900 text-base">Nome</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900 text-base">Email</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900 text-base">Plano</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900 text-base">Receita</th>
                <th className="px-6 py-4 text-left font-bold text-slate-900 text-base">Status</th>
                <th className="px-6 py-4 text-right font-bold text-slate-900 text-base">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrainers.map((trainer) => (
                <tr key={trainer.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 text-base">{trainer.name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{trainer.email}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{trainer.planType}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-base">{trainer.monthlyValue}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                      {trainer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sky-700 hover:text-sky-900 font-bold text-base">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
