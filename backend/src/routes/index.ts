import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import donationsRouter from "./donations";
import captainsRouter from "./captains";
import statsRouter from "./stats";
import grantApplicationsRouter from "./grantApplications";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/donations", donationsRouter);
router.use("/captains", captainsRouter);
router.use("/stats", statsRouter);
router.use("/grant-applications", grantApplicationsRouter);

export default router;
