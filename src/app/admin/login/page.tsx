
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, Mail, KeyRound } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  useEffect(() => {
    // If auth is done loading and the user is logged in, redirect to dashboard.
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async () => {
    if (!auth) {
      toast({ title: "Authentication service not ready.", variant: "destructive"});
      return;
    }
    if (!email || !password) {
        toast({ title: "Missing fields", description: "Please enter both email and password.", variant: "destructive" });
        return;
    }
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'Redirecting to the dashboard...',
      });
      // The useEffect above will handle the redirect.
    } catch (error) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  }

  // While Firebase is checking the auth state, show a loading indicator.
  // This prevents a flash of the login form if the user is already authenticated.
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="font-semibold text-lg mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, the useEffect will redirect them.
  // We can show a message during this brief period.
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-shpc-sand p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="font-semibold text-lg mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, show the login form.
  return (
    <div className="flex items-center justify-center min-h-screen bg-shpc-sand p-4">
      <Card className="w-full max-w-sm shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-primary"/>
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                    />
                </div>
            </div>
            <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                <div className="relative">
                     <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10"
                    />
                </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
