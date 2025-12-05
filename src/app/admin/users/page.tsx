import { getUsers, deleteUser } from '@/server-actions/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { UserDeleteButton } from './user-delete-button';

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-serif text-shpc-dark">Team Management</h1>
                <Link href="/admin/users/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Member
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {user.role === 'ADMIN' ? (
                                            <span className="text-muted-foreground italic">All Access</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {JSON.parse(user.permissions).map((p: string) => (
                                                    <span key={p} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                                        {p === '*' ? 'All' : p.split('/').pop()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <UserDeleteButton userId={user.id} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
