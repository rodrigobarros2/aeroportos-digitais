"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { DropdownMenu } from "./ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { Switch } from "./ui/switch";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();

  const handleClick = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className=" font-bold">
          Aeroporto Delivery
        </Link>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <span className="mr-4">{session.user?.name}</span>
              <Button onClick={() => signOut()} className="px-4 py-2 rounded">
                Sair
              </Button>
            </>
          ) : (
            <Button onClick={() => signIn("google")} className=" px-4 py-2 rounded">
              Entrar
            </Button>
          )}

          <DropdownMenu>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={theme === "dark"} onCheckedChange={handleClick} aria-label="Toggle dark mode" />
              <Moon className="h-4 w-4" />
            </div>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
