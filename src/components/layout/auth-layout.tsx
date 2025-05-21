'use client'
import { useTheme } from 'next-themes';
import { Moon, Sun, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';
import Image from 'next/image';

export interface AuthClientLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  currentStep?: 'signup' | 'verify-email' | 'verified' | 'about-you' | 'study-vibe' | 'add-profile';
}

export default function AuthClientLayout({
  children,
  showSidebar = true,
  currentStep = 'signup'
}: AuthClientLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className='flex flex-col w-full min-h-screen'>
      {/* Fixed Top Bar */}
      <div className='fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-8 py-2'>

        <div className='flex items-center'>
          <img src='/assets/orange.png' alt='Logo' className='h-8 w-8 ' />
          <div className='w-[1px] h-[25px] bg-[#A3A3A3] mx-3' />
          <div className='flex items-center space-x-2'>
            <Globe className='h-5 w-5' color='#A3A3A3' />
            <select className='bg-transparent  focus:outline-none focus:border-primary text-[#A3A3A3]'>
              <option value='en'>English</option>
              <option value='es'>Español</option>
              <option value='fr'>Français</option>
            </select>
          </div>
        </div>

        <div className='flex items-center space-x-6'>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={`flex w-full min-h-screen p-10 px-32 pt-24 ${!showSidebar ? 'justify-center' : ''}`}>
        {showSidebar && (
          <aside className='fixed w-1/3 h-screen flex items-start'>
            <h1 className='text-[85px] font-semibold max-w-[350px]'>
              {currentStep === 'add-profile' ? (
                <>
                  <Image 
                    src={theme === 'dark' ? '/assets/add-your-look-dark.png' : '/assets/add-your-look.png'} 
                    alt='add your look' 
                    width={300} 
                    height={300}
                  />
                </>
              ) : currentStep === 'verified' ? (
                'Lets get started'
              ) : (
                <>
                  Think It.
                  <br />
                  Learn It.
                </>
              )}
            </h1>
          </aside>
        )}

        <main className={`${showSidebar ? 'w-1/3 ml-[33.333%]' : 'w-full max-w-2xl'} flex pt-[53px] justify-center`}>
          {children}
        </main>

        {showSidebar && <div className='w-1/3'></div>}
      </div>
    </div>
  )
}
