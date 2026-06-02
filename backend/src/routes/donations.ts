import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import type { Request } from "express";
import { db, donationsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListDonationsQueryParams,
  MakeDonationBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req: Request, res) => {
  try {
    const query = ListDonationsQueryParams.safeParse(req.query);
    const limit = (query.success && query.data.limit) || 20;
    const offset = (query.success && query.data.offset) || 0;

    const donations = await db
      .select({
        id: donationsTable.id,
        donorUserId: donationsTable.donorUserId,
        amountPkr: donationsTable.amountPkr,
        message: donationsTable.message,
        anonymous: donationsTable.anonymous,
        createdAt: donationsTable.createdAt,
        donorNameText: donationsTable.donorName,
        userDisplayName: usersTable.displayName,
      })
      .from(donationsTable)
      .leftJoin(usersTable, eq(donationsTable.donorUserId, usersTable.id))
      .orderBy(sql`${donationsTable.createdAt} DESC`)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(donationsTable);

    const totalAmountResult = await db
      .select({ total: sql<number>`sum(amount_pkr)` })
      .from(donationsTable);

    res.json({
      donations: donations.map((d) => ({
        id: d.id,
        amountPkr: d.amountPkr,
        message: d.message,
        anonymous: d.anonymous,
        createdAt: d.createdAt.toISOString(),
        donorName: d.anonymous
          ? null
          : (d.userDisplayName ?? d.donorNameText ?? null),
      })),
      total: Number(countResult[0]?.count ?? 0),
      totalAmountPkr: Number(totalAmountResult[0]?.total ?? 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/general", async (req: Request, res) => {
  try {
    const body = req.body as Record<string, unknown>;
    const amountPkr = Number(body.amountPkr);
    if (!Number.isInteger(amountPkr) || amountPkr < 1) {
      res.status(400).json({ error: "amountPkr must be a positive integer" });
      return;
    }

    const donorName = typeof body.donorName === "string" && body.donorName.trim().length > 0
      ? body.donorName.trim().slice(0, 100)
      : null;
    const message = typeof body.message === "string" && body.message.trim().length > 0
      ? body.message.trim().slice(0, 500)
      : null;
    const isAnon = body.anonymous === true;

    const donation = await db
      .insert(donationsTable)
      .values({
        donorUserId: null,
        recipientUserId: null,
        donorName: isAnon ? null : donorName,
        amountPkr,
        message,
        anonymous: isAnon,
      })
      .returning();

    const d = donation[0];
    res.status(201).json({
      id: d.id,
      amountPkr: d.amountPkr,
      message: d.message,
      anonymous: d.anonymous,
      donorName: d.anonymous ? null : d.donorName,
      createdAt: d.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: Request, res) => {
  try {
    const parsed = MakeDonationBody.safeParse(req.body);
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
      res.status(403).json({ error: "Profile required to donate" });
      return;
    }

    if (parsed.data.recipientUserId !== null && parsed.data.recipientUserId !== undefined) {
      const recipient = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, parsed.data.recipientUserId))
        .limit(1);

      if (recipient.length === 0) {
        res.status(404).json({ error: "Recipient not found" });
        return;
      }

      const r = recipient[0];
      if (r.role !== "pwd" || !r.kycVerified) {
        res.status(400).json({ error: "Targeted donations are only allowed for KYC-verified PWD members" });
        return;
      }
    }

    const donation = await db
      .insert(donationsTable)
      .values({
        donorUserId: user[0].id,
        recipientUserId: parsed.data.recipientUserId,
        amountPkr: parsed.data.amountPkr,
        message: parsed.data.message,
        anonymous: parsed.data.anonymous ?? false,
      })
      .returning();

    const d = donation[0];

    res.status(201).json({
      id: d.id,
      amountPkr: d.amountPkr,
      message: d.message,
      anonymous: d.anonymous,
      donorName: d.anonymous ? null : user[0].displayName,
      createdAt: d.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/mine", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      res.json({ donations: [], total: 0, totalAmountPkr: 0 });
      return;
    }

    const donations = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.donorUserId, user[0].id))
      .orderBy(sql`${donationsTable.createdAt} DESC`);

    const totalAmt = donations.reduce((acc, d) => acc + d.amountPkr, 0);

    res.json({
      donations: donations.map((d) => ({
        id: d.id,
        amountPkr: d.amountPkr,
        message: d.message,
        anonymous: d.anonymous,
        donorName: d.anonymous ? null : user[0].displayName,
        createdAt: d.createdAt.toISOString(),
      })),
      total: donations.length,
      totalAmountPkr: totalAmt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
