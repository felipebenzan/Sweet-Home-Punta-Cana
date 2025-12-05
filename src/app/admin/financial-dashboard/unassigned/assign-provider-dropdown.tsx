'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';
import { assignProvider } from '../actions';
import { useRouter } from 'next/navigation';

interface Provider {
    id: string;
    name: string;
    type: string;
}

interface AssignProviderDropdownProps {
    lineItemId: string;
    providers: Provider[];
}

export function AssignProviderDropdown({ lineItemId, providers }: AssignProviderDropdownProps) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleAssign = async (providerId: string) => {
        setIsPending(true);
        try {
            const result = await assignProvider(lineItemId, providerId);
            if (result.success) {
                // Success - UI will update via revalidatePath in action
            } else {
                alert('Failed to assign provider');
            }
        } catch (error) {
            console.error(error);
            alert('Error assigning provider');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isPending} className="w-[200px] justify-between">
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Assigning...
                        </>
                    ) : (
                        <>
                            Assign Provider
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Select Provider</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {providers.map((provider) => (
                    <DropdownMenuItem
                        key={provider.id}
                        onClick={() => handleAssign(provider.id)}
                        className="cursor-pointer"
                    >
                        <span className="flex-1">{provider.name}</span>
                        <span className="text-xs text-muted-foreground ml-2 lowercase">{provider.type}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
