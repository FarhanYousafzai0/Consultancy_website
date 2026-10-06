import type { EligibilityAnswers } from "@/lib/eligibility/types";
import { emptyAnswers } from "@/lib/eligibility/types";
import { filterValidCompletedIds } from "@/lib/after-admission/steps";
import { connectMongo } from "./connect";
import {
  StudentProfileModel,
  docToProfile,
  type StudentProfileRecord,
} from "./student-profile-model";

export type { StudentProfileRecord };

function answersFromBody(body: Partial<EligibilityAnswers>): EligibilityAnswers {
  const base = emptyAnswers();
  return {
    goal: body.goal ?? base.goal,
    qualification: body.qualification ?? base.qualification,
    gradeSystem: body.gradeSystem ?? base.gradeSystem,
    gradeValue: body.gradeValue ?? base.gradeValue,
    percentagePassMark: body.percentagePassMark ?? base.percentagePassMark,
    field: body.field ?? base.field,
    englishTest: body.englishTest ?? base.englishTest,
    englishScore: body.englishScore ?? base.englishScore,
    germanLevel: body.germanLevel ?? base.germanLevel,
    completedAt: body.completedAt ?? base.completedAt,
  };
}

export async function getStudentProfile(
  userId: string
): Promise<StudentProfileRecord | null> {
  await connectMongo();
  const doc = await StudentProfileModel.findOne({ userId }).lean();
  return doc ? docToProfile(doc as never) : null;
}

export async function upsertStudentProfile(
  userId: string,
  body: Partial<EligibilityAnswers>
): Promise<StudentProfileRecord> {
  await connectMongo();
  const answers = answersFromBody(body);
  const doc = await StudentProfileModel.findOneAndUpdate(
    { userId },
    { $set: { userId, ...answers } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return docToProfile(doc as never);
}

export async function setAfterAdmissionCompleted(
  userId: string,
  completed: string[]
): Promise<StudentProfileRecord> {
  await connectMongo();
  const afterAdmissionCompleted = filterValidCompletedIds(completed);
  const doc = await StudentProfileModel.findOneAndUpdate(
    { userId },
    {
      $set: { afterAdmissionCompleted },
      $setOnInsert: { userId },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return docToProfile(doc as never);
}

export async function setSopReviewUnlocked(
  userId: string,
  unlocked: boolean
): Promise<StudentProfileRecord | null> {
  await connectMongo();
  const doc = await StudentProfileModel.findOneAndUpdate(
    { userId },
    { $set: { sopReviewUnlocked: unlocked }, $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return doc ? docToProfile(doc as never) : null;
}

export async function addAiCredits(
  userId: string,
  amount: number
): Promise<StudentProfileRecord | null> {
  if (!Number.isFinite(amount) || amount === 0) return getStudentProfile(userId);
  await connectMongo();
  const doc = await StudentProfileModel.findOneAndUpdate(
    { userId },
    {
      $inc: { aiCredits: amount },
      $setOnInsert: { userId },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return doc ? docToProfile(doc as never) : null;
}

export async function consumeAiCredit(
  userId: string
): Promise<StudentProfileRecord | null> {
  await connectMongo();
  const doc = await StudentProfileModel.findOneAndUpdate(
    { userId, aiCredits: { $gte: 1 } },
    { $inc: { aiCredits: -1 } },
    { new: true }
  ).lean();
  return doc ? docToProfile(doc as never) : null;
}

export async function markFreeAnalysisUsed(
  userId: string
): Promise<StudentProfileRecord | null> {
  await connectMongo();
  const doc = await StudentProfileModel.findOneAndUpdate(
    { userId },
    {
      $set: { freeAnalysisUsed: true },
      $setOnInsert: { userId },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return doc ? docToProfile(doc as never) : null;
}

export function profileToAnswers(
  profile: StudentProfileRecord | null
): EligibilityAnswers {
  if (!profile) return emptyAnswers();
  return {
    goal: profile.goal,
    qualification: profile.qualification,
    gradeSystem: profile.gradeSystem,
    gradeValue: profile.gradeValue,
    percentagePassMark: profile.percentagePassMark,
    field: profile.field,
    englishTest: profile.englishTest,
    englishScore: profile.englishScore,
    germanLevel: profile.germanLevel,
    completedAt: profile.completedAt,
  };
}
