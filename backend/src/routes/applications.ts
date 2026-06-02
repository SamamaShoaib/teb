import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import type { Request } from "express";
import { db, applicationsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/mine", requireAuth, async (req: Request, res) => {
  try {
    const clerkUserId = req.clerkUserId!;
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, clerkUserId))
      .limit(1);

    if (user.length === 0) {
      res.json({ applications: [], total: 0 });
      return;
    }

    const applications = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.applicantUserId, user[0].id))
      .orderBy(sql`${applicationsTable.createdAt} DESC`);

    res.json({
      applications: applications.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
      total: applications.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
