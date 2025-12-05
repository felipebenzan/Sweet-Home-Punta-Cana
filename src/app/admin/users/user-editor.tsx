'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { createUser, updateUser } from '@/server-actions/users';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UserEditorProps {
    user?: any; // If provided, it's edit mode
}

const availablePermissions = [
    { value: '/admin/rooms', label: 'Manage Rooms' },
    { value: '/admin/excursions', label: 'Manage Excursions' },
    { value: '/admin/bookings/rooms', label: 'Room Bookings' },
    { value: '/admin/bookings/services', label: 'Service Bookings' },
    { value: '/admin/settings', label: 'Settings' },
];

export function UserEditor({ user }: UserEditorProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || 'COLLABORATOR',
        permissions: user?.permissions ? JSON.parse(user.permissions) : [],
    });

    const handlePermissionChange = (value: string, checked: boolean) => {
        setFormData(prev => {
            if (checked) {
                return { ...prev, permissions: [...prev.permissions, value] };
            } else {
                return { ...prev, permissions: prev.permissions.filter((p: string) => p !== value) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = user
                ? await updateUser(user.id, formData)
                : await createUser(formData);

            if (result.success) {
                toast({ title: user ? 'User updated' : 'User created' });
                router.push('/admin/users');
                router.refresh();
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{user ? 'New Password (leave blank to keep current)' : 'Password'}</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                                <SelectItem value="COLLABORATOR">Collaborator (Restricted)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.role === 'COLLABORATOR' && (
                        <div className="space-y-3 border rounded-md p-4 bg-gray-50">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availablePermissions.map((perm) => (
                                    <div key={perm.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={perm.value}
                                            checked={formData.permissions.includes(perm.value)}
                                            onCheckedChange={(checked) => handlePermissionChange(perm.value, checked as boolean)}
                                        />
                                        <label
                                            htmlFor={perm.value}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {perm.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {user ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
