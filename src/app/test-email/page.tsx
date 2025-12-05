'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';

export default function TestEmailPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const sendTestEmail = async () => {
        if (!email) {
            toast({
                title: 'Email Required',
                description: 'Please enter an email address',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            setResult(data);

            if (data.success) {
                toast({
                    title: 'Test Email Sent!',
                    description: `Check ${email} (including spam folder)`,
                });
            } else {
                toast({
                    title: 'Email Failed',
                    description: data.error || 'Unknown error',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Request Failed',
                description: 'Could not send test email',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-shpc-sand p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-6 w-6" />
                            Email Configuration Test
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Test Email Address</label>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <Button
                            onClick={sendTestEmail}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Test Email
                                </>
                            )}
                        </Button>

                        {result && (
                            <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        {result.success ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                {result.success ? 'Email Sent Successfully' : 'Email Failed'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {result.message || result.error}
                                            </p>
                                            {result.emailId && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Email ID: {result.emailId}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm space-y-2">
                            <p className="font-semibold">📧 Email Troubleshooting Tips:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Check your spam/junk folder</li>
                                <li>Verify the email address is correct</li>
                                <li>Using onboarding@resend.dev (Resend test domain)</li>
                                <li>For production, add a verified domain in Resend</li>
                                <li>Check Resend dashboard for delivery logs</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
