import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, LogIn, UserPlus, Briefcase, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: "Please enter a valid 10-digit phone number." }),
  address: z.string().min(5, { message: "Address is required." }),
  role: z.enum(['citizen', 'worker'], { message: "Please select a role." }),
  department: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
}).refine(data => {
  // Department is required for workers
  if (data.role === 'worker' && !data.department) {
    return false;
  }
  return true;
}, {
  message: "Department is required for field workers.",
  path: ["department"],
});

const UnifiedLogin = () => {
  const [mode, setMode] = useState('login');
  const { login, register: authRegister, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const { request } = useApi();
  const [departments, setDepartments] = useState([]);

  const currentSchema = mode === 'login' ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: { role: 'citizen' },
  });

  const watchRole = watch('role');

  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await request('/api/departments');
      if (result.success) {
        setDepartments(result.data);
      }
    };
    if (mode === 'register' && watchRole === 'worker') {
      fetchDepartments();
    }
  }, [mode, watchRole, request]);

  const toggleMode = () => {
    reset();
    setMode(prevMode => prevMode === 'login' ? 'register' : 'login');
  };

  const onSubmit = async (data) => {
    try {
      let result;
      if (mode === 'login') {
        result = await login({ email: data.email, password: data.password });
        if (result.success) {
          toast({ title: "Login Successful", description: "Welcome back, " + result.user.name + "!" });
        }
      } else {
        const userData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          password: data.password,
        };
        if (data.role === 'worker' && data.department) {
          userData.department = data.department;
        }
        result = await authRegister(userData, data.role || 'citizen');
        if (result.success) {
          toast({ title: "Registration Successful", description: "Welcome to CivicMitra!" });
        }
      }

      if (result.success) {
        const user = result.user;
        switch (user.role) {
          case 'admin': navigate('/admin'); break;
          case 'staff': navigate('/staff'); break;
          case 'worker': navigate('/worker'); break;
          case 'citizen':
          default: navigate(user.slug ? ('/' + user.slug + '/dashboard') : '/dashboard'); break;
        }
      }
    } catch (error) {
      // Errors handled by AuthContext
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 glass-card">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className={"p-4 bg-gradient-to-br rounded-2xl shadow-lg " + (mode === 'login' ? 'from-blue-500 to-indigo-600' : 'from-purple-500 to-pink-600')}>
              {mode === 'login' ? <LogIn className="h-10 w-10 text-white" /> : <UserPlus className="h-10 w-10 text-white" />}
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {mode === 'login' ? 'Welcome Back' : 'Join CivicMitra'}
            </CardTitle>
            <CardDescription className="text-base">
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Create an account to get started'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    Full Name
                  </Label>
                  <Input id="name" placeholder="John Doe" {...register('name')} className="h-11" />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Phone Number
                  </Label>
                  <Input id="phone" placeholder="1234567890" {...register('phone')} className="h-11" maxLength={10} />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Address
                  </Label>
                  <Input id="address" placeholder="Your full address" {...register('address')} className="h-11" />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    Register As
                  </Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Citizen</SelectItem>
                          <SelectItem value="worker">Field Worker</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
                </div>

                {watchRole === 'worker' && (
                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      Department
                    </Label>
                    <Controller
                      name="department"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept._id} value={dept._id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Email Address
              </Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="h-11" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                Password
              </Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" {...register('password')} className="pr-10 h-11" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-2 h-7 w-7 p-0" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm your password" {...register('confirmPassword')} className="h-11" />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" loading={authLoading}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

          </form>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <Button variant="link" onClick={toggleMode} className="p-0 h-auto font-semibold text-blue-600">
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
