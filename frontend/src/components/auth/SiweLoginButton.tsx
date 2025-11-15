import React from "react";
import { useWeb3 } from "../../context/Web3Context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  UserCheck,
  LogOut,
} from "lucide-react";
import HashDisplay from "../common/HashDisplay";
import { cn } from "@/lib/utils";

const SiweLoginButton: React.FC = () => {
  const {
    account,
    isConnected,
    isConnecting,
    isAuthenticated,
    isAuthenticating,
    user,
    connectWallet,
    signInWithEthereum,
    logout,
  } = useWeb3();

  // 1. Authenticated State
  if (isAuthenticated && user) {
    return (
      <Card className="bg-background border-primary/30 shadow-lg shadow-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-primary">Authenticated</CardTitle>
              <p className="text-sm text-muted-foreground">Welcome back!</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">Address:</span>
              <HashDisplay hash={user.address} variant="compact" size="sm" />
            </div>
            {user.name && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{user.name}</span>
              </div>
            )}
            {user.updatedAt && (
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Last Login:</span>
                <span className="text-foreground">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={logout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 2. Wallet Connected, Awaiting Sign-in
  if (isConnected && account) {
    return (
      <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
  <CardHeader>
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-sm">
        <Wallet className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <CardTitle className="text-xl font-semibold text-primary">Wallet Connected</CardTitle>
        <p className="text-muted-foreground text-xs tracking-wide">Ready to authenticate</p>
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-5 pt-2">
    <div className="space-y-2 text-sm">
      <div className="flex justify-between items-center">
        <span className="font-medium text-muted-foreground">Address:</span>
        <HashDisplay hash={account} variant="compact" size="sm" />
      </div>
    </div>

    <Button
      onClick={signInWithEthereum}
      disabled={isAuthenticating}
      className="w-full h-11 rounded-xl font-semibold tracking-wide hover:scale-[1.015] active:scale-[0.99] transition-all"
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Signing Message...
        </>
      ) : (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Sign-In with Ethereum
        </>
      )}
    </Button>
  </CardContent>
</Card>

    );
  }

  // 3. MetaMask Not Installed
  if (typeof window.ethereum === "undefined") {
    return (
      <Card className="bg-background border-destructive/30 text-center">
        <CardHeader>
          <div className="w-16 h-16 mx-auto mb-3 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive">MetaMask Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Please install MetaMask to continue with Web3 authentication.
          </p>
          <Button asChild variant="destructive" className="w-full">
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Install MetaMask
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 4. Default: Connect Wallet
  return (
    <Card className="bg-background border-border text-center">
      <CardHeader>
        <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Connect Your Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Ethereum wallet to access the document verification system.
        </p>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SiweLoginButton;