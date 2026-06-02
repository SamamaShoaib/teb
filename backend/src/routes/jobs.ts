import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import type { Request } from "express";
import { db, jobsTable, usersTable, applicationsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  ApplyToJobBody,
} from "@workspace/api-zod";

type JobType = "full_time" | "part_time" | "freelance" | "internship";

const router = Router();

router.get("/", async (req: Request, res) => {
  try {
    const query = ListJobsQueryParams.safeParse(req.query);
    const type = query.success ? query.data.type : undefined;
    const remote = query.success ? query.data.remote : undefined;
    const limit = (query.success && query.data.limit) || 20;
    const offset = (query.success && query.data.offset) || 0;

    const conditions = [];
    if (type) {
      conditions.push(eq(jobsTable.type, type as JobType));
    }
    if (remote !== undefined) {
      conditions.push(eq(jobsTable.remote, remote));
    }

    const jobs = await db
      .select()
      .from(jobsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${jobsTable.createdAt} DESC`);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count ?? 0);

    const appCounts = await db
      .select({
        jobId: applicationsTable.jobId,
        count: sql<number>`count(*)`,
      })
      .from(applicationsTable)
      .groupBy(applicationsTable.jobId);

    const appCountMap = new Map(
      appCounts.map((r) => [r.jobId, Number(r.count)]),
    );

    res.json({
      jobs: jobs.map((j) => ({
        ...j,
        applicationCount: appCountMap.get(j.id) ?? 0,
        createdAt: j.createdAt.toISOString(),
      })),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: Request, res) => {
  try {
    const parsed = CreateJobBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }

    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      res.status(403).json({ error: "Profile required to post jobs. Please set up your profile first." });
      return;
    }

    const u = user[0];
    if (u.role !== "corporate") {
      res.status(403).json({ error: "Only corporate accounts can post jobs. Update your profile role to 'Employer / HR Professional' first." });
      return;
    }

    const companyName = u.companyName || u.displayName || "Unknown Company";

    const job = await db
      .insert(jobsTable)
      .values({
        ...parsed.data,
        postedByUserId: u.id,
        companyName,
      })
      .returning();

    res.status(201).json({
      ...job[0],
      applicationCount: 0,
      createdAt: job[0].createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:jobId", async (req: Request, res) => {
  try {
    const jobId = parseInt(String(req.params.jobId ?? ""));
    if (isNaN(jobId)) {
      res.status(400).json({ error: "Invalid job ID" });
      return;
    }

    const job = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .limit(1);

    if (job.length === 0) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const appCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(applicationsTable)
      .where(eq(applicationsTable.jobId, jobId));

    res.json({
      ...job[0],
      applicationCount: Number(appCount[0]?.count ?? 0),
      createdAt: job[0].createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:jobId/apply", requireAuth, async (req: Request, res) => {
  try {
    const jobId = parseInt(String(req.params.jobId ?? ""));
    if (isNaN(jobId)) {
      res.status(400).json({ error: "Invalid job ID" });
      return;
    }

    const parsed = ApplyToJobBody.safeParse(req.body);
    const coverLetter = parsed.success ? parsed.data.coverLetter : undefined;

    const job = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .limit(1);

    if (job.length === 0) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      res.status(403).json({ error: "Profile required" });
      return;
    }

    const existing = await db
      .select()
      .from(applicationsTable)
      .where(and(eq(applicationsTable.jobId, jobId), eq(applicationsTable.applicantUserId, user[0].id)))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "You have already applied to this job" });
      return;
    }

    const application = await db
      .insert(applicationsTable)
      .values({
        jobId,
        applicantUserId: user[0].id,
        coverLetter,
        status: "applied",
      })
      .returning();

    res.status(201).json({
      ...application[0],
      createdAt: application[0].createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
