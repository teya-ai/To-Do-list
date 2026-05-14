import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, tasksTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const tasks = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.userId, userId!));

    const today = new Date().toISOString().slice(0, 10);

    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      highPriority: tasks.filter((t) => t.priority === "high").length,
      dueTodayCount: tasks.filter(
        (t) => t.dueDate && t.dueDate.startsWith(today) && t.status !== "completed"
      ).length,
    };

    res.json(stats);
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
