import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, jobsTable, applicationsTable, donationsTable, captainsTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [pwdCount, corporateCount, donationStats, captainCount, placementCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable)
        .where(eq(usersTable.role, "pwd")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(usersTable)
        .where(eq(usersTable.role, "corporate")),
      db
        .select({
          count: sql<number>`count(*)`,
          totalPkr: sql<number>`coalesce(sum(amount_pkr), 0)`,
        })
        .from(donationsTable),
      db
        .select({ count: sql<number>`count(*)` })
        .from(captainsTable),
      db
        .select({ count: sql<number>`count(*)` })
        .from(applicationsTable)
        .where(eq(applicationsTable.status, "hired")),
    ]);

    res.json({
      totalPwdMembers: Number(pwdCount[0]?.count ?? 0),
      totalJobPlacements: Number(placementCount[0]?.count ?? 0),
      totalFundsDistributedPkr: Number(donationStats[0]?.totalPkr ?? 0),
      totalCorporatePartners: Number(corporateCount[0]?.count ?? 0),
      totalActiveCaptains: Number(captainCount[0]?.count ?? 0),
      totalDonations: Number(donationStats[0]?.count ?? 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
