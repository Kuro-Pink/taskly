import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Search, User } from 'lucide-react';

export default function Navbar() {
    return (
        <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
            {/* Search box */}
            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search backlog" className="w-64 pl-10" />
            </div>

            {/* Avatar và Filter */}
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                        NH
                    </div>
                    <User className="h-5 w-5 text-gray-500" />
                </div>

                {/* Epic Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-24 justify-between">
                            Epic
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All Epics</DropdownMenuItem>
                        <DropdownMenuItem>Epic 1</DropdownMenuItem>
                        <DropdownMenuItem>Epic 2</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Type Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-24 justify-between">
                            Type
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All Types</DropdownMenuItem>
                        <DropdownMenuItem>Bug</DropdownMenuItem>
                        <DropdownMenuItem>Task</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
