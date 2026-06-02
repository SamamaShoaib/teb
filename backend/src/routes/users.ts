import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import type { Request } from "express";
import { db, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  UpsertMyProfileBody,
  ListUsersQueryParams,
  GetUserProfileParams,
} from "@workspace/api-zod";

type UserRole = "pwd" | "corporate" | "donor" | "captain";

const router = Router();

router.get("/me", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const u = user[0];
    res.json({
      ...u,
      createdAt: u.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const parsed = UpsertMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }

    const body = parsed.data;
    const initials = body.displayName
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    let user;
    if (existing.length === 0) {
      const inserted = await db
        .insert(usersTable)
        .values({
          clerkUserId,
          ...body,
          avatarInitials: initials,
        })
        .returning();
      user = inserted[0];
    } else {
      const updated = await db
        .update(usersTable)
        .set({
          ...body,
          avatarInitials: initials,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.clerkUserId, clerkUserId))
        .returning();
      user = updated[0];
    }

    res.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res) => {
  try {
    const query = ListUsersQueryParams.safeParse(req.query);
    const role = query.success ? query.data.role : undefined;
    const verified = query.success ? query.data.verified : undefined;
    const limit = (query.success && query.data.limit) || 20;
    const offset = (query.success && query.data.offset) || 0;

    const conditions = [];
    if (role) {
      conditions.push(eq(usersTable.role, role as UserRole));
    }
    if (verified !== undefined) {
      conditions.push(eq(usersTable.kycVerified, verified));
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(usersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      users: users.map(({ clerkUserId: _omit, ...u }) => ({ ...u, createdAt: u.createdAt.toISOString() })),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId", async (req: Request, res) => {
  try {
    const parsed = GetUserProfileParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }

    const userId = parseInt(parsed.data.userId);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { clerkUserId: _omit, ...u } = user[0];
    res.json({ ...u, createdAt: u.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
