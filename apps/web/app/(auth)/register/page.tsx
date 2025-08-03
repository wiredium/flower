"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@packages/ui/src/button";
import { Input } from "@packages/ui/src/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/src/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@packages/ui/src/form";
import { toast } from "@packages/ui/src/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { trpc } from "@/lib/trpc";
import { setCookie } from "@/lib/cookies";
import { 
  User,
  Mail, 
  Lock, 
  Loader2, 
  Eye, 
  EyeOff,
  UserPlus,
  ArrowRight,
  Github,
  Chrome,
  CheckCircle
} from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: any) => {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      // Also set as cookies for middleware
      setCookie('access_token', data.accessToken, { 
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        path: '/',
        sameSite: 'lax'
      });
      setCookie('refresh_token', data.refreshToken, { 
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        path: '/',
        sameSite: 'lax'
      });
      
      toast({
        title: "Account created!",
        description: "Welcome to the platform. Let's get started!",
      });
      router.push("/projects");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch {
      // Error handling is done in onError callback
    }
  };

  const handleSocialSignup = (provider: string) => {
    toast({
      title: "Coming soon",
      description: `${provider} signup will be available soon.`,
    });
  };

  // Password strength indicator
  const password = form.watch("password");
  const passwordStrength = {
    hasMinLength: password?.length >= 8,
    hasUpperCase: /[A-Z]/.test(password || ""),
    hasLowerCase: /[a-z]/.test(password || ""),
    hasNumber: /[0-9]/.test(password || ""),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">Start building amazing workflows today</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("Google")}
                disabled={isLoading}
                className="w-full"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("GitHub")}
                disabled={isLoading}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          icon={<User className="h-4 w-4" />}
                          placeholder="John Doe"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          icon={<Mail className="h-4 w-4" />}
                          type="email"
                          placeholder="john@example.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            icon={<Lock className="h-4 w-4" />}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            disabled={isLoading}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {password && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Password strength:</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`h-3 w-3 ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span className={`text-xs ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-muted-foreground'}`}>
                                At least 8 characters
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`h-3 w-3 ${passwordStrength.hasUpperCase ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span className={`text-xs ${passwordStrength.hasUpperCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                                One uppercase letter
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`h-3 w-3 ${passwordStrength.hasLowerCase ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span className={`text-xs ${passwordStrength.hasLowerCase ? 'text-green-500' : 'text-muted-foreground'}`}>
                                One lowercase letter
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-500' : 'text-muted-foreground'}`}>
                                One number
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            icon={<Lock className="h-4 w-4" />}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            disabled={isLoading}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link 
                href="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}