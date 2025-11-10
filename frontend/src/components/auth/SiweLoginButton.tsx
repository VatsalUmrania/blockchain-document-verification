// import React from "react";
// import { useWeb3 } from "../../context/Web3Context";

// const SiweLoginButton: React.FC = () => {
//   const {
//     account,
//     isConnected,
//     isConnecting,
//     isAuthenticated,
//     isAuthenticating,
//     user,
//     connectWallet,
//     signInWithEthereum,
//     logout,
//   } = useWeb3();

//   if (isAuthenticated && user) {
//     return (
//       <div className="flex flex-col gap-4 p-6 border-2 border-green-200 rounded-xl bg-green-50">
//         <div className="flex items-center gap-3">
//           <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
//           <span className="text-sm font-medium text-green-700">Authenticated</span>
//         </div>

//         <div className="space-y-2">
//           <h3 className="font-semibold text-green-800">Welcome Back!</h3>
//           <div className="text-sm text-green-600 space-y-1">
//             <p>
//               <span className="font-medium">Address:</span>{" "}
//               {user.address.substring(0, 6)}...{user.address.substring(38)}
//             </p>

//             {user.name && (
//               <p>
//                 <span className="font-medium">Name:</span> {user.name}
//               </p>
//             )}

//             {user.updatedAt && (
//               <p>
//                 <span className="font-medium">Last Updated:</span>{" "}
//                 {new Date(user.updatedAt).toLocaleString()}
//               </p>
//             )}
//           </div>
//         </div>

//         <button
//           onClick={logout}
//           className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
//         >
//           Logout
//         </button>
//       </div>
//     );
//   }

//   if (isConnected && account) {
//     return (
//       <div className="flex flex-col gap-4 p-6 border-2 border-blue-200 rounded-xl bg-blue-50">
//         <div className="flex items-center gap-3">
//           <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
//           <span className="text-sm font-medium text-blue-700">Wallet Connected</span>
//         </div>

//         <div className="space-y-2">
//           <p className="text-sm text-blue-600">
//             <span className="font-medium">Connected:</span>{" "}
//             {account.substring(0, 6)}...{account.substring(38)}
//           </p>
//           <p className="text-xs text-blue-500">Click below to sign in with your Ethereum account</p>
//         </div>

//         <button
//           onClick={signInWithEthereum}
//           disabled={isAuthenticating}
//           className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none font-medium"
//         >
//           {isAuthenticating ? (
//             <div className="flex items-center justify-center gap-2">
//               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//               Signing Message...
//             </div>
//           ) : (
//             "Sign-In with Ethereum"
//           )}
//         </button>
//       </div>
//     );
//   }

//   if (typeof window.ethereum === "undefined") {
//     return (
//       <div className="text-center p-6 border-2 border-orange-200 rounded-xl bg-orange-50">
//         <div className="mb-4">
//           <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
//             <span className="text-2xl">🦊</span>
//           </div>
//           <h3 className="font-semibold mb-2 text-orange-800">MetaMask Required</h3>
//           <p className="text-sm text-orange-600 mb-4">
//             Please install MetaMask to continue with Web3 authentication
//           </p>
//         </div>
//         <a
//           href="https://metamask.io/download/"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
//         >
//           Install MetaMask
//         </a>
//       </div>
//     );
//   }

//   return (
//     <div className="text-center p-6 border-2 border-gray-200 rounded-xl bg-gray-50">
//       <div className="mb-4 ">
//         <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
//           <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
//           </svg>
//         </div>
//         <h3 className="font-semibold mb-2 ">Connect Your Wallet</h3>
//         <p className="text-sm text-gray-600 mb-4">
//           Connect your Ethereum wallet to access the document verification system
//         </p>
//       </div>
//       <button
//         onClick={connectWallet}
//         disabled={isConnecting}
//         className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
//       >
//         {isConnecting ? (
//           <div className="flex items-center justify-center gap-2">
//             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             Connecting...
//           </div>
//         ) : (
//           "Connect Wallet"
//         )}
//       </button>
//     </div>
//   );
// };

// export default SiweLoginButton;


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