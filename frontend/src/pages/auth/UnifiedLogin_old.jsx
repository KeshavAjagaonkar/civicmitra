import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Zod validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid 10-digit phone number." }),
  address: z.string().min(5, { message: "Address is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const UnifiedLogin = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const { login, register: authRegister, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const currentSchema = mode === 'login' ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(currentSchema),
  });

  const toggleMode = () => {
    reset(); // Clear form fields and errors when switching modes
    setMode(prevMode => prevMode === 'login' ? 'register' : 'login');
  };

  const onSubmit = async (data) => {
    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: data.email, password: data.password });
        if (result.success) {
          toast({ title: "Login Successful", description: `Welcome back, ${result.user.name}!` });
        }
      } else {
        result = await authRegister({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          password: data.password,
        }, 'citizen');
        if (result.success) {
          toast({ title: "Registration Successful", description: "Welcome to CivicMitra!" });
        }
      }

      // Redirect on success
      if (result.success) {
        const user = result.user;
        switch (user.role) {
          case 'admin': navigate('/admin'); break;
          case 'staff': navigate('/staff'); break;
          case 'worker': navigate('/worker'); break;
          case 'citizen':
          default: navigate('/dashboard'); break;
        }
      }
    } catch (error) {
      // Errors are already handled and toasted by the AuthContext
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className={`p-3 bg-gradient-to-br rounded-full ${mode === 'login' ? 'from-blue-600 to-green-600' : 'from-purple-600 to-indigo-600'}`}>
              {mode === 'login' ? <LogIn className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl font-bold">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              {mode === 'login' ? 'Sign in to access your CivicMitra dashboard' : 'Join CivicMitra to file and track complaints'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Your 10-digit phone number" {...register('phone')} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Your full address" {...register('address')} />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="pl-10 h-12" />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" {...register('password')} className="pl-10 pr-12 h-12" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm your password" {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}
            
            {mode === 'login' && (
              <div className="flex justify-end">
                <Button asChild variant="link" className="p-0 h-auto text-sm">
                    <a href="/forgot-password">Forgot password?</a>
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full h-12" loading={authLoading}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <Button variant="link" onClick={toggleMode} className="p-0 h-auto font-medium">
                {mode === 'login' ? 'Sign up now' : 'Sign in'}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedLogin;
