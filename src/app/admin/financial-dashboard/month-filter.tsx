'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function MonthFilter({ defaultMonth }: { defaultMonth: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMonth = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (newMonth) {
            params.set('month', newMonth);
        } else {
            params.delete('month');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="relative">
            <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input
                type="month"
                defaultValue={defaultMonth}
                className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleMonthChange}
            />
        </div>
    );
}
