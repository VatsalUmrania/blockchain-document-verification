// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import {
//   Menu,
//   X,
//   Upload,
//   Shield,
//   BarChart3,
//   Box,
//   Wallet,
//   Building,
//   FilePlus,
//   QrCode,
//   Home,
//   Sun,
//   Moon,
//   LogOut,
//   WalletCards,
//   UserCheck,
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
// } from '@/components/ui/dropdown-menu';
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from '@/components/ui/tooltip';
// import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status';
// import { cn } from '@/lib/utils';
// import { useWeb3 } from '../../context/Web3Context';

// // Types
// type Theme = 'light' | 'dark' | 'system';

// interface NavigationItem {
//   name: string;
//   path: string;
//   icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
//   shortName?: string;
// }

// interface NavbarProps {
//   className?: string;
// }

// // Device Detection Hook
// const useDeviceType = () => {
//   const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
//   const [isTouchDevice, setIsTouchDevice] = useState(false);

//   useEffect(() => {
//     const checkDevice = () => {
//       const width = window.innerWidth;
//       const isTouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
//       setIsTouchDevice(isTouchSupported);
      
//       if (width < 768) {
//         setDeviceType('mobile');
//       } else if (width < 1024) {
//         setDeviceType('tablet');
//       } else {
//         setDeviceType('desktop');
//       }
//     };

//     checkDevice();
//     window.addEventListener('resize', checkDevice);
//     return () => window.removeEventListener('resize', checkDevice);
//   }, []);

//   return { deviceType, isTouchDevice };
// };

// // Adaptive Theme Toggle
// const AdaptiveThemeToggle = ({ 
//   theme, 
//   onClick, 
//   deviceType,
//   className 
// }: { 
//   theme: 'light' | 'dark';
//   onClick: () => void;
//   deviceType: 'mobile' | 'tablet' | 'desktop';
//   className?: string;
// }) => {
//   const handleClick = useCallback(() => {
//     if (deviceType === 'desktop') {
//       const styleId = `theme-transition-${Date.now()}`;
//       const style = document.createElement('style');
//       style.id = styleId;
      
//       const css = `
//         @supports (view-transition-name: root) {
//           ::view-transition-old(root) {
//             animation: none;
//           }
//           ::view-transition-new(root) {
//             animation: circle-blur-expand 0.5s ease-out;
//             transform-origin: top right;
//           }
//           @keyframes circle-blur-expand {
//             from {
//               clip-path: circle(0% at 100% 0%);
//               filter: blur(4px);
//             }
//             to {
//               clip-path: circle(150% at 100% 0%);
//               filter: blur(0);
//             }
//           }
//         }
//       `;
      
//       style.textContent = css;
//       document.head.appendChild(style);
      
//       setTimeout(() => {
//         const styleEl = document.getElementById(styleId);
//         if (styleEl) styleEl.remove();
//       }, 1000);
      
//       if ('startViewTransition' in document) {
//         (document as any).startViewTransition(onClick);
//       } else {
//         onClick();
//       }
//     } else {
//       onClick();
//     }
//   }, [onClick, deviceType]);

//   const buttonSize = deviceType === 'mobile' ? 'h-10 w-10' : deviceType === 'tablet' ? 'h-9 w-9' : 'h-9 w-9';
//   const iconSize = deviceType === 'mobile' ? 'h-5 w-5' : 'h-4 w-4';

//   return (
//     <Button
//       variant="ghost"
//       size="sm"
//       onClick={handleClick}
//       className={cn(
//         `${buttonSize} p-0 rounded-full bg-transparent hover:bg-accent/50 transition-all duration-200`,
//         deviceType === 'mobile' && 'active:scale-95',
//         className
//       )}
//       aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
//     >
//       <motion.div
//         key={theme}
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.2 }}
//       >
//         {theme === 'light' ? (
//           <Sun className={iconSize} />
//         ) : (
//           <Moon className={iconSize} />
//         )}
//       </motion.div>
//     </Button>
//   );
// };

// // Flexible Action Button Component
// const ActionButton = ({ 
//   onClick, 
//   deviceType, 
//   className,
//   children,
//   variant = "default",
//   isLoading = false,
//   disabled = false
// }: { 
//   onClick: () => void;
//   deviceType: 'mobile' | 'tablet' | 'desktop';
//   className?: string;
//   children: React.ReactNode;
//   variant?: "default" | "success" | "warning" | "destructive";
//   isLoading?: boolean;
//   disabled?: boolean;
// }) => {
//   const getVariantStyles = () => {
//     switch (variant) {
//       case "success":
//         return {
//           backgroundColor: 'rgb(34, 197, 94)',
//           borderColor: 'rgb(34, 197, 94)',
//           hoverBg: 'rgb(22, 163, 74)',
//           hoverBorder: 'rgb(22, 163, 74)'
//         };
//       case "warning":
//         return {
//           backgroundColor: 'rgb(249, 115, 22)',
//           borderColor: 'rgb(249, 115, 22)',
//           hoverBg: 'rgb(234, 88, 12)',
//           hoverBorder: 'rgb(234, 88, 12)'
//         };
//       case "destructive":
//         return {
//           backgroundColor: 'rgb(239, 68, 68)',
//           borderColor: 'rgb(239, 68, 68)',
//           hoverBg: 'rgb(220, 38, 38)',
//           hoverBorder: 'rgb(220, 38, 38)'
//         };
//       default:
//         return {
//           backgroundColor: 'rgb(41, 108, 255)',
//           borderColor: 'rgb(41, 108, 255)',
//           hoverBg: 'rgb(41, 121, 255)',
//           hoverBorder: 'rgb(41, 121, 255)'
//         };
//     }
//   };

//   const styles = getVariantStyles();

//   return (
//     <Button
//       onClick={onClick}
//       size="sm"
//       disabled={disabled || isLoading}
//       style={{
//         backgroundColor: styles.backgroundColor,
//         borderColor: styles.borderColor,
//         color: 'white',
//       }}
//       className={cn(
//         "font-medium shadow-md hover:shadow-lg transition-all duration-200 border",
//         "hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed",
//         deviceType === 'tablet' ? "h-10 px-4 text-sm" : "h-9 px-3 text-sm",
//         className
//       )}
//       onMouseEnter={(e) => {
//         if (!disabled && !isLoading) {
//           e.currentTarget.style.backgroundColor = styles.hoverBg;
//           e.currentTarget.style.borderColor = styles.hoverBorder;
//         }
//       }}
//       onMouseLeave={(e) => {
//         if (!disabled && !isLoading) {
//           e.currentTarget.style.backgroundColor = styles.backgroundColor;
//           e.currentTarget.style.borderColor = styles.borderColor;
//         }
//       }}
//     >
//       {isLoading && (
//         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//       )}
//       {children}
//     </Button>
//   );
// };

// const Navbar: React.FC<NavbarProps> = ({ className }) => {
//   // State
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [theme, setTheme] = useState<Theme>('dark');
//   const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
//   const [mounted, setMounted] = useState<boolean>(false);
  
//   // Hooks
//   const location = useLocation();
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
//   const { deviceType, isTouchDevice } = useDeviceType();

//   // Navigation items
//   const navigationItems: NavigationItem[] = [
//     { name: 'Home', shortName: 'Home', path: '/', icon: Home },
//     { name: 'Dashboard', shortName: 'Dash', path: '/dashboard', icon: BarChart3 },
//     { name: 'Upload', shortName: 'Upload', path: '/upload', icon: Upload },
//     { name: 'Verify', shortName: 'Verify', path: '/verify', icon: Shield },
//     { name: 'Issue', shortName: 'Issue', path: '/issue-document', icon: FilePlus },
//     { name: 'External', shortName: 'Ext', path: '/third-party-verify', icon: Building },
//     { name: 'Scanner', shortName: 'Scan', path: '/qr-scanner', icon: QrCode },
//   ];

//   // Theme management
//   useEffect(() => {
//     setMounted(true);
//     const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
//     setTheme(savedTheme);
//     updateResolvedTheme(savedTheme);
//   }, []);

//   const updateResolvedTheme = useCallback((currentTheme: Theme) => {
//     let resolved: 'light' | 'dark';
//     if (currentTheme === 'system') {
//       resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//     } else {
//       resolved = currentTheme;
//     }
//     setResolvedTheme(resolved);
//     applyTheme(resolved);
//   }, []);

//   const applyTheme = useCallback((resolvedTheme: 'light' | 'dark'): void => {
//     const root = document.documentElement;
//     if (resolvedTheme === 'dark') {
//       root.classList.add('dark');
//       root.setAttribute('data-theme', 'dark');
//     } else {
//       root.classList.remove('dark');
//       root.setAttribute('data-theme', 'light');
//     }
//   }, []);

//   const toggleTheme = useCallback((): void => {
//     const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//     updateResolvedTheme(newTheme);
//   }, [resolvedTheme, updateResolvedTheme]);

//   // Path checking
//   const isActivePath = useCallback((path: string): boolean => {
//     if (path === '/') return location.pathname === '/';
//     return location.pathname.startsWith(path);
//   }, [location.pathname]);

//   // Close mobile menu when route changes
//   useEffect(() => {
//     setIsOpen(false);
//   }, [location.pathname]);

//   // Address formatting
//   const formatAddress = useCallback((address: string | null): string => {
//     if (!address) return '';
//     const shortLength = deviceType === 'mobile' ? 4 : 6;
//     const endLength = deviceType === 'mobile' ? 4 : 4;
//     return `${address.substring(0, shortLength)}...${address.substring(address.length - endLength)}`;
//   }, [deviceType]);

//   // Individual action handlers - FLEXIBLE APPROACH
//   const handleConnectWallet = useCallback(async (): Promise<void> => {
//     try {
//       console.log('Connecting wallet...');
//       await connectWallet();
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Failed to connect wallet:', error);
//     }
//   }, [connectWallet]);

//   const handleDisconnectWallet = useCallback(async (): Promise<void> => {
//     try {
//       console.log('Disconnecting wallet...');
//       await disconnectWallet();
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Failed to disconnect wallet:', error);
//     }
//   }, [disconnectWallet]);

//   const handleSignIn = useCallback(async (): Promise<void> => {
//     try {
//       console.log('Signing in with Ethereum...');
//       await signInWithEthereum();
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Failed to sign in:', error);
//     }
//   }, [signInWithEthereum]);

//   const handleLogout = useCallback(async (): Promise<void> => {
//     try {
//       console.log('Logging out...');
//       await logout();
//       setIsOpen(false);
//     } catch (error) {
//       console.error('Failed to logout:', error);
//     }
//   }, [logout]);

//   // Navigation Link Component
//   const AdaptiveNavLink: React.FC<{
//     item: NavigationItem;
//     isMobile?: boolean;
//     onClick?: () => void;
//   }> = ({ item, isMobile = false, onClick }) => {
//     const Icon = item.icon;
//     const isActive = isActivePath(item.path);
//     const displayName = deviceType === 'desktop' ? item.name : (item.shortName || item.name);

//     if (isMobile) {
//       return (
//         <Link to={item.path} onClick={onClick}>
//           <div
//             className={cn(
//               "flex items-center space-x-3 px-4 py-4 rounded-lg text-base font-medium transition-all duration-200",
//               "active:scale-98 select-none",
//               isActive
//                 ? "text-white border"
//                 : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
//               isTouchDevice && "min-h-[48px]"
//             )}
//             style={isActive ? {
//               backgroundColor: 'rgba(41, 108, 255, 0.1)',
//               borderColor: 'rgba(41, 108, 255, 0.2)',
//               color: 'rgb(41, 108, 255)'
//             } : {}}
//           >
//             <Icon 
//               className="w-5 h-5 flex-shrink-0" 
//               style={isActive ? { color: 'rgb(41, 108, 255)' } : {}}
//             />
//             <span className="font-medium">{item.name}</span>
//           </div>
//         </Link>
//       );
//     }

//     return (
//       <Link to={item.path}>
//         <div
//           className={cn(
//             "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap",
//             isActive
//               ? ""
//               : "text-muted-foreground hover:text-foreground",
//             deviceType === 'tablet' && "px-2 py-2",
//             isTouchDevice && "min-h-[44px] flex items-center"
//           )}
//           style={isActive ? { color: 'rgb(41, 108, 255)' } : {}}
//         >
//           <Icon 
//             className={cn(
//               "w-4 h-4 flex-shrink-0", 
//               deviceType === 'tablet' && "w-5 h-5"
//             )}
//             style={isActive ? { color: 'rgb(41, 108, 255)' } : {}}
//           />
//           <span className={cn(
//             "transition-opacity",
//             deviceType === 'desktop' ? "hidden xl:block" : "hidden lg:block"
//           )}>
//             {displayName}
//           </span>
          
//           {isActive && (
//             <motion.div
//               className="absolute inset-0 rounded-lg border"
//               style={{
//                 backgroundColor: 'rgba(41, 108, 255, 0.08)',
//                 borderColor: 'rgba(41, 108, 255, 0.2)'
//               }}
//               layoutId="navbar-active"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
//             />
//           )}
//         </div>
//       </Link>
//     );
//   };

//   if (!mounted) {
//     return null;
//   }

//   // Adaptive dimensions
//   const navbarHeight = deviceType === 'mobile' ? 'h-16' : 'h-14';
//   const containerPadding = deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : 'px-4 lg:px-8';
//   const logoSize = deviceType === 'mobile' ? 'w-6 h-6' : 'w-5 h-5';

//   return (
//     <>
//       {/* Adaptive Navigation Bar */}
//       <nav className={cn(
//         `fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50`,
//         "supports-[backdrop-filter]:bg-background/80",
//         deviceType === 'mobile' && "bg-background/98",
//         className
//       )}>
//         <div className={cn("max-w-screen-2xl mx-auto", containerPadding)}>
//           <div className={cn("flex items-center justify-between", navbarHeight)}>
            
//             {/* Logo Section */}
//             <div className={cn(
//               "flex items-center flex-shrink-0",
//               deviceType === 'desktop' ? "w-48" : "w-auto"
//             )}>
//               <Link to="/" className="flex items-center space-x-3 group">
//                 <div 
//                   className="p-2 rounded-lg shadow-md"
//                   style={{
//                     background: 'linear-gradient(135deg, rgb(41, 108, 255), rgb(41, 121, 255))'
//                   }}
//                 >
//                   <Box className={cn(logoSize, "text-white")} />
//                 </div>
//                 <div className={cn(
//                   deviceType === 'mobile' ? "block" : "hidden sm:block"
//                 )}>
//                   <h2 
//                     className={cn(
//                       "font-bold bg-clip-text text-transparent",
//                       deviceType === 'mobile' ? "text-xl" : "text-lg"
//                     )}
//                     style={{
//                       backgroundImage: 'linear-gradient(to right, rgb(41, 108, 255), rgb(41, 121, 255))'
//                     }}
//                   >
//                     DocVerify
//                   </h2>
//                   <h3 className={cn(
//                     "text-muted-foreground/70 -mt-0.5 leading-tight",
//                     deviceType === 'mobile' ? "text-sm" : "text-xs"
//                   )}>
//                     Secure Documents
//                   </h3>
//                 </div>
//               </Link>
//             </div>

//             {/* Desktop Navigation */}
//             {deviceType !== 'mobile' && (
//               <div className="hidden lg:flex flex-1 justify-center max-w-4xl mx-8">
//                 <div className={cn(
//                   "flex items-center bg-accent/20 rounded-full backdrop-blur-sm",
//                   deviceType === 'tablet' ? "space-x-0.5 p-1" : "space-x-1 p-1"
//                 )}>
//                   {navigationItems.map((item) => (
//                     <AdaptiveNavLink key={item.name} item={item} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Right Controls - FLEXIBLE LAYOUT */}
//             <div className={cn(
//               "flex items-center justify-end min-w-0",
//               deviceType === 'mobile' ? "space-x-2" : "space-x-3"
//             )}>
//               {/* Theme Toggle */}
//               <AdaptiveThemeToggle 
//                 theme={resolvedTheme} 
//                 onClick={toggleTheme}
//                 deviceType={deviceType}
//               />

//               {/* Flexible Wallet & Auth Controls */}
//               <div className={cn(
//                 "items-center space-x-2",
//                 deviceType === 'mobile' ? "hidden" : "hidden md:flex"
//               )}>
//                 {/* Wallet Status */}
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <div>
//                         <Status 
//                           status={isConnected ? "online" : "offline"}
//                           className={cn(
//                             "rounded-full border-0 cursor-pointer",
//                             deviceType === 'tablet' ? "gap-1 px-2 py-1 text-xs" : "gap-1.5 px-2.5 py-1.5 text-xs"
//                           )}
//                           style={{
//                             backgroundColor: isConnected 
//                               ? 'rgba(34, 197, 94, 0.1)' 
//                               : 'rgba(239, 68, 68, 0.1)',
//                             color: isConnected 
//                               ? 'rgb(34, 197, 94)' 
//                               : 'rgb(239, 68, 68)'
//                           }}
//                         >
//                           <StatusIndicator />
//                           <StatusLabel className="font-medium">
//                             {isConnected ? 'Wallet' : 'No Wallet'}
//                           </StatusLabel>
//                         </Status>
//                       </div>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       Wallet {isConnected ? 'Connected' : 'Disconnected'}
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>

//                 {/* Auth Status */}
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger asChild>
//                       <div>
//                         <Status 
//                           status={isAuthenticated ? "online" : "offline"}
//                           className={cn(
//                             "rounded-full border-0 cursor-pointer",
//                             deviceType === 'tablet' ? "gap-1 px-2 py-1 text-xs" : "gap-1.5 px-2.5 py-1.5 text-xs"
//                           )}
//                           style={{
//                             backgroundColor: isAuthenticated 
//                               ? 'rgba(59, 130, 246, 0.1)' 
//                               : 'rgba(156, 163, 175, 0.1)',
//                             color: isAuthenticated 
//                               ? 'rgb(59, 130, 246)' 
//                               : 'rgb(156, 163, 175)'
//                           }}
//                         >
//                           <StatusIndicator />
//                           <StatusLabel className="font-medium">
//                             {isAuthenticated ? 'Auth' : 'No Auth'}
//                           </StatusLabel>
//                         </Status>
//                       </div>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       {isAuthenticated ? 'Authenticated with SIWE' : 'Not Authenticated'}
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>

//                 {/* Action Buttons */}
//                 {!isConnected && (
//                   <ActionButton
//                     onClick={handleConnectWallet}
//                     deviceType={deviceType}
//                     isLoading={isConnecting}
//                   >
//                     <Wallet className="w-4 h-4 mr-1.5" />
//                     Connect
//                   </ActionButton>
//                 )}

//                 {isConnected && !isAuthenticated && (
//                   <ActionButton
//                     onClick={handleSignIn}
//                     deviceType={deviceType}
//                     variant="warning"
//                     isLoading={isAuthenticating}
//                   >
//                     <UserCheck className="w-4 h-4 mr-1.5" />
//                     Sign In
//                   </ActionButton>
//                 )}

//                 {isAuthenticated && (
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button 
//                         variant="ghost" 
//                         size="sm" 
//                         className={cn(
//                           "p-0 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 hover:from-blue-500/30 hover:to-green-500/30 border border-blue-500/30",
//                           deviceType === 'tablet' ? "h-10 w-10" : "h-9 w-9",
//                           isTouchDevice && "min-h-[44px] min-w-[44px]"
//                         )}
//                       >
//                         <UserCheck className={cn(
//                           "text-blue-600",
//                           deviceType === 'tablet' ? "h-5 w-5" : "h-4 w-4"
//                         )} />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end" className="w-64">
//                       <DropdownMenuLabel>
//                         <div className="space-y-1">
//                           <p className="text-sm font-medium text-blue-600">✓ Authenticated User</p>
//                           <p className="text-xs text-muted-foreground font-mono break-all">
//                             {user ? user.address : (account || '')}
//                           </p>
//                           {user?.ensName && (
//                             <p className="text-xs text-blue-600 font-medium">{user.ensName}</p>
//                           )}
//                         </div>
//                       </DropdownMenuLabel>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem 
//                         onClick={() => navigator.clipboard.writeText(user?.address || account || '')}
//                         className="cursor-pointer"
//                       >
//                         <WalletCards className="mr-2 h-4 w-4" />
//                         Copy Address
//                       </DropdownMenuItem>
//                       <DropdownMenuSeparator />
//                       <DropdownMenuItem 
//                         onClick={handleLogout} 
//                         className="cursor-pointer text-orange-600 focus:text-orange-600"
//                       >
//                         <LogOut className="mr-2 h-4 w-4" />
//                         Sign Out
//                       </DropdownMenuItem>
//                       <DropdownMenuItem 
//                         onClick={handleDisconnectWallet} 
//                         className="cursor-pointer text-red-600 focus:text-red-600"
//                       >
//                         <Wallet className="mr-2 h-4 w-4" />
//                         Disconnect Wallet
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 )}
//               </div>

//               {/* Mobile Status Indicators */}
//               <div className="md:hidden flex items-center space-x-1">
//                 <Status 
//                   status={isConnected ? "online" : "offline"} 
//                   className="gap-1 px-2 py-1 text-xs rounded-full border-0"
//                 >
//                   <StatusIndicator />
//                 </Status>
//                 <Status 
//                   status={isAuthenticated ? "online" : "offline"} 
//                   className="gap-1 px-2 py-1 text-xs rounded-full border-0"
//                 >
//                   <StatusIndicator />
//                 </Status>
//               </div>

//               {/* Mobile Menu Button */}
//               <Sheet open={isOpen} onOpenChange={setIsOpen}>
//                 <SheetTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className={cn(
//                       "p-0 rounded-full bg-accent/30 hover:bg-accent/50",
//                       deviceType === 'mobile' ? "lg:hidden h-10 w-10" : "lg:hidden h-9 w-9",
//                       isTouchDevice && "min-h-[44px] min-w-[44px] active:scale-95"
//                     )}
//                   >
//                     {isOpen ? (
//                       <X className={deviceType === 'mobile' ? "h-5 w-5" : "h-4 w-4"} />
//                     ) : (
//                       <Menu className={deviceType === 'mobile' ? "h-5 w-5" : "h-4 w-4"} />
//                     )}
//                   </Button>
//                 </SheetTrigger>
                
//                 {/* Mobile Menu - FLEXIBLE CONTROLS */}
//                 <SheetContent 
//                   side="right" 
//                   className={cn(
//                     deviceType === 'mobile' ? "w-full sm:w-96" : "w-80 sm:w-96"
//                   )}
//                 >
//                   <SheetHeader className="space-y-0">
//                     <SheetTitle className="flex items-center space-x-3">
//                       <div 
//                         className="p-2 rounded-lg"
//                         style={{
//                           background: 'linear-gradient(135deg, rgb(41, 108, 255), rgb(41, 121, 255))'
//                         }}
//                       >
//                         <Box className="w-5 h-5 text-white" />
//                       </div>
//                       <div>
//                         <div className="text-lg font-bold" style={{ color: 'rgb(41, 108, 255)' }}>
//                           DocVerify
//                         </div>
//                         <div className="text-xs text-muted-foreground">Secure Documents</div>
//                       </div>
//                     </SheetTitle>
//                   </SheetHeader>
                  
//                   <div className="mt-8 space-y-6">
//                     {/* Navigation */}
//                     <div className="space-y-3">
//                       <h3 className="text-sm font-medium text-muted-foreground px-2">Navigation</h3>
//                       <div className="space-y-1">
//                         {navigationItems.map((item) => (
//                           <AdaptiveNavLink
//                             key={item.name}
//                             item={item}
//                             isMobile
//                             onClick={() => setIsOpen(false)}
//                           />
//                         ))}
//                       </div>
//                     </div>

//                     <Separator />

//                     {/* Settings */}
//                     <div className="space-y-4">
//                       <h3 className="text-sm font-medium text-muted-foreground px-2">Settings</h3>
//                       <div className="flex items-center justify-between px-2">
//                         <span className="text-sm">Theme</span>
//                         <AdaptiveThemeToggle 
//                           theme={resolvedTheme} 
//                           onClick={toggleTheme}
//                           deviceType={deviceType}
//                         />
//                       </div>
//                     </div>

//                     <Separator />

//                     {/* Flexible Wallet & Auth Controls */}
//                     <div className="space-y-4">
//                       <h3 className="text-sm font-medium text-muted-foreground px-2">Wallet & Authentication</h3>
                      
//                       {/* Wallet Status */}
//                       <div className="px-2 space-y-3">
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm">Wallet</span>
//                           <Status 
//                             status={isConnected ? "online" : "offline"}
//                             className="text-xs"
//                           >
//                             <StatusIndicator />
//                             <StatusLabel>{isConnected ? 'Connected' : 'Disconnected'}</StatusLabel>
//                           </Status>
//                         </div>

//                         {isConnected && account && (
//                           <div className="text-xs font-mono text-muted-foreground bg-muted/30 p-2 rounded break-all">
//                             {account}
//                           </div>
//                         )}

//                         <div className="flex gap-2">
//                           {!isConnected ? (
//                             <ActionButton
//                               onClick={handleConnectWallet}
//                               deviceType={deviceType}
//                               className="flex-1"
//                               isLoading={isConnecting}
//                             >
//                               <Wallet className="w-4 h-4 mr-2" />
//                               Connect Wallet
//                             </ActionButton>
//                           ) : (
//                             <ActionButton
//                               onClick={handleDisconnectWallet}
//                               deviceType={deviceType}
//                               className="flex-1"
//                               variant="destructive"
//                             >
//                               <Wallet className="w-4 h-4 mr-2" />
//                               Disconnect
//                             </ActionButton>
//                           )}
//                         </div>
//                       </div>

//                       <Separator className="my-3" />

//                       {/* Authentication Status */}
//                       <div className="px-2 space-y-3">
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm">Authentication</span>
//                           <Status 
//                             status={isAuthenticated ? "online" : "offline"}
//                             className="text-xs"
//                           >
//                             <StatusIndicator />
//                             <StatusLabel>{isAuthenticated ? 'Signed In' : 'Not Signed In'}</StatusLabel>
//                           </Status>
//                         </div>

//                         {isAuthenticated && user && (
//                           <div className="space-y-2">
//                             <div className="text-xs font-mono text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-2 rounded break-all">
//                               ✓ {user.address}
//                             </div>
//                             {user.ensName && (
//                               <div className="text-xs text-blue-600 font-medium">
//                                 {user.ensName}
//                               </div>
//                             )}
//                           </div>
//                         )}

//                         <div className="flex gap-2">
//                           {isConnected && !isAuthenticated && (
//                             <ActionButton
//                               onClick={handleSignIn}
//                               deviceType={deviceType}
//                               className="flex-1"
//                               variant="warning"
//                               isLoading={isAuthenticating}
//                             >
//                               <UserCheck className="w-4 h-4 mr-2" />
//                               Sign In
//                             </ActionButton>
//                           )}

//                           {isAuthenticated && (
//                             <>
//                               <ActionButton
//                                 onClick={() => {
//                                   navigator.clipboard.writeText(user?.address || account || '');
//                                   setIsOpen(false);
//                                 }}
//                                 deviceType={deviceType}
//                                 className="flex-1"
//                                 variant="success"
//                               >
//                                 <WalletCards className="w-4 h-4 mr-2" />
//                                 Copy
//                               </ActionButton>
//                               <ActionButton
//                                 onClick={handleLogout}
//                                 deviceType={deviceType}
//                                 className="flex-1"
//                                 variant="warning"
//                               >
//                                 <LogOut className="w-4 h-4 mr-2" />
//                                 Sign Out
//                               </ActionButton>
//                             </>
//                           )}
//                         </div>

//                         {!isConnected && (
//                           <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-lg">
//                             Connect your wallet first to sign in with Ethereum
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Content Spacer */}
//       <div className={navbarHeight} />
//     </>
//   );
// };

// export default Navbar;


import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  X,
  Upload,
  Shield,
  BarChart3,
  Box,
  Wallet,
  Building,
  FilePlus,
  QrCode,
  Home,
  Sun,
  Moon,
  LogOut,
  WalletCards,
  UserCheck,
  Scan,
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
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWeb3 } from '../../context/Web3Context';

// Types
type Theme = 'light' | 'dark' | 'system';

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shortName?: string;
}

interface NavbarProps {
  className?: string;
}

// Device Detection Hook
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const isTouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsTouchDevice(isTouchSupported);
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { deviceType, isTouchDevice };
};

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState<boolean>(false);
  
  const location = useLocation();
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
  const { deviceType, isTouchDevice } = useDeviceType();

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { name: 'Home', shortName: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', shortName: 'Dash', path: '/dashboard', icon: BarChart3 },
    { name: 'Upload', shortName: 'Upload', path: '/upload', icon: Upload },
    { name: 'Verify', shortName: 'Verify', path: '/verify', icon: Shield },
    { name: 'Issue', shortName: 'Issue', path: '/issue-document', icon: FilePlus },
    { name: 'External', shortName: 'Ext', path: '/third-party-verify', icon: Building },
    { name: 'Scanner', shortName: 'Scan', path: '/qr-scanner', icon: Scan },
  ];

  // Theme management
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'dark';
    setTheme(savedTheme);
    updateResolvedTheme(savedTheme);
  }, []);

  const updateResolvedTheme = useCallback((currentTheme: Theme) => {
    let resolved: 'light' | 'dark';
    if (currentTheme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = currentTheme;
    }
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const applyTheme = useCallback((resolvedTheme: 'light' | 'dark'): void => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = useCallback((): void => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateResolvedTheme(newTheme);
  }, [resolvedTheme, updateResolvedTheme]);

  const isActivePath = useCallback((path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const formatAddress = useCallback((address: string | null): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }, []);

  // Navigation Link Component
  const NavLink: React.FC<{ item: NavigationItem; isMobile?: boolean }> = ({ item, isMobile = false }) => {
    const Icon = item.icon;
    const isActive = isActivePath(item.path);

    if (isMobile) {
      return (
        <Link to={item.path} onClick={() => setIsOpen(false)}>
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </motion.div>
        </Link>
      );
    }

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={item.path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative px-3 py-2 rounded-lg transition-all flex items-center gap-2",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden xl:block">
                  {deviceType === 'desktop' ? item.name : item.shortName}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="xl:hidden">
            {item.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (!mounted) return null;

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/80 backdrop-blur-xl border-b border-border/50",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
                <div className="relative p-2 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg">
                  <Box className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div className="hidden sm:block">
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DocVerify
                </h2>
                <p className="text-xs text-muted-foreground -mt-0.5">Secure Documents</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex flex-1 justify-center max-w-3xl mx-8">
              <div className="flex items-center gap-1 bg-accent/30 rounded-full p-1.5 backdrop-blur-sm border border-border/50">
                {navigationItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              
              {/* Theme Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      className="rounded-full w-9 h-9 hover:bg-accent"
                    >
                      <motion.div
                        key={resolvedTheme}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {resolvedTheme === 'dark' ? (
                          <Moon className="w-4 h-4" />
                        ) : (
                          <Sun className="w-4 h-4" />
                        )}
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle theme</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Desktop Status & Actions */}
              <div className="hidden md:flex items-center gap-2">
                
                {/* Wallet Status Badge */}
                <Badge 
                  variant="outline"
                  className={cn(
                    "gap-1.5 px-3 py-1.5 transition-all",
                    isConnected 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                      : "bg-muted border-border"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  )} />
                  <span className="text-xs font-medium">
                    {isConnected ? 'Wallet' : 'No Wallet'}
                  </span>
                </Badge>

                {/* Auth Status Badge */}
                <Badge 
                  variant="outline"
                  className={cn(
                    "gap-1.5 px-3 py-1.5 transition-all",
                    isAuthenticated 
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-600"
                      : "bg-muted border-border"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isAuthenticated ? "bg-blue-500" : "bg-muted-foreground"
                  )} />
                  <span className="text-xs font-medium">
                    {isAuthenticated ? 'Auth' : 'No Auth'}
                  </span>
                </Badge>

                {/* Action Buttons */}
                {!isConnected ? (
                  <Button
                    onClick={connectWallet}
                    size="sm"
                    disabled={isConnecting}
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Wallet'}
                  </Button>
                ) : !isAuthenticated ? (
                  <Button
                    onClick={signInWithEthereum}
                    size="sm"
                    disabled={isAuthenticating}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    {isAuthenticating ? 'Signing...' : 'Auth'}
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="font-mono text-xs">{formatAddress(account)}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>
                        <div className="space-y-1">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                            Connected Account
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{account}</p>
                          {user?.role && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {user.role}
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigator.clipboard.writeText(account || '')}
                        className="cursor-pointer"
                      >
                        <WalletCards className="mr-2 h-4 w-4" />
                        Copy Address
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={logout} 
                        className="cursor-pointer text-orange-600 focus:text-orange-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={disconnectWallet} 
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Mobile Status Dots */}
              <div className="md:hidden flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isAuthenticated ? "bg-blue-500" : "bg-muted-foreground"
                )} />
              </div>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden rounded-full w-9 h-9 hover:bg-accent"
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </motion.div>
                  </Button>
                </SheetTrigger>
                
                <SheetContent side="right" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary to-blue-600 rounded-xl">
                        <Box className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-primary">DocVerify</h2>
                        <p className="text-xs text-muted-foreground">Secure Documents</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-6">
                    {/* Navigation */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                        Navigation
                      </h3>
                      {navigationItems.map((item) => (
                        <NavLink key={item.path} item={item} isMobile />
                      ))}
                    </div>

                    <Separator />

                    {/* Theme */}
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium">Theme</span>
                      <Button
                        onClick={toggleTheme}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {resolvedTheme === 'dark' ? (
                          <><Moon className="w-4 h-4" />Dark</>
                        ) : (
                          <><Sun className="w-4 h-4" />Light</>
                        )}
                      </Button>
                    </div>

                    <Separator />

                    {/* Wallet & Auth */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                        Wallet & Authentication
                      </h3>
                      
                      <div className="space-y-3">
                        {/* Status */}
                        <div className="flex gap-2 px-2">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "flex-1 justify-center gap-1.5 py-2",
                              isConnected && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              isConnected ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                            )} />
                            <span className="text-xs font-medium">
                              {isConnected ? 'Wallet' : 'No Wallet'}
                            </span>
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "flex-1 justify-center gap-1.5 py-2",
                              isAuthenticated && "bg-blue-500/10 border-blue-500/30 text-blue-600"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              isAuthenticated ? "bg-blue-500" : "bg-muted-foreground"
                            )} />
                            <span className="text-xs font-medium">
                              {isAuthenticated ? 'Auth' : 'No Auth'}
                            </span>
                          </Badge>
                        </div>

                        {/* Account Info */}
                        {isConnected && account && (
                          <div className="px-2">
                            <div className="p-3 bg-accent/50 rounded-lg border border-border">
                              <p className="text-xs font-mono text-muted-foreground break-all">
                                {account}
                              </p>
                              {user?.role && (
                                <Badge variant="secondary" className="text-xs mt-2">
                                  {user.role}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="px-2 space-y-2">
                          {!isConnected ? (
                            <Button
                              onClick={connectWallet}
                              className="w-full"
                              disabled={isConnecting}
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </Button>
                          ) : !isAuthenticated ? (
                            <>
                              <Button
                                onClick={signInWithEthereum}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                disabled={isAuthenticating}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                {isAuthenticating ? 'Signing In...' : 'Sign In'}
                              </Button>
                              <Button
                                onClick={disconnectWallet}
                                variant="outline"
                                className="w-full"
                              >
                                <Wallet className="w-4 h-4 mr-2" />
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => navigator.clipboard.writeText(account || '')}
                                variant="outline"
                                className="w-full"
                              >
                                <WalletCards className="w-4 h-4 mr-2" />
                                Copy Address
                              </Button>
                              <Button
                                onClick={logout}
                                variant="outline"
                                className="w-full text-orange-600 hover:text-orange-700"
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
                                Disconnect
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16" />
    </>
  );
};

export default Navbar;
