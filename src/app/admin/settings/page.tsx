'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Settings as SettingsIcon, Mail, Send } from 'lucide-react';

interface Settings {
    serviceLimits: {
        airportTransfer: {
            maxPerDay: number;
            enabled: boolean;
        };
        laundry: {
            maxLoadsPerDay: number;
            enabled: boolean;
        };
    };
    businessHours: {
        start: string;
        end: string;
    };
}

export default function SettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [testEmail, setTestEmail] = useState('');
    const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/admin/settings');
            const data = await response.json();

            if (data.success) {
                setSettings(data.settings);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load settings',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setIsSaving(true);

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Settings saved successfully',
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to save settings',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmail) {
            toast({
                title: "Email Required",
                description: "Please enter a valid email address.",
                variant: "destructive"
            });
            return;
        }

        setIsSendingTestEmail(true);

        try {
            const response = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Email Sent Successfully",
                    description: `Sent using key: ${result.keyUsed}. Check spam if not in inbox.`,
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                title: "Failed to Send Email",
                description: error.message || "Unknown error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsSendingTestEmail(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-8">
                <p>Failed to load settings</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-shpc-sand min-h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <SettingsIcon className="h-8 w-8" />
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>
                <p className="text-muted-foreground">
                    Configure daily service limits and business hours
                </p>
            </header>

            <div className="max-w-2xl space-y-6">
                {/* Email System Debugging */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" /> Email System
                        </CardTitle>
                        <CardDescription>
                            Verify your email configuration (Resend API)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="test-email">Send Test Email</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="test-email"
                                    type="email"
                                    placeholder="your-email@example.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                                <Button
                                    onClick={handleSendTestEmail}
                                    disabled={isSendingTestEmail}
                                    variant="secondary"
                                >
                                    {isSendingTestEmail ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Send <Send className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Use this to verify that the Resend API Key is valid and the domain is verified.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Service Limits */}
                <Card>
                    <CardHeader>
                        <CardTitle>Service Limits</CardTitle>
                        <CardDescription>
                            Control how many bookings you can accept per day for each service
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Airport Transfer */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="transfer-enabled" className="text-base font-semibold">
                                        Airport Transfer
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Limit the number of transfer bookings per day
                                    </p>
                                </div>
                                <Switch
                                    id="transfer-enabled"
                                    checked={settings.serviceLimits.airportTransfer.enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            serviceLimits: {
                                                ...settings.serviceLimits,
                                                airportTransfer: {
                                                    ...settings.serviceLimits.airportTransfer,
                                                    enabled: checked,
                                                },
                                            },
                                        })
                                    }
                                />
                            </div>

                            {settings.serviceLimits.airportTransfer.enabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="transfer-max">Maximum bookings per day</Label>
                                    <Input
                                        id="transfer-max"
                                        type="number"
                                        min="1"
                                        value={settings.serviceLimits.airportTransfer.maxPerDay}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                serviceLimits: {
                                                    ...settings.serviceLimits,
                                                    airportTransfer: {
                                                        ...settings.serviceLimits.airportTransfer,
                                                        maxPerDay: parseInt(e.target.value) || 1,
                                                    },
                                                },
                                            })
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Current: {settings.serviceLimits.airportTransfer.maxPerDay} transfers per day
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-6" />

                        {/* Laundry Service */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="laundry-enabled" className="text-base font-semibold">
                                        Laundry Service
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Limit the number of laundry loads per day
                                    </p>
                                </div>
                                <Switch
                                    id="laundry-enabled"
                                    checked={settings.serviceLimits.laundry.enabled}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            serviceLimits: {
                                                ...settings.serviceLimits,
                                                laundry: {
                                                    ...settings.serviceLimits.laundry,
                                                    enabled: checked,
                                                },
                                            },
                                        })
                                    }
                                />
                            </div>

                            {settings.serviceLimits.laundry.enabled && (
                                <div className="space-y-2">
                                    <Label htmlFor="laundry-max">Maximum loads per day</Label>
                                    <Input
                                        id="laundry-max"
                                        type="number"
                                        min="1"
                                        value={settings.serviceLimits.laundry.maxLoadsPerDay}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                serviceLimits: {
                                                    ...settings.serviceLimits,
                                                    laundry: {
                                                        ...settings.serviceLimits.laundry,
                                                        maxLoadsPerDay: parseInt(e.target.value) || 1,
                                                    },
                                                },
                                            })
                                        }
                                        className="max-w-xs"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Current: {settings.serviceLimits.laundry.maxLoadsPerDay} loads per day
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Business Hours (Optional) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Business Hours</CardTitle>
                        <CardDescription>
                            Set your operating hours (for reference)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="hours-start">Start Time</Label>
                                <Input
                                    id="hours-start"
                                    type="time"
                                    value={settings.businessHours.start}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            businessHours: {
                                                ...settings.businessHours,
                                                start: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hours-end">End Time</Label>
                                <Input
                                    id="hours-end"
                                    type="time"
                                    value={settings.businessHours.end}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            businessHours: {
                                                ...settings.businessHours,
                                                end: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="lg"
                        className="bg-shpc-yellow text-shpc-ink hover:bg-shpc-yellow/90"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Settings
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
