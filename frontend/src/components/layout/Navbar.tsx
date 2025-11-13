// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Menu,
//   X,
//   Upload,
//   Shield,
//   BarChart3,
//   Wallet,
//   FilePlus,
//   Home,
//   Sun,
//   Moon,
//   LogOut,
//   UserCheck,
//   Scan,
//   CheckCircle,
//   Copy,
//   User,
//   Settings,
//   Loader2,
//   ChevronDown
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
//   DropdownMenuLabel,
//   DropdownMenuGroup,
// } from '@/components/ui/dropdown-menu';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { cn } from '@/lib/utils';
// import { useWeb3 } from '../../context/Web3Context';

// // --- Types ---
// type Theme = 'light' | 'dark' | 'system';

// interface NavigationItem {
//   name: string;
//   path: string;
//   icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
// }

// // --- Hooks ---

// /**
//  * Hook for managing theme state
//  */
// const useTheme = () => {
//   const [theme, setTheme] = useState<Theme>('dark');
//   const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
//   const [mounted, setMounted] = useState<boolean>(false);

//   const applyTheme = useCallback((themeToApply: 'light' | 'dark') => {
//     const root = document.documentElement;
//     root.classList.remove('light', 'dark');
//     root.classList.add(themeToApply);
//     root.setAttribute('data-theme', themeToApply);
//     setResolvedTheme(themeToApply);
//   }, []);

//   useEffect(() => {
//     const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
//     setTheme(savedTheme);
    
//     let effectiveTheme: 'light' | 'dark';
//     if (savedTheme === 'system') {
//       effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     } else {
//       effectiveTheme = savedTheme;
//     }
    
//     applyTheme(effectiveTheme);
//     setMounted(true);
//   }, [applyTheme]);

//   const toggleTheme = useCallback(() => {
//     const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
//     localStorage.setItem('theme', newTheme);
//     setTheme(newTheme);
//     applyTheme(newTheme);
//   }, [resolvedTheme, applyTheme]);

//   return { mounted, resolvedTheme, toggleTheme };
// };

// /**
//  * Hook to check if a path is active
//  */
// const useIsActivePath = () => {
//   const location = useLocation();
//   return useCallback((path: string): boolean => {
//     if (path === '/') return location.pathname === '/';
//     return location.pathname.startsWith(path);
//   }, [location.pathname]);
// };

// // --- Main Navbar Component ---

// const Navbar: React.FC<{ className?: string }> = ({ className }) => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
//   const { mounted, resolvedTheme, toggleTheme } = useTheme();

//   if (!mounted) {
//     // Render nothing on the server to avoid SSR mismatch
//     return <div className="h-16" />;
//   }

//   return (
//     <>
//       <nav className={cn(
//         "fixed top-0 left-0 right-0 z-50",
//         "bg-background/80 backdrop-blur-xl border-b",
//         "supports-[backdrop-filter]:bg-background/60",
//         className
//       )}>
//         <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
//           <div className="flex items-center justify-between h-16">
            
//             <Logo />
            
//             <DesktopNav />
            
//             <div className="flex items-center gap-2">
//               {/* <ThemeToggle 
//                 resolvedTheme={resolvedTheme} 
//                 toggleTheme={toggleTheme} 
//               /> */}
//               <UserActions />
//               <MobileMenu 
//                 isOpen={isMobileMenuOpen}
//                 setIsOpen={setIsMobileMenuOpen}
//                 resolvedTheme={resolvedTheme}
//                 toggleTheme={toggleTheme}
//               />
//             </div>

//           </div>
//         </div>
//       </nav>
//       {/* Placeholder to prevent content from jumping */}
//       <div className="h-16" />
//     </>
//   );
// };

// // --- Sub-Components ---

// const navigationItems: NavigationItem[] = [
//   { name: 'Home', path: '/', icon: Home },
//   { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
//   { name: 'Upload', path: '/upload', icon: Upload },
//   { name: 'Verify', path: '/verify', icon: Shield },
//   { name: 'Issue', path: '/issue-document', icon: FilePlus },
//   { name: 'Scanner', path: '/qr-scanner', icon: Scan },
// ];

// const Logo: React.FC = () => (
//   <Link to="/" className="flex items-center gap-3 group">
//     <img src='/logo.svg' width={32} height={32}/>
//     <div className="hidden sm:block">
//       <h2 className="text-lg font-bold text-foreground">
//         DocVerify
//       </h2>
//     </div>
//   </Link>
// );

// const DesktopNav: React.FC = () => (
//   <nav className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-full p-1.5">
//     {navigationItems.map((item) => (
//       <DesktopNavLink key={item.path} item={item} />
//     ))}
//   </nav>
// );

// const DesktopNavLink: React.FC<{ item: NavigationItem }> = ({ item }) => {
//   const isActive = useIsActivePath()(item.path);

//   return (
//     <TooltipProvider delayDuration={100}>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <Link 
//             to={item.path} 
//             className={cn(
//               "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
//               isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
//             )}
//           >
//             <item.icon className="w-4 h-4 text-accent-foreground" />
//             <span className="hidden xl:inline-block text-accent-foreground">{item.name}</span>
//             {isActive && (
//               <motion.div 
//                 layoutId="desktop-nav-active" 
//                 className="absolute inset-0 bg-primary/10 rounded-full -z-10"
//                 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//               />
//             )}
//           </Link>
//         </TooltipTrigger>
//         <TooltipContent className="xl:hidden">
//           {item.name}
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// };

// const ThemeToggle: React.FC<{ resolvedTheme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ resolvedTheme, toggleTheme }) => (
//   <TooltipProvider>
//     <Tooltip>
//       <TooltipTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={toggleTheme}
//           className="rounded-full w-9 h-9"
//         >
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={resolvedTheme}
//               initial={{ scale: 0, rotate: -180 }}
//               animate={{ scale: 1, rotate: 0 }}
//               exit={{ scale: 0, rotate: 180 }}
//               transition={{ duration: 0.2 }}
//             >
//               {resolvedTheme === 'dark' ? (
//                 <Moon className="w-4 h-4" />
//               ) : (
//                 <Sun className="w-4 h-4" />
//               )}
//             </motion.div>
//           </AnimatePresence>
//         </Button>
//       </TooltipTrigger>
//       <TooltipContent>Toggle theme</TooltipContent>
//     </Tooltip>
//   </TooltipProvider>
// );

// const UserActions: React.FC = () => {
//   const { 
//     isConnected, 
//     account, 
//     user,
//     isAuthenticated,
//     isAuthenticating,
//     isConnecting,
//     connectWallet, 
//     disconnectWallet,
//     signInWithEthereum,
//     logout
//   } = useWeb3();

//   const [copied, setCopied] = useState<boolean>(false);

//   const formatAddress = useCallback((address: string | null): string => {
//     if (!address) return '';
//     return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
//   }, []);

//   const copyToClipboard = useCallback(async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy text: ', err);
//     }
//   }, []);

//   const getAvatarFallback = useCallback(() => {
//     const displayName = user?.username || user?.email?.split('@')[0] || account;
//     return displayName ? displayName.substring(0, 2).toUpperCase() : 'U';
//   }, [user, account]);

//   if (isConnecting || isAuthenticating) {
//     return (
//       <Button size="sm" disabled className="min-w-[100px]">
//         <Loader2 className="w-4 h-4 animate-spin" />
//       </Button>
//     );
//   }

//   if (!isConnected) {
//     return (
//       <Button
//         onClick={connectWallet}
//         size="sm"
//         className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
//       >
//         <Wallet className="w-4 h-4 mr-2" />
//         Connect
//       </Button>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <Button
//         onClick={signInWithEthereum}
//         size="sm"
//         className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 text-white"
//       >
//         <UserCheck className="w-4 h-4 mr-2" />
//         Sign In
//       </Button>
//     );
//   }

//   // Authenticated
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           className="flex items-center gap-2 h-9 px-2"
//         >
//           <Avatar className="w-7 h-7">
//             <AvatarFallback className="bg-primary text-primary-foreground text-xs">
//               {getAvatarFallback()}
//             </AvatarFallback>
//           </Avatar>
//           <span className="hidden sm:inline-block text-xs font-mono">
//             {formatAddress(account)}
//           </span>
//           <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:inline-block" />
//         </Button>
//       </DropdownMenuTrigger>
      
//       <DropdownMenuContent align="end" className="w-64">
//         <DropdownMenuLabel className="flex items-center gap-3 py-2">
//           <Avatar className="w-9 h-9">
//             <AvatarFallback className="bg-primary text-primary-foreground">
//               {getAvatarFallback()}
//             </AvatarFallback>
//           </Avatar>
//           <div className="min-w-0">
//             <p className="text-sm font-medium truncate">
//               {user?.username || formatAddress(account)}
//             </p>
//             <div className="flex items-center gap-1.5">
//               <p className="text-xs text-muted-foreground font-mono truncate">
//                 {formatAddress(account)}
//               </p>
//               <AnimatePresence>
//                 {copied && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     exit={{ scale: 0 }}
//                   >
//                     <CheckCircle className="w-3 h-3 text-emerald-500" />
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </DropdownMenuLabel>
        
//         <div className="px-2 py-1">
//           <Badge variant="secondary" className="text-xs">
//             {user?.role || 'User'}
//           </Badge>
//         </div>

//         <DropdownMenuSeparator />
        
//         <DropdownMenuGroup>
//           <DropdownMenuItem asChild>
//             <Link to="/profile" className="cursor-pointer">
//               <User className="w-4 h-4 mr-2" />
//               <span>Profile</span>
//             </Link>
//           </DropdownMenuItem>
//           <DropdownMenuItem className="cursor-pointer" onClick={() => copyToClipboard(account || '')}>
//             <Copy className="w-4 h-4 mr-2" />
//             <span>Copy Address</span>
//           </DropdownMenuItem>
//           <DropdownMenuItem className="cursor-pointer">
//             <Settings className="w-4 h-4 mr-2" />
//             <span>Settings</span>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
        
//         <DropdownMenuSeparator />
        
//         <DropdownMenuItem 
//           onClick={logout}
//           className="cursor-pointer text-amber-600 focus:text-amber-600"
//         >
//           <LogOut className="w-4 h-4 mr-2" />
//           <span>Sign Out</span>
//         </DropdownMenuItem>
        
//         <DropdownMenuItem 
//           onClick={disconnectWallet}
//           className="cursor-pointer text-red-600 focus:text-red-600"
//         >
//           <Wallet className="w-4 h-4 mr-2" />
//           <span>Disconnect Wallet</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

// const MobileMenu: React.FC<{
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
//   resolvedTheme: 'light' | 'dark';
//   toggleTheme: () => void;
// }> = ({ isOpen, setIsOpen, resolvedTheme, toggleTheme }) => (
//   <Sheet open={isOpen} onOpenChange={setIsOpen}>
//     <SheetTrigger asChild>
//       <Button
//         variant="ghost"
//         size="icon"
//         className="lg:hidden rounded-full w-9 h-9"
//       >
//         <AnimatePresence>
//           <motion.div
//             key={isOpen ? 'x' : 'menu'}
//             initial={{ scale: 0, rotate: -90 }}
//             animate={{ scale: 1, rotate: 0 }}
//             exit={{ scale: 0, rotate: 90 }}
//             transition={{ duration: 0.2 }}
//           >
//             {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//           </motion.div>
//         </AnimatePresence>
//       </Button>
//     </SheetTrigger>
    
//     <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
//       <SheetHeader className="p-6 border-b">
//         <SheetTitle className="text-left">
//           <Logo />
//         </SheetTitle>
//       </SheetHeader>
      
//       <div className="flex-1 overflow-y-auto p-6 space-y-6">
//         {/* Navigation */}
//         <div className="space-y-2">
//           <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3">
//             Navigation
//           </h3>
//           <div className="flex flex-col gap-1">
//             {navigationItems.map((item) => (
//               <MobileNavLink key={item.path} item={item} onClick={() => setIsOpen(false)} />
//             ))}
//           </div>
//         </div>
        
//         <Separator />
        
//         {/* Account */}
//         <div className="space-y-4">
//           <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3">
//             Account
//           </h3>
//           <MobileAccountSection />
//         </div>
//       </div>
      
//       <div className="p-6 border-t">
//         <Button
//           onClick={toggleTheme}
//           variant="outline"
//           className="w-full justify-start gap-2"
//         >
//           {resolvedTheme === 'dark' ? (
//             <Moon className="w-4 h-4" />
//           ) : (
//             <Sun className="w-4 h-4" />
//           )}
//           <span>{resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode</span>
//         </Button>
//       </div>
//     </SheetContent>
//   </Sheet>
// );

// const MobileNavLink: React.FC<{ item: NavigationItem; onClick: () => void; }> = ({ item, onClick }) => {
//   const isActive = useIsActivePath()(item.path);
//   return (
//     <Link 
//       to={item.path} 
//       onClick={onClick}
//       className={cn(
//         "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all",
//         isActive
//           ? "bg-primary/10 text-primary"
//           : "text-muted-foreground hover:text-foreground hover:bg-accent"
//       )}
//     >
//       <item.icon className="w-5 h-5" />
//       <span>{item.name}</span>
//     </Link>
//   );
// };

// const MobileAccountSection: React.FC = () => {
//   const { 
//     isConnected, 
//     account, 
//     user,
//     isAuthenticated,
//     isAuthenticating,
//     isConnecting,
//     connectWallet, 
//     disconnectWallet,
//     signInWithEthereum,
//     logout
//   } = useWeb3();

//   const formatAddress = useCallback((address: string | null): string => {
//     if (!address) return '';
//     return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
//   }, []);

//   const getAvatarFallback = useCallback(() => {
//     const displayName = user?.username || user?.email?.split('@')[0] || account;
//     return displayName ? displayName.substring(0, 2).toUpperCase() : 'U';
//   }, [user, account]);

//   if (isConnecting || isAuthenticating) {
//     return (
//       <Button size="lg" disabled className="w-full">
//         <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//         Processing...
//       </Button>
//     );
//   }

//   if (!isConnected) {
//     return (
//       <Button
//         onClick={connectWallet}
//         size="lg"
//         className="w-full bg-primary hover:bg-primary/90"
//       >
//         <Wallet className="w-5 h-5 mr-2" />
//         Connect Wallet
//       </Button>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="space-y-3">
//         <Button
//           onClick={signInWithEthereum}
//           size="lg"
//           className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
//         >
//           <UserCheck className="w-5 h-5 mr-2" />
//           Sign In with Ethereum
//         </Button>
//         <Button
//           onClick={disconnectWallet}
//           variant="outline"
//           size="lg"
//           className="w-full"
//         >
//           <Wallet className="w-5 h-5 mr-2" />
//           Disconnect Wallet
//         </Button>
//       </div>
//     );
//   }

//   // Authenticated
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
//         <Avatar className="w-10 h-10">
//           <AvatarFallback className="bg-primary text-primary-foreground">
//             {getAvatarFallback()}
//           </AvatarFallback>
//         </Avatar>
//         <div className="min-w-0">
//           <p className="text-sm font-medium text-foreground truncate">
//             {user?.username || formatAddress(account)}
//           </p>
//           <p className="text-xs text-muted-foreground font-mono truncate">
//             {formatAddress(account)}
//           </p>
//           <Badge variant="secondary" className="text-xs mt-1">
//             {user?.role || 'User'}
//           </Badge>
//         </div>
//       </div>
//       <div className="space-y-2">
//         <Button asChild variant="ghost" className="w-full justify-start gap-2">
//           <Link to="/profile">
//             <User className="w-4 h-4" />
//             <span>Profile</span>
//           </Link>
//         </Button>
//         <Button variant="ghost" className="w-full justify-start gap-2">
//           <Settings className="w-4 h-4" />
//           <span>Settings</span>
//         </Button>
//       </div>
//       <Separator />
//       <div className="space-y-3">
//         <Button
//           onClick={logout}
//           variant="outline"
//           className="w-full text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 dark:text-amber-500 dark:border-amber-500/30 dark:hover:border-amber-500/50"
//         >
//           <LogOut className="w-4 h-4 mr-2" />
//           Sign Out
//         </Button>
//         <Button
//           onClick={disconnectWallet}
//           variant="destructive"
//           className="w-full"
//         >
//           <Wallet className="w-4 h-4 mr-2" />
//           Disconnect Wallet
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Navbar;


import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Upload,
  Shield,
  BarChart3,
  Wallet,
  FilePlus,
  Home,
  Sun,
  Moon,
  LogOut,
  UserCheck,
  Scan,
  CheckCircle,
  Copy,
  User,
  Settings,
  Loader2,
  ChevronDown,
  ShieldCheck, // Added for new link and logo
  BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useWeb3 } from '../../context/Web3Context';

// --- Types ---
type Theme = 'light' | 'dark' | 'system';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// --- Hooks ---

/**
 * Hook for managing theme state
 */
const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState<boolean>(false);

  const applyTheme = useCallback((themeToApply: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeToApply);
    root.setAttribute('data-theme', themeToApply);
    setResolvedTheme(themeToApply);
  }, []);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
    setTheme(savedTheme);
    
    let effectiveTheme: 'light' | 'dark';
    if (savedTheme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = savedTheme;
    }
    
    applyTheme(effectiveTheme);
    setMounted(true);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    applyTheme(newTheme);
  }, [resolvedTheme, applyTheme]);

  return { mounted, resolvedTheme, toggleTheme };
};

/**
 * Hook to check if a path is active
 */
const useIsActivePath = () => {
  const location = useLocation();
  return useCallback((path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }, [location.pathname]);
};

// --- Main Navbar Component ---

const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { mounted, resolvedTheme, toggleTheme } = useTheme();

  if (!mounted) {
    // Render nothing on the server to avoid SSR mismatch
    return <div className="h-16" />;
  }

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/80 backdrop-blur-xl border-b",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            <Logo />
            <DesktopNav />
            <div className="flex items-center gap-2">
              <UserActions />
              <MobileMenu 
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
                resolvedTheme={resolvedTheme}
                toggleTheme={toggleTheme}
              />
            </div>

          </div>
        </div>
      </nav>
      {/* Placeholder to prevent content from jumping */}
      <div className="h-16" />
    </>
  );
};

// --- Sub-Components ---

// [MODIFIED] Added "Third Party" link
const navigationItems: NavigationItem[] = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { name: 'Upload', path: '/upload', icon: Upload },
  { name: 'Verify', path: '/verify', icon: Shield },
  { name: 'Third Party', path: '/third-party-verify', icon: BadgeCheck },
  { name: 'Issue', path: '/issue-document', icon: FilePlus },
  { name: 'Scanner', path: '/qr-scanner', icon: Scan },
];

const Logo: React.FC = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <img src='/logo.svg' width={40} height={40}/>
    <div className="hidden sm:block">
      <h2 className="text-lg font-bold text-foreground">
        DocVerify
      </h2>
    </div>
  </Link>
);

const DesktopNav: React.FC = () => (
  // [MODIFIED] Changed from bg-muted/50 to bg-muted for a solid, modern "dock" look
  <nav className="hidden lg:flex items-center gap-1 rounded-full p-1.5">
    {navigationItems.map((item) => (
      <DesktopNavLink key={item.path} item={item} />
    ))}
  </nav>
);

const DesktopNavLink: React.FC<{ item: NavigationItem }> = ({ item }) => {
  const isActive = useIsActivePath()(item.path);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={item.path} 
            className={cn(
              "relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden xl:inline-block">{item.name}</span>
            {isActive && (
              <motion.div 
                layoutId="desktop-nav-active" 
                className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent className="xl:hidden">
          {item.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ThemeToggle: React.FC<{ resolvedTheme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ resolvedTheme, toggleTheme }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-9 h-9"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={resolvedTheme}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </motion.div>
          </AnimatePresence>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const UserActions: React.FC = () => {
  const { 
    isConnected, 
    account, 
    user,
    isAuthenticated,
    isAuthenticating,
    isConnecting,
    connectWallet, 
    disconnectWallet,
    signInWithEthereum,
    logout
  } = useWeb3();

  const [copied, setCopied] = useState<boolean>(false);

  const formatAddress = useCallback((address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  const getAvatarFallback = useCallback(() => {
    const displayName = user?.username || user?.email?.split('@')[0] || account;
    return displayName ? displayName.substring(0, 2).toUpperCase() : 'U';
  }, [user, account]);

  if (isConnecting || isAuthenticating) {
    return (
      <Button size="sm" disabled className="min-w-[100px]">
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        size="sm"
        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
      >
        <Wallet className="w-4 h-4 mr-2" />
        Connect
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={signInWithEthereum}
        size="sm"
        className="bg-primary shadow-lg shadow-orange-500/20 text-white"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    );
  }

  // Authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* [MODIFIED] Changed variant from "ghost" to "outline" */}
        <Button
          variant="outline"
          className="flex items-center gap-2 h-9 px-2"
        >
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block text-xs font-mono">
            {formatAddress(account)}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:inline-block" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.username || formatAddress(account)}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground font-mono truncate">
                {formatAddress(account)}
              </p>
              <AnimatePresence>
                {copied && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <div className="px-2 py-1">
          <Badge variant="secondary" className="text-xs">
            {user?.role || 'User'}
          </Badge>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile" className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => copyToClipboard(account || '')}>
            <Copy className="w-4 h-4 mr-2" />
            <span>Copy Address</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={logout}
          className="cursor-pointer text-amber-600 focus:text-amber-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={disconnectWallet}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <Wallet className="w-4 h-4 mr-2" />
          <span>Disconnect Wallet</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MobileMenu: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}> = ({ isOpen, setIsOpen, resolvedTheme, toggleTheme }) => (
  <Sheet open={isOpen} onOpenChange={setIsOpen}>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden rounded-full w-9 h-9"
      >
        <AnimatePresence>
          <motion.div
            key={isOpen ? 'x' : 'menu'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.div>
        </AnimatePresence>
      </Button>
    </SheetTrigger>
    
    <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
      <SheetHeader className="p-6">
        <SheetTitle className="text-left">
          <Logo />
        </SheetTitle>
      </SheetHeader>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Navigation */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3">
            Navigation
          </h3>
          <div className="flex flex-col gap-1">
            {navigationItems.map((item) => (
              <MobileNavLink key={item.path} item={item} onClick={() => setIsOpen(false)} />
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Account */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3">
            Account
          </h3>
          <MobileAccountSection />
        </div>
      </div>
      
      <div className="p-6 border-t">
        <Button
          onClick={toggleTheme}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span>{resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode</span>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
);

const MobileNavLink: React.FC<{ item: NavigationItem; onClick: () => void; }> = ({ item, onClick }) => {
  const isActive = useIsActivePath()(item.path);
  return (
    <Link 
      to={item.path} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.name}</span>
    </Link>
  );
};

const MobileAccountSection: React.FC = () => {
  const { 
    isConnected, 
    account, 
    user,
    isAuthenticated,
    isAuthenticating,
    isConnecting,
    connectWallet, 
    disconnectWallet,
    signInWithEthereum,
    logout
  } = useWeb3();

  const formatAddress = useCallback((address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

  const getAvatarFallback = useCallback(() => {
    const displayName = user?.username || user?.email?.split('@')[0] || account;
    return displayName ? displayName.substring(0, 2).toUpperCase() : 'U';
  }, [user, account]);

  if (isConnecting || isAuthenticating) {
    return (
      <Button size="lg" disabled className="w-full">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        size="lg"
        className="w-full bg-primary hover:bg-primary/90"
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <Button
          onClick={signInWithEthereum}
          size="lg"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
        >
          <UserCheck className="w-5 h-5 mr-2" />
          Sign In with Ethereum
        </Button>
        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    );
  }

  // Authenticated
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getAvatarFallback()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.username || formatAddress(account)}
          </p>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {formatAddress(account)}
          </p>
          <Badge variant="secondary" className="text-xs mt-1">
            {user?.role || 'User'}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <Button asChild variant="ghost" className="w-full justify-start gap-2">
          <Link to="/profile">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Button>
      </div>
      <Separator />
      <div className="space-y-3">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 dark:text-amber-500 dark:border-amber-500/30 dark:hover:border-amber-500/50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <Button
          onClick={disconnectWallet}
          variant="destructive"
          className="w-full"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    </div>
  );
};

export default Navbar;