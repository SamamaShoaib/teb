import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import type { Request } from "express";
import {
  db,
  captainsTable,
  usersTable,
  captainSessionsTable,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { ListCaptainsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListCaptainsQueryParams.safeParse(req.query);
    const limit = (query.success && query.data.limit) || 20;
    const offset = (query.success && query.data.offset) || 0;

    const captains = await db
      .select({
        id: captainsTable.id,
        userId: captainsTable.userId,
        assignedCount: captainsTable.assignedCount,
        successCount: captainsTable.successCount,
        createdAt: captainsTable.createdAt,
        displayName: usersTable.displayName,
        location: usersTable.location,
        bio: usersTable.bio,
        avatarInitials: usersTable.avatarInitials,
      })
      .from(captainsTable)
      .innerJoin(usersTable, eq(captainsTable.userId, usersTable.id))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${captainsTable.successCount} DESC`);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(captainsTable);

    res.json({
      captains: captains.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      total: Number(countResult[0]?.count ?? 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my-profile", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0 || user[0].role !== "captain") {
      res.status(403).json({ error: "Captain profile required" });
      return;
    }

    const captain = await db
      .select()
      .from(captainsTable)
      .where(eq(captainsTable.userId, user[0].id))
      .limit(1);

    if (captain.length === 0) {
      const inserted = await db
        .insert(captainsTable)
        .values({ userId: user[0].id })
        .returning();
      res.json({ ...inserted[0], createdAt: inserted[0].createdAt.toISOString() });
      return;
    }

    res.json({ ...captain[0], createdAt: captain[0].createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/my-requests", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0 || user[0].role !== "captain") {
      res.status(403).json({ error: "Captain access required" });
      return;
    }

    const captain = await db
      .select()
      .from(captainsTable)
      .where(eq(captainsTable.userId, user[0].id))
      .limit(1);

    if (captain.length === 0) {
      res.json({ sessions: [], total: 0 });
      return;
    }

    const sessions = await db
      .select({
        id: captainSessionsTable.id,
        message: captainSessionsTable.message,
        status: captainSessionsTable.status,
        createdAt: captainSessionsTable.createdAt,
        requesterName: usersTable.displayName,
        requesterLocation: usersTable.location,
        requesterDisability: usersTable.disability,
        requesterInitials: usersTable.avatarInitials,
      })
      .from(captainSessionsTable)
      .innerJoin(usersTable, eq(captainSessionsTable.requesterUserId, usersTable.id))
      .where(eq(captainSessionsTable.captainId, captain[0].id))
      .orderBy(sql`${captainSessionsTable.createdAt} DESC`);

    res.json({
      sessions: sessions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
      total: sessions.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/my-requests/:sessionId", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const sessionId = parseInt(String(req.params.sessionId));
    const { status } = req.body as { status: string };

    if (!["accepted", "completed", "declined"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0 || user[0].role !== "captain") {
      res.status(403).json({ error: "Captain access required" });
      return;
    }

    const captain = await db
      .select()
      .from(captainsTable)
      .where(eq(captainsTable.userId, user[0].id))
      .limit(1);

    if (captain.length === 0) {
      res.status(404).json({ error: "Captain profile not found" });
      return;
    }

    const updated = await db
      .update(captainSessionsTable)
      .set({ status: status as "accepted" | "completed" | "declined" })
      .where(
        sql`${captainSessionsTable.id} = ${sessionId} AND ${captainSessionsTable.captainId} = ${captain[0].id}`
      )
      .returning();

    if (updated.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    if (status === "completed") {
      await db
        .update(captainsTable)
        .set({
          successCount: sql`${captainsTable.successCount} + 1`,
        })
        .where(eq(captainsTable.id, captain[0].id));
    }

    res.json({ ...updated[0], createdAt: updated[0].createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:captainId/request", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const captainId = parseInt(String(req.params.captainId));
    const { message } = req.body as { message?: string };

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      res.status(403).json({ error: "Profile required to request a session" });
      return;
    }

    const captain = await db
      .select()
      .from(captainsTable)
      .where(eq(captainsTable.id, captainId))
      .limit(1);

    if (captain.length === 0) {
      res.status(404).json({ error: "Captain not found" });
      return;
    }

    if (captain[0].userId === user[0].id) {
      res.status(400).json({ error: "Cannot request a session with yourself" });
      return;
    }

    const session = await db
      .insert(captainSessionsTable)
      .values({
        captainId,
        requesterUserId: user[0].id,
        message: message?.trim() || null,
        status: "pending",
      })
      .returning();

    await db
      .update(captainsTable)
      .set({ assignedCount: sql`${captainsTable.assignedCount} + 1` })
      .where(eq(captainsTable.id, captainId));

    res.status(201).json({ ...session[0], createdAt: session[0].createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
