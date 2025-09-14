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
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/status';
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

// Adaptive Theme Toggle
const AdaptiveThemeToggle = ({ 
  theme, 
  onClick, 
  deviceType,
  className 
}: { 
  theme: 'light' | 'dark';
  onClick: () => void;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  className?: string;
}) => {
  const handleClick = useCallback(() => {
    if (deviceType === 'desktop') {
      const styleId = `theme-transition-${Date.now()}`;
      const style = document.createElement('style');
      style.id = styleId;
      
      const css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: top right;
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at 100% 0%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at 100% 0%);
              filter: blur(0);
            }
          }
        }
      `;
      
      style.textContent = css;
      document.head.appendChild(style);
      
      setTimeout(() => {
        const styleEl = document.getElementById(styleId);
        if (styleEl) styleEl.remove();
      }, 1000);
      
      if ('startViewTransition' in document) {
        (document as any).startViewTransition(onClick);
      } else {
        onClick();
      }
    } else {
      onClick();
    }
  }, [onClick, deviceType]);

  const buttonSize = deviceType === 'mobile' ? 'h-10 w-10' : deviceType === 'tablet' ? 'h-9 w-9' : 'h-9 w-9';
  const iconSize = deviceType === 'mobile' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        `${buttonSize} p-0 rounded-full bg-transparent hover:bg-accent/50 transition-all duration-200`,
        deviceType === 'mobile' && 'active:scale-95',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'light' ? (
          <Sun className={iconSize} />
        ) : (
          <Moon className={iconSize} />
        )}
      </motion.div>
    </Button>
  );
};

// Fixed Connect Button Component with inline styles
const ConnectButton = ({ 
  onClick, 
  deviceType, 
  className 
}: { 
  onClick: () => void;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  className?: string;
}) => {
  return (
    <Button
      onClick={onClick}
      size="sm"
      style={{
        backgroundColor: 'rgb(41, 108, 255)',
        borderColor: 'rgb(41, 108, 255)',
        color: 'white',
      }}
      className={cn(
        "font-medium shadow-md hover:shadow-lg transition-all duration-200 border",
        // Use hover: prefix for hover states
        "hover:brightness-110",
        // Adaptive sizing
        deviceType === 'tablet' ? "h-10 px-4 text-sm" : "h-9 px-3 text-sm",
        className
      )}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgb(41, 121, 255)';
        e.currentTarget.style.borderColor = 'rgb(41, 121, 255)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgb(41, 108, 255)';
        e.currentTarget.style.borderColor = 'rgb(41, 108, 255)';
      }}
    >
      <Wallet className={cn(
        "mr-1.5",
        deviceType === 'tablet' ? "w-5 h-5" : "w-4 h-4"
      )} />
      Connect
    </Button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState<boolean>(false);
  
  // Hooks
  const location = useLocation();
  const { isConnected, account, connectWallet, disconnectWallet } = useWeb3();
  const { deviceType, isTouchDevice } = useDeviceType();

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { name: 'Home', shortName: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', shortName: 'Dash', path: '/dashboard', icon: BarChart3 },
    { name: 'Upload', shortName: 'Upload', path: '/upload', icon: Upload },
    { name: 'Verify', shortName: 'Verify', path: '/verify', icon: Shield },
    { name: 'Issue', shortName: 'Issue', path: '/issue-document', icon: FilePlus },
    { name: 'External', shortName: 'Ext', path: '/third-party-verify', icon: Building },
    { name: 'Scanner', shortName: 'Scan', path: '/qr-scanner', icon: QrCode },
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

  // Path checking
  const isActivePath = useCallback((path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Address formatting
  const formatAddress = useCallback((address: string | null): string => {
    if (!address) return '';
    const shortLength = deviceType === 'mobile' ? 4 : 6;
    const endLength = deviceType === 'mobile' ? 4 : 4;
    return `${address.substring(0, shortLength)}...${address.substring(address.length - endLength)}`;
  }, [deviceType]);

  // Wallet handlers
  const handleConnectWallet = useCallback(async (): Promise<void> => {
    try {
      await connectWallet();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connectWallet]);

  const handleDisconnectWallet = useCallback(async (): Promise<void> => {
    try {
      await disconnectWallet();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnectWallet]);

  // Navigation Link Component
  const AdaptiveNavLink: React.FC<{
    item: NavigationItem;
    isMobile?: boolean;
    onClick?: () => void;
  }> = ({ item, isMobile = false, onClick }) => {
    const Icon = item.icon;
    const isActive = isActivePath(item.path);
    const displayName = deviceType === 'desktop' ? item.name : (item.shortName || item.name);

    if (isMobile) {
      return (
        <Link to={item.path} onClick={onClick}>
          <div
            className={cn(
              "flex items-center space-x-3 px-4 py-4 rounded-lg text-base font-medium transition-all duration-200",
              "active:scale-98 select-none",
              isActive
                ? "text-white border"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
              isTouchDevice && "min-h-[48px]"
            )}
            style={isActive ? {
              backgroundColor: 'rgba(41, 108, 255, 0.1)',
              borderColor: 'rgba(41, 108, 255, 0.2)',
              color: 'rgb(41, 108, 255)'
            } : {}}
          >
            <Icon 
              className="w-5 h-5 flex-shrink-0" 
              style={isActive ? { color: 'rgb(41, 108, 255)' } : {}}
            />
            <span className="font-medium">{item.name}</span>
          </div>
        </Link>
      );
    }

    return (
      <Link to={item.path}>
        <div
          className={cn(
            "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap",
            isActive
              ? ""
              : "text-muted-foreground hover:text-foreground",
            deviceType === 'tablet' && "px-2 py-2",
            isTouchDevice && "min-h-[44px] flex items-center"
          )}
          style={isActive ? { color: 'rgb(41, 108, 255)' } : {}}
        >
          <Icon 
            className={cn(
              "w-4 h-4 flex-shrink-0", 
              deviceType === 'tablet' && "w-5 h-5"
            )}
            style={isActive ? { color: 'rgb(41, 108, 255)' } : {}}
          />
          <span className={cn(
            "transition-opacity",
            deviceType === 'desktop' ? "hidden xl:block" : "hidden lg:block"
          )}>
            {displayName}
          </span>
          
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-lg border"
              style={{
                backgroundColor: 'rgba(41, 108, 255, 0.08)',
                borderColor: 'rgba(41, 108, 255, 0.2)'
              }}
              layoutId="navbar-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
        </div>
      </Link>
    );
  };

  if (!mounted) {
    return null;
  }

  // Adaptive dimensions
  const navbarHeight = deviceType === 'mobile' ? 'h-16' : 'h-14';
  const containerPadding = deviceType === 'mobile' ? 'px-4' : deviceType === 'tablet' ? 'px-6' : 'px-4 lg:px-8';
  const logoSize = deviceType === 'mobile' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <>
      {/* Adaptive Navigation Bar */}
      <nav className={cn(
        `fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50`,
        "supports-[backdrop-filter]:bg-background/80",
        deviceType === 'mobile' && "bg-background/98",
        className
      )}>
        <div className={cn("max-w-screen-2xl mx-auto", containerPadding)}>
          <div className={cn("flex items-center justify-between", navbarHeight)}>
            
            {/* Logo Section */}
            <div className={cn(
              "flex items-center flex-shrink-0",
              deviceType === 'desktop' ? "w-48" : "w-auto"
            )}>
              <Link to="/" className="flex items-center space-x-3 group">
                <div 
                  className="p-2 rounded-lg shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, rgb(41, 108, 255), rgb(41, 121, 255))'
                  }}
                >
                  <Box className={cn(logoSize, "text-white")} />
                </div>
                <div className={cn(
                  deviceType === 'mobile' ? "block" : "hidden sm:block"
                )}>
                  <h2 
                    className={cn(
                      "font-bold bg-clip-text text-transparent",
                      deviceType === 'mobile' ? "text-xl" : "text-lg"
                    )}
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgb(41, 108, 255), rgb(41, 121, 255))'
                    }}
                  >
                    DocVerify
                  </h2>
                  <h3 className={cn(
                    "text-muted-foreground/70 -mt-0.5 leading-tight",
                    deviceType === 'mobile' ? "text-sm" : "text-xs"
                  )}>
                    Secure Documents
                  </h3>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {deviceType !== 'mobile' && (
              <div className="hidden lg:flex flex-1 justify-center max-w-4xl mx-8">
                <div className={cn(
                  "flex items-center bg-accent/20 rounded-full backdrop-blur-sm",
                  deviceType === 'tablet' ? "space-x-0.5 p-1" : "space-x-1 p-1"
                )}>
                  {navigationItems.map((item) => (
                    <AdaptiveNavLink key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Right Controls */}
            <div className={cn(
              "flex items-center justify-end min-w-0",
              deviceType === 'mobile' ? "space-x-2" : "space-x-3"
            )}>
              {/* Theme Toggle */}
              <AdaptiveThemeToggle 
                theme={resolvedTheme} 
                onClick={toggleTheme}
                deviceType={deviceType}
              />

              {/* Connection Status */}
              {isConnected ? (
                <div className={cn(
                  "items-center space-x-2",
                  deviceType === 'mobile' ? "hidden" : "hidden md:flex"
                )}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Status 
                            status="online" 
                            className={cn(
                              "rounded-full border-0",
                              deviceType === 'tablet' ? "gap-1 px-2 py-1 text-xs" : "gap-1.5 px-2.5 py-1.5 text-xs"
                            )}
                            style={{
                              backgroundColor: resolvedTheme === 'dark' 
                                ? 'rgba(16, 185, 129, 0.1)' 
                                : 'rgba(16, 185, 129, 0.1)',
                              color: resolvedTheme === 'dark' 
                                ? 'rgb(52, 211, 153)' 
                                : 'rgb(5, 150, 105)'
                            }}
                          >
                            <StatusIndicator />
                            <StatusLabel className="font-medium">Connected</StatusLabel>
                            {deviceType === 'desktop' && (
                              <span className="font-mono text-[10px] ml-1 opacity-75">
                                {formatAddress(account)}
                              </span>
                            )}
                          </Status>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Wallet connected</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "p-0 rounded-full bg-accent/30 hover:bg-accent/50",
                          deviceType === 'tablet' ? "h-10 w-10" : "h-9 w-9",
                          isTouchDevice && "min-h-[44px] min-w-[44px]"
                        )}
                      >
                        <Wallet className={deviceType === 'tablet' ? "h-5 w-5" : "h-4 w-4"} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Wallet</p>
                          <p className="text-xs text-muted-foreground font-mono break-all">
                            {formatAddress(account)}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => navigator.clipboard.writeText(account || '')}
                        className="cursor-pointer"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Copy Address
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDisconnectWallet} 
                        className="cursor-pointer"
                        style={{ color: 'rgb(239, 68, 68)' }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className={cn(
                  "items-center space-x-2",
                  deviceType === 'mobile' ? "hidden" : "hidden md:flex"
                )}>
                  <Status 
                    status="offline" 
                    className={cn(
                      "rounded-full border-0",
                      deviceType === 'tablet' ? "gap-1 px-2 py-1 text-xs" : "gap-1.5 px-2.5 py-1.5 text-xs"
                    )}
                    style={{
                      backgroundColor: resolvedTheme === 'dark' 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : 'rgba(239, 68, 68, 0.1)',
                      color: resolvedTheme === 'dark' 
                        ? 'rgb(248, 113, 113)' 
                        : 'rgb(185, 28, 28)'
                    }}
                  >
                    <StatusIndicator />
                    <StatusLabel className="font-medium">Disconnected</StatusLabel>
                  </Status>
                  
                  <ConnectButton 
                    onClick={handleConnectWallet}
                    deviceType={deviceType}
                  />
                </div>
              )}

              {/* Mobile Status Indicator */}
              <div className="md:hidden">
                <Status 
                  status={isConnected ? "online" : "offline"} 
                  className="gap-1 px-2 py-1 text-xs rounded-full border-0"
                >
                  <StatusIndicator />
                </Status>
              </div>

              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-0 rounded-full bg-accent/30 hover:bg-accent/50",
                      deviceType === 'mobile' ? "lg:hidden h-10 w-10" : "lg:hidden h-9 w-9",
                      isTouchDevice && "min-h-[44px] min-w-[44px] active:scale-95"
                    )}
                  >
                    {isOpen ? (
                      <X className={deviceType === 'mobile' ? "h-5 w-5" : "h-4 w-4"} />
                    ) : (
                      <Menu className={deviceType === 'mobile' ? "h-5 w-5" : "h-4 w-4"} />
                    )}
                  </Button>
                </SheetTrigger>
                
                {/* Mobile Menu */}
                <SheetContent 
                  side="right" 
                  className={cn(
                    deviceType === 'mobile' ? "w-full sm:w-96" : "w-80 sm:w-96"
                  )}
                >
                  <SheetHeader className="space-y-0">
                    <SheetTitle className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, rgb(41, 108, 255), rgb(41, 121, 255))'
                        }}
                      >
                        <Box className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold" style={{ color: 'rgb(41, 108, 255)' }}>
                          DocVerify
                        </div>
                        <div className="text-xs text-muted-foreground">Secure Documents</div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-6">
                    {/* Navigation */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">Navigation</h3>
                      <div className="space-y-1">
                        {navigationItems.map((item) => (
                          <AdaptiveNavLink
                            key={item.name}
                            item={item}
                            isMobile
                            onClick={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Settings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">Settings</h3>
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm">Theme</span>
                        <AdaptiveThemeToggle 
                          theme={resolvedTheme} 
                          onClick={toggleTheme}
                          deviceType={deviceType}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Wallet Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">Wallet</h3>
                      
                      <Status 
                        status={isConnected ? "online" : "offline"} 
                        className="gap-3 px-4 py-4 text-base rounded-lg w-full justify-start bg-muted/30"
                      >
                        <StatusIndicator />
                        <div className="flex-1 min-w-0">
                          <StatusLabel className="font-medium block text-base">
                            {isConnected ? 'Connected' : 'Not Connected'}
                          </StatusLabel>
                          {isConnected && (
                            <div className="font-mono text-sm text-muted-foreground mt-1 break-all">
                              {account}
                            </div>
                          )}
                        </div>
                      </Status>

                      {isConnected ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(account || '');
                              setIsOpen(false);
                            }}
                            variant="outline"
                            className={cn(
                              "flex-1 text-sm",
                              isTouchDevice && "h-12"
                            )}
                          >
                            <Wallet className="w-4 h-4 mr-2" />
                            Copy Address
                          </Button>
                          <Button
                            onClick={handleDisconnectWallet}
                            variant="outline"
                            className={cn(
                              "flex-1 text-sm border-red-200",
                              isTouchDevice && "h-12"
                            )}
                            style={{ color: 'rgb(239, 68, 68)' }}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <ConnectButton 
                          onClick={handleConnectWallet}
                          deviceType={deviceType}
                          className={cn(
                            "w-full text-sm font-medium",
                            isTouchDevice ? "h-12" : "h-11"
                          )}
                        />
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Spacer */}
      <div className={navbarHeight} />
    </>
  );
};

export default Navbar;
