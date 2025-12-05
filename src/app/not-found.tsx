import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h2 className="text-6xl font-playfair font-bold text-shpc-ink mb-4">404</h2>
            <p className="text-xl text-neutral-600 mb-8">Could not find the requested page.</p>
            <Button asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return Home
                </Link>
            </Button>
        </div>
    )
}
