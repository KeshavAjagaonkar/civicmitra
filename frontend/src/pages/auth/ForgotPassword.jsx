import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import useApi from '@/hooks/useApi';

const ForgotPassword = () => {
    const { request, isLoading } = useApi();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await request('/api/auth/forgot-password', 'POST', { email });
            if (res?.success) {
                setSent(true);
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-8 pb-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold">Check Your Email</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            If an account exists for <strong>{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
                        </p>
                        <p className="text-xs text-gray-400">The link expires in 15 minutes.</p>
                        <Link to="/login">
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Forgot Password</CardTitle>
                    <CardDescription>Enter your email and we'll send you a reset link</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                        <div className="text-center">
                            <Link to="/login" className="text-sm text-blue-600 hover:underline">
                                <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
