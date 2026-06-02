import { Router } from "express";
import { eq, sql, desc, and, ne, isNull } from "drizzle-orm";

const WITHDRAWAL_REASON_PRESETS = new Set([
  "situation_changed",
  "found_another_source",
  "submitted_by_mistake",
  "no_longer_needed",
  "other",
]);
import type { Request } from "express";
import { db, grantApplicationsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function generateReferenceNumber(grantType: string): string {
  const prefix: Record<string, string> = {
    livelihood_fund: "LF",
    skills_training: "ST",
    assistive_technology: "AT",
  };
  const code = prefix[grantType] ?? "GA";
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TEB-${code}-${year}-${random}`;
}

router.post("/", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (requestingUser.length === 0) {
      res.status(403).json({ error: "You must complete your profile before applying for a grant." });
      return;
    }

    if (requestingUser[0].role !== "pwd") {
      res.status(403).json({ error: "Only PWD members can apply for grants." });
      return;
    }

    const body = req.body as Record<string, unknown>;

    const requiredFields = [
      "grantType",
      "fullName",
      "email",
      "phone",
      "address",
      "dateOfBirth",
      "disabilityType",
      "disabilityCertificateNumber",
      "certifyingPhysician",
      "useCase",
      "requestedAmountPkr",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        res.status(400).json({ error: `Missing required field: ${field}` });
        return;
      }
    }

    const validGrantTypes = ["livelihood_fund", "skills_training", "assistive_technology"];
    if (!validGrantTypes.includes(body.grantType as string)) {
      res.status(400).json({ error: "Invalid grantType" });
      return;
    }

    const requestedAmount = Number(body.requestedAmountPkr);
    if (!Number.isInteger(requestedAmount) || requestedAmount < 1) {
      res.status(400).json({ error: "requestedAmountPkr must be a positive integer" });
      return;
    }

    const applicantUserId = requestingUser[0].id;

    const referenceNumber = generateReferenceNumber(body.grantType as string);

    const [application] = await db
      .insert(grantApplicationsTable)
      .values({
        referenceNumber,
        applicantUserId,
        grantType: body.grantType as "livelihood_fund" | "skills_training" | "assistive_technology",
        fullName: String(body.fullName).trim().slice(0, 200),
        email: String(body.email).trim().slice(0, 200),
        phone: String(body.phone).trim().slice(0, 50),
        address: String(body.address).trim().slice(0, 500),
        dateOfBirth: String(body.dateOfBirth).trim(),
        disabilityType: String(body.disabilityType).trim().slice(0, 200),
        disabilityCertificateNumber: String(body.disabilityCertificateNumber).trim().slice(0, 100),
        certifyingPhysician: String(body.certifyingPhysician).trim().slice(0, 200),
        useCase: String(body.useCase).trim().slice(0, 2000),
        requestedAmountPkr: requestedAmount,
        additionalNotes:
          typeof body.additionalNotes === "string" && body.additionalNotes.trim().length > 0
            ? body.additionalNotes.trim().slice(0, 1000)
            : null,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      id: application.id,
      referenceNumber: application.referenceNumber,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mine", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (requestingUser.length === 0) {
      res.json({ applications: [] });
      return;
    }

    const applications = await db
      .select()
      .from(grantApplicationsTable)
      .where(eq(grantApplicationsTable.applicantUserId, requestingUser[0].id))
      .orderBy(desc(grantApplicationsTable.createdAt));

    res.json({
      applications: applications.map((a) => ({
        id: a.id,
        referenceNumber: a.referenceNumber,
        grantType: a.grantType,
        status: a.status,
        fullName: a.fullName,
        requestedAmountPkr: a.requestedAmountPkr,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        withdrawnAt: a.withdrawnAt ? a.withdrawnAt.toISOString() : null,
        withdrawalReason: a.withdrawalReason,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mine/:id", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (requestingUser.length === 0) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const applicationId = Number(req.params.id);
    if (!Number.isInteger(applicationId) || applicationId < 1) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const [application] = await db
      .select()
      .from(grantApplicationsTable)
      .where(
        and(
          eq(grantApplicationsTable.id, applicationId),
          eq(grantApplicationsTable.applicantUserId, requestingUser[0].id),
        ),
      )
      .limit(1);

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({
      id: application.id,
      referenceNumber: application.referenceNumber,
      grantType: application.grantType,
      status: application.status,
      fullName: application.fullName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      dateOfBirth: application.dateOfBirth,
      disabilityType: application.disabilityType,
      disabilityCertificateNumber: application.disabilityCertificateNumber,
      certifyingPhysician: application.certifyingPhysician,
      requestedAmountPkr: application.requestedAmountPkr,
      useCase: application.useCase,
      additionalNotes: application.additionalNotes,
      withdrawnAt: application.withdrawnAt ? application.withdrawnAt.toISOString() : null,
      withdrawalReason: application.withdrawalReason,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/mine/:id", requireAuth, async (req: Request, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  let withdrawalReason: string | null = null;
  if (typeof body.withdrawalReason === "string") {
    const trimmed = body.withdrawalReason.trim();
    if (trimmed.length > 0) {
      const lower = trimmed.toLowerCase();
      if (WITHDRAWAL_REASON_PRESETS.has(lower)) {
        withdrawalReason = lower;
      } else {
        withdrawalReason = trimmed.slice(0, 1000);
      }
    }
  }

  try {
    const clerkUserId = req.clerkUserId!;
    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (requestingUser.length === 0) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const applicationId = Number(req.params.id);
    if (!Number.isInteger(applicationId) || applicationId < 1) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const [existing] = await db
      .select()
      .from(grantApplicationsTable)
      .where(
        and(
          eq(grantApplicationsTable.id, applicationId),
          eq(grantApplicationsTable.applicantUserId, requestingUser[0].id),
        ),
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    if (existing.withdrawnAt) {
      res.status(409).json({ error: "This application has already been withdrawn." });
      return;
    }

    if (existing.status !== "pending") {
      res.status(409).json({
        error: "Only pending applications can be withdrawn. This application is already being reviewed or has been decided.",
      });
      return;
    }

    const now = new Date();
    const updated = await db
      .update(grantApplicationsTable)
      .set({ status: "withdrawn", withdrawnAt: now, withdrawalReason, updatedAt: now })
      .where(
        and(
          eq(grantApplicationsTable.id, applicationId),
          eq(grantApplicationsTable.applicantUserId, requestingUser[0].id),
          eq(grantApplicationsTable.status, "pending"),
          isNull(grantApplicationsTable.withdrawnAt),
        ),
      )
      .returning({ id: grantApplicationsTable.id });

    if (updated.length === 0) {
      res.status(409).json({
        error: "Application could not be withdrawn. It may have just been picked up for review.",
      });
      return;
    }

    res.json({ id: updated[0].id, withdrawn: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (requestingUser.length === 0 || requestingUser[0].role !== "captain") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const limitParam = Number(req.query.limit) || 50;
    const offsetParam = Number(req.query.offset) || 0;

    const validGrantTypes = ["livelihood_fund", "skills_training", "assistive_technology"];
    const validStatuses = ["pending", "under_review", "approved", "rejected", "withdrawn"];

    const grantTypeFilter = typeof req.query.grantType === "string" && validGrantTypes.includes(req.query.grantType)
      ? req.query.grantType as "livelihood_fund" | "skills_training" | "assistive_technology"
      : null;

    const statusFilter = typeof req.query.status === "string" && validStatuses.includes(req.query.status)
      ? req.query.status as "pending" | "under_review" | "approved" | "rejected" | "withdrawn"
      : null;

    const conditions = [];
    if (grantTypeFilter) conditions.push(eq(grantApplicationsTable.grantType, grantTypeFilter));
    if (statusFilter) {
      conditions.push(eq(grantApplicationsTable.status, statusFilter));
    } else {
      conditions.push(ne(grantApplicationsTable.status, "withdrawn"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [applications, countResult] = await Promise.all([
      db
        .select()
        .from(grantApplicationsTable)
        .where(whereClause)
        .orderBy(desc(grantApplicationsTable.createdAt))
        .limit(limitParam)
        .offset(offsetParam),
      db
        .select({ count: sql<number>`count(*)` })
        .from(grantApplicationsTable)
        .where(whereClause),
    ]);

    res.json({
      applications: applications.map((a) => ({
        id: a.id,
        referenceNumber: a.referenceNumber,
        grantType: a.grantType,
        status: a.status,
        fullName: a.fullName,
        email: a.email,
        phone: a.phone,
        address: a.address,
        dateOfBirth: a.dateOfBirth,
        disabilityType: a.disabilityType,
        disabilityCertificateNumber: a.disabilityCertificateNumber,
        certifyingPhysician: a.certifyingPhysician,
        requestedAmountPkr: a.requestedAmountPkr,
        useCase: a.useCase,
        additionalNotes: a.additionalNotes,
        withdrawnAt: a.withdrawnAt ? a.withdrawnAt.toISOString() : null,
        withdrawalReason: a.withdrawalReason,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      total: Number(countResult[0]?.count ?? 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const requestingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (requestingUser.length === 0 || requestingUser[0].role !== "captain") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    const applicationId = Number(req.params.id);
    if (!Number.isInteger(applicationId) || applicationId < 1) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const validStatuses = ["pending", "under_review", "approved", "rejected"];
    const { status } = req.body as { status?: string };

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid or missing status. Must be one of: pending, under_review, approved, rejected" });
      return;
    }

    const [updated] = await db
      .update(grantApplicationsTable)
      .set({ status: status as "pending" | "under_review" | "approved" | "rejected", updatedAt: new Date() })
      .where(
        and(
          eq(grantApplicationsTable.id, applicationId),
          isNull(grantApplicationsTable.withdrawnAt),
        ),
      )
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json({
      id: updated.id,
      referenceNumber: updated.referenceNumber,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
