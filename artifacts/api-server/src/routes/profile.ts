import { Router } from "express";
import { getAuth, createClerkClient } from "@clerk/express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { UpdateProfileBody } from "@workspace/api-zod";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const router = Router();

// GET /api/profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const clerkUser = await clerk.users.getUser(userId!);

    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId!));

    const displayName =
      profile?.displayName ||
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
      clerkUser.username ||
      "User";

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const avatarUrl = clerkUser.imageUrl ?? null;

    res.json({
      userId: userId!,
      email,
      displayName,
      avatarUrl,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/profile
router.patch("/", requireAuth, async (req, res) => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const { userId } = getAuth(req);
    const { displayName } = parsed.data;

    if (displayName !== undefined) {
      await db
        .insert(profilesTable)
        .values({ userId: userId!, displayName })
        .onConflictDoUpdate({
          target: profilesTable.userId,
          set: { displayName },
        });
    }

    const clerkUser = await clerk.users.getUser(userId!);
    const [profile] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.userId, userId!));

    res.json({
      userId: userId!,
      email: clerkUser.emailAddresses?.[0]?.emailAddress ?? "",
      displayName: profile?.displayName || displayName || "User",
      avatarUrl: clerkUser.imageUrl ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
