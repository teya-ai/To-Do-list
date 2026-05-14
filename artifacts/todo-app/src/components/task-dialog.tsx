import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateTask,
  useUpdateTask,
  getListTasksQueryKey,
  Task,
  TaskInputStatus,
  TaskInputPriority,
  getGetDashboardStatsQueryKey,
} from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: (task?.status as TaskInputStatus) || "pending",
      priority: (task?.priority as TaskInputPriority) || "medium",
      dueDate: task?.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
    },
  });

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const onSubmit = (data: TaskFormValues) => {
    // Convert empty string back to undefined for the API
    const submissionData = {
      ...data,
      description: data.description || undefined,
      dueDate: data.dueDate || undefined,
    };

    if (isEditing) {
      updateTask.mutate(
        { id: task.id, data: submissionData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
            toast({ title: "Task updated", description: "Your changes have been saved." });
            onOpenChange(false);
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
          },
        }
      );
    } else {
      createTask.mutate(
        { data: submissionData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
            toast({ title: "Task added", description: "Your new task is ready." });
            onOpenChange(false);
            form.reset();
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to create task.", variant: "destructive" });
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 border-none shadow-xl bg-white/95 backdrop-blur-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {isEditing ? "Edit Task" : "Add Task"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">What needs doing?</FormLabel>
                  <FormControl>
                    <Input placeholder="Water the plants..." className="rounded-xl bg-secondary/20 border-transparent focus-visible:ring-primary focus-visible:bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Details (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any extra notes here..."
                      className="rounded-xl bg-secondary/20 border-transparent focus-visible:ring-primary focus-visible:bg-white resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-secondary/20 border-transparent focus:ring-primary focus:bg-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-primary/10 shadow-lg">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-secondary/20 border-transparent focus:ring-primary focus:bg-white">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-primary/10 shadow-lg">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Due Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" className="rounded-xl bg-secondary/20 border-transparent focus-visible:ring-primary focus-visible:bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending || updateTask.isPending} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                {isEditing ? "Save Changes" : "Add Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}