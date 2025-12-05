'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddExpensePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = {
            providerName: formData.get('providerName'),
            amount: parseFloat(formData.get('amount') as string),
            month: formData.get('month'),
            ncf: formData.get('ncf'),
            description: formData.get('description'),
        };

        try {
            const response = await fetch('/api/admin/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                router.push('/admin/financial-dashboard');
                router.refresh();
            } else {
                alert('Failed to save expense');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving expense');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Link href="/admin/financial-dashboard">
                        <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Back
                        </Button>
                    </Link>
                    <CardTitle>Add Monthly Expense</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="providerName">Provider</Label>
                            <Select name="providerName" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Booking.com">Booking.com</SelectItem>
                                    <SelectItem value="Expedia">Expedia</SelectItem>
                                    {/* Ideally fetch from API */}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="month">Month</Label>
                            <Input type="month" name="month" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input type="number" name="amount" step="0.01" min="0" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ncf">NCF (Comprobante)</Label>
                            <Input name="ncf" placeholder="B01..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input name="description" placeholder="Commission Invoice..." />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Expense'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
