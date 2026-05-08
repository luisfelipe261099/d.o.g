// Lógica pura de gamificação (compartilhada entre cliente e servidor).
// Não importa nada de "next" / "react" / "prisma".

export const XP_PER_LEVEL = 100;

export type GamificationAction =
  | "task_completed"
  | "task_uncompleted"
  | "video_watched"
  | "feedback_sent"
  | "trainer_rated"
  | "session_rated"
  | "daily_visit";

export const POINTS: Record<GamificationAction, number> = {
  task_completed: 20,
  task_uncompleted: -20,
  video_watched: 15,
  feedback_sent: 10,
  trainer_rated: 25,
  session_rated: 15,
  daily_visit: 5,
};

export type Badge = {
  id: string;
  label: string;
  icon: string;
  description: string;
  unlocked: boolean;
};

export const BADGES_DEF: Omit<Badge, "unlocked">[] = [
  { id: "first_task", label: "Primeira tarefa", icon: "🎯", description: "Concluiu sua primeira tarefa de casa." },
  { id: "five_tasks", label: "Treinador dedicado", icon: "🏅", description: "Concluiu 5 tarefas." },
  { id: "ten_tasks", label: "Mestre das tarefas", icon: "🏆", description: "Concluiu 10 tarefas." },
  { id: "first_video", label: "Espectador atento", icon: "🎬", description: "Assistiu seu primeiro vídeo do cão." },
  { id: "first_feedback", label: "Comunicação aberta", icon: "💬", description: "Enviou seu primeiro comentário." },
  { id: "rated_trainer", label: "Parceria avaliada", icon: "⭐", description: "Avaliou o adestrador." },
  { id: "streak_3", label: "Constância", icon: "🔥", description: "3 dias seguidos no portal." },
  { id: "streak_7", label: "Rotina forte", icon: "🚀", description: "7 dias seguidos no portal." },
  { id: "level_3", label: "Nível 3", icon: "📈", description: "Alcançou o nível 3." },
  { id: "level_5", label: "Nível 5", icon: "👑", description: "Alcançou o nível 5." },
];

// Estado bruto persistido no banco
export type RawGamification = {
  points: number;
  streakDays: number;
  lastVisitDate: string;
  watchedVideos: string[];
  trainerRating: number;
  sessionRatings: Record<string, number>;
  totalTasksCompleted: number;
  totalFeedbacks: number;
};

// Estado público entregue ao cliente (com derivados)
export type GamificationState = RawGamification & {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  badges: Badge[];
};

export function emptyRawGamification(): RawGamification {
  return {
    points: 0,
    streakDays: 0,
    lastVisitDate: "",
    watchedVideos: [],
    trainerRating: 0,
    sessionRatings: {},
    totalTasksCompleted: 0,
    totalFeedbacks: 0,
  };
}

export function todayKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isYesterday(prev: string, today: string): boolean {
  if (!prev) return false;
  const yesterday = new Date(`${today}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return prev === yesterday.toISOString().slice(0, 10);
}

function computeBadges(raw: RawGamification, level: number): Badge[] {
  return BADGES_DEF.map((badge) => {
    let unlocked = false;
    if (badge.id === "first_task" && raw.totalTasksCompleted >= 1) unlocked = true;
    if (badge.id === "five_tasks" && raw.totalTasksCompleted >= 5) unlocked = true;
    if (badge.id === "ten_tasks" && raw.totalTasksCompleted >= 10) unlocked = true;
    if (badge.id === "first_video" && raw.watchedVideos.length >= 1) unlocked = true;
    if (badge.id === "first_feedback" && raw.totalFeedbacks >= 1) unlocked = true;
    if (badge.id === "rated_trainer" && raw.trainerRating > 0) unlocked = true;
    if (badge.id === "streak_3" && raw.streakDays >= 3) unlocked = true;
    if (badge.id === "streak_7" && raw.streakDays >= 7) unlocked = true;
    if (badge.id === "level_3" && level >= 3) unlocked = true;
    if (badge.id === "level_5" && level >= 5) unlocked = true;
    return { ...badge, unlocked };
  });
}

export function buildPublicState(raw: RawGamification): GamificationState {
  const points = Math.max(0, raw.points);
  const level = Math.floor(points / XP_PER_LEVEL) + 1;
  const xpInLevel = points % XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - xpInLevel;
  return {
    ...raw,
    points,
    level,
    xpInLevel,
    xpToNext,
    badges: computeBadges(raw, level),
  };
}

export type ApplyActionInput =
  | { action: "task_completed"; taskId?: string }
  | { action: "task_uncompleted"; taskId?: string }
  | { action: "feedback_sent" }
  | { action: "trainer_rated"; rating: number }
  | { action: "session_rated"; sessionId: string; rating: number }
  | { action: "video_watched"; videoId: string };

export type ApplyActionResult = {
  raw: RawGamification;
  earned: number;
  reason: string;
};

export function applyAction(current: RawGamification, input: ApplyActionInput): ApplyActionResult {
  const next: RawGamification = {
    ...current,
    watchedVideos: [...current.watchedVideos],
    sessionRatings: { ...current.sessionRatings },
  };
  let earned = 0;
  let reason = "";

  switch (input.action) {
    case "task_completed":
      earned = POINTS.task_completed;
      reason = "Tarefa concluída";
      next.points += earned;
      next.totalTasksCompleted += 1;
      break;
    case "task_uncompleted":
      next.points = Math.max(0, next.points + POINTS.task_uncompleted);
      next.totalTasksCompleted = Math.max(0, next.totalTasksCompleted - 1);
      break;
    case "feedback_sent":
      earned = POINTS.feedback_sent;
      reason = "Comentário enviado";
      next.points += earned;
      next.totalFeedbacks += 1;
      break;
    case "trainer_rated": {
      const wasRated = next.trainerRating > 0;
      next.trainerRating = Math.max(1, Math.min(5, Math.round(input.rating)));
      if (!wasRated) {
        earned = POINTS.trainer_rated;
        reason = "Avaliou o adestrador";
        next.points += earned;
      }
      break;
    }
    case "session_rated": {
      const wasRated = Boolean(next.sessionRatings[input.sessionId]);
      next.sessionRatings[input.sessionId] = Math.max(1, Math.min(5, Math.round(input.rating)));
      if (!wasRated) {
        earned = POINTS.session_rated;
        reason = "Avaliou uma aula";
        next.points += earned;
      }
      break;
    }
    case "video_watched": {
      if (!next.watchedVideos.includes(input.videoId)) {
        next.watchedVideos.push(input.videoId);
        earned = POINTS.video_watched;
        reason = "Vídeo assistido";
        next.points += earned;
      }
      break;
    }
  }

  return { raw: next, earned, reason };
}

// Aplica visita diária se ainda não foi computada hoje (idempotente por dia).
export function maybeApplyDailyVisit(current: RawGamification, today: string = todayKey()): ApplyActionResult {
  if (current.lastVisitDate === today) {
    return { raw: current, earned: 0, reason: "" };
  }

  const continuesStreak = isYesterday(current.lastVisitDate, today);
  const next: RawGamification = {
    ...current,
    points: current.points + POINTS.daily_visit,
    streakDays: continuesStreak ? current.streakDays + 1 : 1,
    lastVisitDate: today,
  };

  return { raw: next, earned: POINTS.daily_visit, reason: "Visita diária" };
}
