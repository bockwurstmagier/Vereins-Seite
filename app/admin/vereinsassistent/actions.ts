"use server";

import { requireRole } from "../../../lib/auth/roles";
import {
  answerClubQuestion,
  type ClubAssistantAnswer,
} from "../../../lib/assistant/club-assistant";

export async function askClubAssistant(
  question: string,
): Promise<ClubAssistantAnswer> {
  await requireRole([
    "administrator",
    "vorstand",
    "trainer",
    "social_media",
    "betreuer",
  ]);

  const trimmed = question.trim();

  if (trimmed.length > 500) {
    throw new Error("Die Frage darf maximal 500 Zeichen lang sein.");
  }

  return answerClubQuestion(trimmed);
}
