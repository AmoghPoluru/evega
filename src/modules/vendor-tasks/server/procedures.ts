import z from "zod";

import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { isSuperAdmin, getVendorId, isVendor } from "@/lib/access";

export const vendorTasksRouter = createTRPCRouter({
  listForVendor: baseProcedure
    .input(
      z.object({
        status: z.string().optional(),
        type: z.string().optional(),
        priority: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { user } = await db.auth({ headers: ctx.headers });

      if (!isVendor(user) && !isSuperAdmin(user)) {
        return { docs: [], totalDocs: 0 };
      }

      const where: any = {};

      if (isVendor(user) && !isSuperAdmin(user)) {
        const vendorId = getVendorId(user);
        if (!vendorId) {
          return { docs: [], totalDocs: 0 };
        }
        where.vendor = { equals: vendorId };
      }

      if (input.status) {
        where.status = { equals: input.status };
      }
      if (input.type) {
        where.type = { equals: input.type };
      }
      if (input.priority) {
        where.priority = { equals: input.priority };
      }

      const result = await db.find({
        collection: "vendor-tasks",
        where,
        sort: "-updatedAt",
        limit: 50,
        depth: 1,
      });

      return result;
    }),

  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { user } = await db.auth({ headers: ctx.headers });

      if (!user) {
        return null;
      }

      const task = await db.findByID({
        collection: "vendor-tasks",
        id: input.id,
        depth: 2,
      });

      if (!task) return null;

      // Vendors can only see their own tasks
      if (!isSuperAdmin(user) && isVendor(user)) {
        const vendorId = getVendorId(user);
        const taskVendorId =
          typeof task.vendor === "string" ? task.vendor : task.vendor?.id;

        if (!vendorId || !taskVendorId || vendorId !== taskVendorId) {
          return null;
        }
      }

      return task;
    }),

  create: baseProcedure
    .input(
      z.object({
        title: z.string().min(3),
        description: z.string().min(5),
        type: z
          .enum(["question", "feature-request", "bug", "onboarding", "other"])
          .default("question"),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { user } = await db.auth({ headers: ctx.headers });

      if (!user) {
        throw new Error("Unauthorized");
      }

      const isAdmin = isSuperAdmin(user);
      const vendorId = getVendorId(user);

      if (!isAdmin && !vendorId) {
        throw new Error("Only vendors or admins can create tasks");
      }

      const task = await db.create({
        collection: "vendor-tasks",
        data: {
          title: input.title,
          description: {
            root: {
              type: "root",
              version: 1,
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  children: [
                    {
                      type: "text",
                      version: 1,
                      text: input.description,
                    },
                  ],
                },
              ],
            },
          },
          type: input.type,
          priority: input.priority,
          status: "open",
          vendor: vendorId || null,
          createdBy: user.id,
        },
      });

      return task;
    }),

  listMessagesForTask: baseProcedure
    .input(
      z.object({
        taskId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { user } = await db.auth({ headers: ctx.headers });

      if (!user) {
        throw new Error("Unauthorized");
      }

      // Ensure task exists and user has access to it
      const task = await db.findByID({
        collection: "vendor-tasks",
        id: input.taskId,
        depth: 1,
      });

      if (!task) {
        throw new Error("Task not found");
      }

      if (!isSuperAdmin(user) && isVendor(user)) {
        const vendorId = getVendorId(user);
        const taskVendorId =
          typeof task.vendor === "string" ? task.vendor : task.vendor?.id;

        if (!vendorId || !taskVendorId || vendorId !== taskVendorId) {
          throw new Error("You do not have access to this task");
        }
      }

      const messages = await db.find({
        collection: "vendor-task-messages",
        where: {
          task: {
            equals: input.taskId,
          },
        },
        sort: "createdAt",
        depth: 1,
      });

      return messages;
    }),

  addMessage: baseProcedure
    .input(
      z.object({
        taskId: z.string(),
        body: z.string().min(1, "Message cannot be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { user } = await db.auth({ headers: ctx.headers });

      if (!user) {
        throw new Error("Unauthorized");
      }

      const task = await db.findByID({
        collection: "vendor-tasks",
        id: input.taskId,
        depth: 1,
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const isAdmin = isSuperAdmin(user);
      const vendorId = getVendorId(user);

      if (!isAdmin && !vendorId) {
        throw new Error("Only vendors or admins can reply to tasks");
      }

      // Vendors can only post on their own tasks
      if (!isAdmin && isVendor(user)) {
        const taskVendorId =
          typeof task.vendor === "string" ? task.vendor : task.vendor?.id;

        if (!taskVendorId || taskVendorId !== vendorId) {
          throw new Error("You do not have access to this task");
        }
      }

      const role = isAdmin ? "admin" : "vendor";

      const message = await db.create({
        collection: "vendor-task-messages",
        data: {
          task: input.taskId,
          author: user.id,
          role,
          body: {
            root: {
              type: "root",
              version: 1,
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  children: [
                    {
                      type: "text",
                      version: 1,
                      text: input.body,
                    },
                  ],
                },
              ],
            },
          },
          isInternal: false,
        },
      });

      // Prevent messages on closed tasks
      if (task.status === "closed") {
        throw new Error("Cannot send messages to a closed task");
      }

      // Optionally update task status when vendor replies
      if (role === "vendor" && task.status === "waiting-on-vendor") {
        await db.update({
          collection: "vendor-tasks",
          id: input.taskId,
          data: {
            status: "waiting-on-admin",
          },
        });
      }

      return message;
    }),

  closeTask: baseProcedure
    .input(
      z.object({
        taskId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { user } = await db.auth({ headers: ctx.headers });

      if (!user) {
        throw new Error("Unauthorized");
      }

      const task = await db.findByID({
        collection: "vendor-tasks",
        id: input.taskId,
        depth: 1,
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const isAdmin = isSuperAdmin(user);
      const vendorId = getVendorId(user);

      if (!isAdmin && !vendorId) {
        throw new Error("Only vendors or admins can close tasks");
      }

      // Vendors can only close their own tasks
      if (!isAdmin && isVendor(user)) {
        const taskVendorId =
          typeof task.vendor === "string" ? task.vendor : task.vendor?.id;

        if (!taskVendorId || taskVendorId !== vendorId) {
          throw new Error("You do not have access to this task");
        }
      }

      // Update task status to closed and set closedAt timestamp
      const updatedTask = await db.update({
        collection: "vendor-tasks",
        id: input.taskId,
        data: {
          status: "closed",
          closedAt: new Date().toISOString(),
        },
      });

      return updatedTask;
    }),
});

