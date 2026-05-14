import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, tasksTable } from "@workspace/db";
import { eq, and, ilike, SQL } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
  GetTaskParams,
} from "@workspace/api-zod";

const router = Router();

// GET /api/tasks
router.get("/", requireAuth, async (req, res) => {
  try {
    const parsed = ListTasksQueryParams.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query parameters" });
      return;
    }

    const { userId } = getAuth(req);
    const { status, priority, search } = parsed.data;

    const conditions: SQL[] = [eq(tasksTable.userId, userId!)];

    if (status) conditions.push(eq(tasksTable.status, status));
    if (priority) conditions.push(eq(tasksTable.priority, priority));
    if (search) conditions.push(ilike(tasksTable.title, `%${search}%`));

    const tasks = await db
      .select()
      .from(tasksTable)
      .where(and(...conditions))
      .orderBy(tasksTable.createdAt);

    res.json(tasks);
  } catch (err) {
    req.log.error({ err }, "Failed to list tasks");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/tasks
router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = CreateTaskBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { userId } = getAuth(req);
    const { title, description, status, priority, dueDate } = parsed.data;

    const [task] = await db
      .insert(tasksTable)
      .values({
        userId: userId!,
        title,
        description: description ?? null,
        status: status ?? "pending",
        priority: priority ?? "medium",
        dueDate: dueDate ?? null,
      })
      .returning();

    res.status(201).json(task);
  } catch (err) {
    req.log.error({ err }, "Failed to create task");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/tasks/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const parsed = GetTaskParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const { userId } = getAuth(req);
    const [task] = await db
      .select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, parsed.data.id), eq(tasksTable.userId, userId!)));

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (err) {
    req.log.error({ err }, "Failed to get task");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const paramsParsed = UpdateTaskParams.safeParse({ id: Number(req.params.id) });
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const bodyParsed = UpdateTaskBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { userId } = getAuth(req);
    const updateData: Record<string, unknown> = {};
    const body = bodyParsed.data;

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;

    const [task] = await db
      .update(tasksTable)
      .set(updateData)
      .where(and(eq(tasksTable.id, paramsParsed.data.id), eq(tasksTable.userId, userId!)))
      .returning();

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (err) {
    req.log.error({ err }, "Failed to update task");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const parsed = DeleteTaskParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid task ID" });
      return;
    }

    const { userId } = getAuth(req);
    const [deleted] = await db
      .delete(tasksTable)
      .where(and(eq(tasksTable.id, parsed.data.id), eq(tasksTable.userId, userId!)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete task");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
