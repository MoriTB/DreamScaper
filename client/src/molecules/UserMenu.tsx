import { useState } from "react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  username: string;
  avatarUrl?: string;
  onLogout: () => void;
}

export function UserMenu({ username, avatarUrl, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 focus:outline-none">
          <Avatar className="h-8 w-8 border-2 border-purple-300">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{getInitials(username)}</AvatarFallback>
          </Avatar>
          <span className="hidden md:block">{username}</span>
          <ChevronDown className="hidden md:block h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="glass dark:glass-dark w-48 py-1"
      >
        <DropdownMenuItem
          onClick={() => {
            navigate("/profile");
            setOpen(false);
          }}
          className="flex items-center px-4 py-2 hover:bg-purple-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {
            navigate("/settings");
            setOpen(false);
          }}
          className="flex items-center px-4 py-2 hover:bg-purple-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="border-neutral-200 dark:border-neutral-700 my-1" />
        
        <DropdownMenuItem
          onClick={() => {
            onLogout();
            setOpen(false);
          }}
          className="flex items-center px-4 py-2 hover:bg-purple-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
