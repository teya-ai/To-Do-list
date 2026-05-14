import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Mail } from "lucide-react";
import { useEffect } from "react";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Display name is too long"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user: clerkUser, isLoaded } = useUser();
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (profile?.displayName) {
      form.reset({ displayName: profile.displayName });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          toast({ title: "Profile updated", description: "Your details have been saved." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        },
      }
    );
  };

  if (!isLoaded || profileLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-muted rounded-xl animate-pulse" />
        <Card className="rounded-[2rem] border-none shadow-sm h-64 animate-pulse bg-white/50" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your Profile</h1>
        <p className="text-muted-foreground">Manage your personal details and preferences.</p>
      </div>

      <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 backdrop-blur-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-primary/30 to-accent/30 absolute top-0 left-0 right-0" />
        <CardContent className="pt-20 px-6 sm:px-10 pb-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative">
              {clerkUser?.imageUrl ? (
                <img 
                  src={clerkUser.imageUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-secondary flex items-center justify-center">
                  <UserCircle className="w-10 h-10 text-secondary-foreground" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold">{profile?.displayName || clerkUser?.firstName || "Welcome"}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground mt-1">
                <Mail className="w-4 h-4" />
                <span>{profile?.email || clerkUser?.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-3xl p-6 border border-primary/10">
            <h3 className="text-lg font-medium mb-4">Edit Details</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-base">Display Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your preferred name" 
                          className="rounded-xl bg-white border-transparent focus-visible:ring-primary focus-visible:bg-white h-12 text-base shadow-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={updateProfile.isPending} 
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-11 px-8 text-base font-medium transition-all hover:-translate-y-0.5"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}