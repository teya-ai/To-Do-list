import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTasks,
  useDeleteTask,
  getListTasksQueryKey,
  getGetDashboardStatsQueryKey,
  Task,
  ListTasksStatus,
  ListTasksPriority,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskDialog } from "@/components/task-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit2, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Tasks() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListTasksStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<ListTasksPriority | "all">("all");
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>(undefined);

  const { data: tasks, isLoading } = useListTasks({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    if (!taskToDelete) return;
    deleteTask.mutate(
      { id: taskToDelete.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          toast({ title: "Task deleted", description: "The task was removed successfully." });
          setTaskToDelete(undefined);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-accent text-accent-foreground"; // Soft lavender
      case "in_progress": return "bg-secondary text-secondary-foreground"; // Soft peach
      case "completed": return "bg-green-100 text-green-800"; // Soft sage
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-orange-50 text-orange-800"; // Cream/beige
      case "medium": return "bg-red-100 text-red-800"; // Light coral
      case "high": return "bg-primary/20 text-primary-foreground"; // Blush rose
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">Manage your blooming to-do list.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="rounded-xl shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </Button>
      </div>

      <Card className="rounded-3xl border-none shadow-sm bg-white/60 backdrop-blur-sm p-2">
        <CardContent className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-none bg-white focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="rounded-xl border-none bg-white focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-lg">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
            <SelectTrigger className="rounded-xl border-none bg-white focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-primary/10 shadow-lg">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="rounded-[2rem] border-none bg-white/50 h-32 animate-pulse" />
          ))}
        </div>
      ) : tasks?.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-[2rem] border border-dashed border-primary/20">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-6">Your list is looking wonderfully empty.</p>
          <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5">
            Plant a new task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks?.map((task, i) => (
            <Card 
              key={task.id} 
              className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg text-foreground truncate">{task.title}</h3>
                    <div className="flex gap-2">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(task.status)}`}>
                        {formatStatus(task.status)}
                      </span>
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                        {task.priority === "high" && <AlertCircle className="w-3 h-3" />}
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl bg-secondary/30 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
                    onClick={() => setTaskToEdit(task)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setTaskToDelete(task)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskDialog 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
      />
      
      {taskToEdit && (
        <TaskDialog 
          task={taskToEdit} 
          open={!!taskToEdit} 
          onOpenChange={(open) => !open && setTaskToEdit(undefined)} 
        />
      )}

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(undefined)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-xl bg-white/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete the task "{taskToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-xl border-primary/20">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Ensure CheckSquare is imported since it's used in the empty state
import { CheckSquare } from "lucide-react";