import { listConsultations } from "./consultations";
import { listLeads } from "./leads";
import { connectMongo } from "./connect";
import { ConsultationModel } from "./consultation-model";
import { LeadModel } from "./lead-model";
import { ScholarshipModel } from "./scholarship-model";
import { CONSULTATION_STATUSES, type ConsultationStatus } from "@/lib/consultation/status";
import type { LeadStatus } from "./types";

export type AdminOverviewData = {
  consultationCounts: Record<"all" | ConsultationStatus, number>;
  leadCounts: Record<"all" | LeadStatus, number>;
  recentConsultations: Awaited<ReturnType<typeof listConsultations>>;
  recentLeads: Awaited<ReturnType<typeof listLeads>>;
  dailyActivity: { label: string; evaluations: number; leads: number }[];
  serviceDemand: { service: string; count: number }[];
  scholarshipCount: number;
};

const leadStatuses: LeadStatus[] = ["new", "contacted", "paid", "closed"];

export async function getAdminOverview(): Promise<AdminOverviewData> {
  await connectMongo();

  const days = Array.from({ length: 7 }, (_, index) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (6 - index));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end, label: start.toLocaleDateString("en-PK", { weekday: "short" }) };
  });

  const [recentConsultations, recentLeads, consultationTotal, leadTotal, scholarshipCount, consultationStatusCounts, leadStatusCounts, dailyActivity, serviceDemand] = await Promise.all([
    listConsultations(),
    listLeads(),
    ConsultationModel.countDocuments(),
    LeadModel.countDocuments(),
    ScholarshipModel.countDocuments(),
    Promise.all(CONSULTATION_STATUSES.map(async (status) => [status, await ConsultationModel.countDocuments({ status })] as const)),
    Promise.all(leadStatuses.map(async (status) => [status, await LeadModel.countDocuments({ status })] as const)),
    Promise.all(days.map(async ({ start, end, label }) => ({
      label,
      evaluations: await ConsultationModel.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      leads: await LeadModel.countDocuments({ createdAt: { $gte: start, $lt: end } }),
    }))),
    ConsultationModel.aggregate<{ _id: string; count: number }>([
      { $project: { services: { $ifNull: ["$answers.services", []] } } },
      { $unwind: "$services" },
      { $group: { _id: "$services", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 6 },
    ]),
  ]);

  return {
    consultationCounts: {
      all: consultationTotal,
      ...Object.fromEntries(consultationStatusCounts),
    } as AdminOverviewData["consultationCounts"],
    leadCounts: {
      all: leadTotal,
      ...Object.fromEntries(leadStatusCounts),
    } as AdminOverviewData["leadCounts"],
    recentConsultations: recentConsultations.slice(0, 5),
    recentLeads: recentLeads.slice(0, 5),
    dailyActivity,
    serviceDemand: serviceDemand.map(({ _id, count }) => ({ service: _id, count })),
    scholarshipCount,
  };
}

