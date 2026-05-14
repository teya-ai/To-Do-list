import { useGetDashboardStats, useListTasks } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import { CheckCircle2, Circle, Clock, ListTodo, Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useUser();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: tasks, isLoading: tasksLoading } = useListTasks({ status: "pending" });

  const recentTasks = tasks?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Good afternoon, {user?.firstName || "Friend"} ✨
        </h1>
        <p className="text-muted-foreground text-lg">Here's how your day is blossoming.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard title="Total Tasks" value={stats.total} icon={<ListTodo className="w-5 h-5 text-primary" />} />
          <StatCard title="Pending" value={stats.pending} icon={<Circle className="w-5 h-5 text-primary" />} />
          <StatCard title="In Progress" value={stats.inProgress} icon={<Clock className="w-5 h-5 text-accent-foreground" />} />
          <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
          <StatCard title="High Priority" value={stats.highPriority} icon={<Star className="w-5 h-5 text-destructive" />} />
          <StatCard title="Due Today" value={stats.dueTodayCount} icon={<Calendar className="w-5 h-5 text-secondary-foreground" />} />
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium">Recent Pending Tasks</h2>
          <Link href="/tasks">
            <Button variant="ghost" className="text-primary hover:text-primary/80">View all</Button>
          </Link>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <Card key={task.id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{task.title}</span>
                  </div>
                  <Link href="/tasks">
                    <Button variant="outline" size="sm" className="rounded-xl">Open</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-primary/20">
            <p className="text-muted-foreground">All caught up! Time to relax ☕️</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden relative group hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-secondary/50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-semibold">{value}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}