import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { initializeStores, useAuthStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';

import { useToast } from '../components/ui/Toast';

export const Login = () => {
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login, register, isAuthenticated, currentUser } = useAuthStore();
  const { addToast } = useToast();

  if (isAuthenticated && currentUser) {
    return <Navigate to={currentUser.role === 'manager' ? "/dashboard" : "/my-dashboard"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter an email address', 'error');
      return;
    }
    
    // In this demo, password is not checked
    const success = await login(email, password);
    if (success) {
      initializeStores();
      addToast(isRegistering ? 'Account created successfully' : 'Logged in successfully', 'success');
    } else {
      addToast(isRegistering ? 'Could not create account. The email may already exist.' : 'Invalid email or password.', 'error');
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0efe9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-stone-200 bg-white p-1.5 shadow-sm">
            <img src="/team.png" alt="TeamPulse" className="h-full w-full object-contain" />
          </div>
          <h2 className="mt-6 text-center text-[30px] font-semibold tracking-[-0.04em] text-stone-900">
            Weekly work, clearly reported.
          </h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{isRegistering ? 'Create account' : 'Welcome back'}</CardTitle>
              <CardDescription>
                {isRegistering ? 'Register as a team member' : 'Enter your email to sign in to your account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRegistering && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-[#e8f0eb] border-[#d3e2da]">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base text-[#244d3f]">Demo Accounts</CardTitle>
           
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="justify-start bg-white border-[#c8dbd1] hover:bg-[#dceae2]" onClick={() => fillDemoAccount('manager@demo.com')}>
              <div className="text-left w-full">
                <p className="font-semibold text-gray-900">Manager</p>
                <p className="text-xs text-gray-500 font-normal">manager@demo.com</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start bg-white border-[#c8dbd1] hover:bg-[#dceae2]" onClick={() => fillDemoAccount('alex@demo.com')}>
              <div className="text-left w-full">
                <p className="font-semibold text-gray-900">Team Member (Alex)</p>
                <p className="text-xs text-gray-500 font-normal">alex@demo.com</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};




