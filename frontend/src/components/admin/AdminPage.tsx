// import { useEffect, useState, useCallback } from 'react';
// import { ethers } from 'ethers'; // <-- Added ethers
// import { adminService, Institution } from '../../services/adminService';
// import { useAuth } from '../../context/AuthContext';
// import { useWeb3 } from '../../context/Web3Context'; 
// import { Button } from '../ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
// import { Badge } from '../ui/badge';
// import { toast } from 'sonner';
// import HashDisplay from '../common/HashDisplay';
// import { ShieldCheck, ShieldAlert, Loader2, Shield, Users, Inbox } from 'lucide-react';

// // Minimal ABI for the event we want to listen to
// const contractABI = [
//   "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)"
// ];

// // Get contract address from environment variables
// const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// export const AdminPage = () => {
//   const { user } = useAuth();
//   const { provider, isConnected } = useWeb3(); // <-- Get provider from Web3Context
//   const [institutions, setInstitutions] = useState<Institution[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [verifyingAddress, setVerifyingAddress] = useState<string | null>(null);

//   // Function to fetch institutions
//   // --- Wrapped in useCallback to prevent re-renders ---
//   const fetchInstitutions = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const data = await adminService.getInstitutions();
//       setInstitutions(data);
//     } catch (error) {
//       toast.error('Failed to fetch institutions', {
//         description: (error as Error).message,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, []); // Empty dependency array means this function is created once

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchInstitutions();
//   }, [fetchInstitutions]); // <-- Use the stable callback

//   // --- ADDED: useEffect to listen for blockchain events ---
//   useEffect(() => {
//     if (isConnected && provider && contractAddress) {
//       const contract = new ethers.Contract(contractAddress, contractABI, provider);

//       console.log('🎧 AdminPage: Listening for InstitutionRegistered events...');

//       const handleNewRegistration = (address: string, name: string) => {
//         console.log(`🔔 New Institution Registered: ${name} (${address})`);
        
//         toast.info('New Institution Registered', {
//           description: `${name} has registered. Refreshing list...`,
//         });
        
//         // Auto-refresh the list
//         fetchInstitutions();
//       };

//       // Set up the listener
//       contract.on('InstitutionRegistered', handleNewRegistration);

//       // Clean up the listener when the component unmounts
//       return () => {
//         console.log('🔇 AdminPage: Removing event listener.');
//         contract.off('InstitutionRegistered', handleNewRegistration);
//       };
//     }
//   }, [isConnected, provider, fetchInstitutions]); // Dependencies

//   // Handler for the "Verify" button
//   const handleVerify = async (address: string) => {
//     setVerifyingAddress(address); 
//     toast.info(`Sending verification for ${address}...`, {
//       description: 'Please wait for the transaction to confirm.',
//     });

//     try {
//       const result = await adminService.verifyInstitution(address);
//       toast.success('Institution Verified!', {
//         description: `Tx: ${result.transactionHash}`,
//       });
//       // Refresh the list to show the new "Verified" status
//       fetchInstitutions();
//     } catch (error) {
//       toast.error('Verification Failed', {
//         description: (error as Error).message,
//       });
//     } finally {
//       setVerifyingAddress(null); 
//     }
//   };

//   // Main loading state (initial load)
//   if (isLoading && institutions.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <div className="flex items-center gap-3">
//         <Shield className="h-8 w-8 text-primary" />
//         <div>
//           <h1 className="text-3xl font-bold">Admin Panel</h1>
//           <p className="text-lg text-muted-foreground">Welcome, Admin</p>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Users className="h-5 w-5" />
//             On-Chain Institution Management
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {!isLoading && institutions.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
//               <Inbox className="h-12 w-12 text-muted-foreground" />
//               <h3 className="mt-4 text-lg font-semibold">No Institutions Found</h3>
//               <p className="mt-1 text-sm text-muted-foreground">
//                 No institutions have registered on-chain yet.
//               </p>
//             </div>
//           ) : (
//             <div>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Institution Name</TableHead>
//                     <TableHead>Address</TableHead>
//                     <TableHead>Registration #</TableHead>
//                     <TableHead>Contact Info</TableHead>
//                     <TableHead>On-Chain Status</TableHead>
//                     <TableHead>Action</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoading && institutions.length > 0 && ( // Show inline loader on refresh
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center h-24">
//                         <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
//                       </TableCell>
//                     </TableRow>
//                   )}
//                   {!isLoading && institutions.map((inst) => ( // Only map when not loading
//                     <TableRow key={inst.address}>
//                       <TableCell className="font-medium">{inst.name}</TableCell>
//                       <TableCell>
//                         <HashDisplay hash={inst.address} size="sm" variant="compact" />
//                       </TableCell>
//                       <TableCell>{inst.registrationNumber}</TableCell>
//                       <TableCell>{inst.contactInfo}</TableCell>
//                       <TableCell>
//                         {inst.isVerified ? (
//                           <Badge variant="default" className='bg-green-500'>
//                             <ShieldCheck className="h-4 w-4 mr-1" />
//                             Verified
//                           </Badge>
//                         ) : (
//                           <Badge variant="destructive" className='bg-red-400'>
//                             <ShieldAlert className="h-4 w-4 mr-1" />
//                             Not Verified
//                           </Badge>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {!inst.isVerified && (
//                           <Button
//                             size="sm"
//                             onClick={() => handleVerify(inst.address)}
//                             disabled={verifyingAddress === inst.address}
//                             className=''
//                           >
//                             {verifyingAddress === inst.address ? (
//                               <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                             ) : (
//                               <ShieldCheck className="h-4 w-4 mr-2" />
//                             )}
//                             Verify
//                           </Button>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// import { useEffect, useState, useCallback } from 'react';
// import { ethers } from 'ethers';
// import { adminService, Institution } from '../../services/adminService';
// import { useAuth } from '../../context/AuthContext';
// import { useWeb3 } from '../../context/Web3Context'; 
// import { Button } from '../ui/button';
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle, 
//   CardDescription, // <-- Import CardDescription
//   CardFooter      // <-- Import CardFooter
// } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { toast } from 'sonner';
// import HashDisplay from '../common/HashDisplay';
// import { 
//   ShieldCheck, 
//   ShieldAlert, 
//   Loader2, 
//   Shield, 
//   Users, 
//   Inbox,
//   Building // <-- Import Building icon
// } from 'lucide-react';
// import { cn } from '@/lib/utils'; // <-- Make sure this path is correct

// // Minimal ABI for the event we want to listen to
// const contractABI = [
//   "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)"
// ];

// // Get contract address from environment variables
// const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// export const AdminPage = () => {
//   const { user } = useAuth();
//   const { provider, isConnected } = useWeb3();
//   const [institutions, setInstitutions] = useState<Institution[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [verifyingAddress, setVerifyingAddress] = useState<string | null>(null);

//   // Function to fetch institutions
//   const fetchInstitutions = useCallback(async () => {
//     // Keep setIsLoading(true) only if it's the initial load
//     if (institutions.length === 0) {
//       setIsLoading(true);
//     }
//     try {
//       const data = await adminService.getInstitutions();
//       setInstitutions(data);
//     } catch (error) {
//       toast.error('Failed to fetch institutions', {
//         description: (error as Error).message,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [institutions.length]); // Re-run if length is 0

//   // Fetch data on component mount
//   useEffect(() => {
//     fetchInstitutions();
//   }, [fetchInstitutions]);

//   // useEffect to listen for blockchain events
//   useEffect(() => {
//     if (isConnected && provider && contractAddress) {
//       const contract = new ethers.Contract(contractAddress, contractABI, provider);

//       console.log('🎧 AdminPage: Listening for InstitutionRegistered events...');

//       const handleNewRegistration = (address: string, name: string) => {
//         console.log(`🔔 New Institution Registered: ${name} (${address})`);
        
//         toast.info('New Institution Registered', {
//           description: `${name} has registered. Refreshing list...`,
//         });
        
//         // Auto-refresh the list
//         fetchInstitutions();
//       };

//       contract.on('InstitutionRegistered', handleNewRegistration);

//       return () => {
//         console.log('🔇 AdminPage: Removing event listener.');
//         contract.off('InstitutionRegistered', handleNewRegistration);
//       };
//     }
//   }, [isConnected, provider, fetchInstitutions]); 

//   // Handler for the "Verify" button
//   const handleVerify = async (address: string) => {
//     setVerifyingAddress(address); 
//     toast.info(`Sending verification for ${address}...`, {
//       description: 'Please wait for the transaction to confirm.',
//     });

//     try {
//       const result = await adminService.verifyInstitution(address);
//       toast.success('Institution Verified!', {
//         description: `Tx: ${result.transactionHash}`,
//       });
//       fetchInstitutions();
//     } catch (error) {
//       toast.error('Verification Failed', {
//         description: (error as Error).message,
//       });
//     } finally {
//       setVerifyingAddress(null); 
//     }
//   };

//   // Main loading state (initial load)
//   if (isLoading && institutions.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 space-y-6">
//       <div className="flex items-center gap-3">
//         <Shield className="h-8 w-8 text-primary" />
//         <div>
//           <h1 className="text-3xl font-bold">Admin Panel</h1>
//           <p className="text-lg text-muted-foreground">Welcome, Admin</p>
//         </div>
//       </div>

//       {/* --- THIS IS THE REDESIGNED SECTION --- */}
//       <div>
//         <div className="flex items-center gap-2 mb-4">
//           <Users className="h-5 w-5 text-primary" />
//           <h2 className="text-xl font-semibold">On-Chain Institution Management</h2>
//         </div>

//         {isLoading && institutions.length === 0 ? (
//           // Initial Load Skeleton
//           <div className="flex justify-center items-center h-64">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         ) : !isLoading && institutions.length === 0 ? (
//           // Empty State
//           <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
//             <Inbox className="h-12 w-12 text-muted-foreground" />
//             <h3 className="mt-4 text-lg font-semibold">No Institutions Found</h3>
//             <p className="mt-1 text-sm text-muted-foreground">
//               No institutions have registered on-chain yet.
//             </p>
//           </div>
//         ) : (
//           // List of Institution Cards
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {institutions.map((inst) => (
//               <Card key={inst.address} className="flex flex-col justify-between shadow-sm">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Building className="h-5 w-5 text-primary" />
//                     {inst.name}
//                   </CardTitle>
//                   <CardDescription>
//                     <HashDisplay hash={inst.address} size="sm" variant="compact" />
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <dl className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <dt className="font-medium text-muted-foreground">Registration #</dt>
//                       <dd>{inst.registrationNumber}</dd>
//                     </div>
//                     <div className="flex justify-between">
//                       <dt className="font-medium text-muted-foreground">Contact Info</dt>
//                       <dd>{inst.contactInfo}</dd>
//                     </div>
//                   </dl>
//                 </CardContent>
//                 <CardFooter className="border-t flex justify-between items-center">
//                   {inst.isVerified ? (
//                     <Badge variant="default">
//                       <ShieldCheck className="h-4 w-4 mr-1" />
//                       Verified
//                     </Badge>
//                   ) : (
//                     <Badge variant="destructive">
//                       <ShieldAlert className="h-4 w-4 mr-1" />
//                       Not Verified
//                     </Badge>
//                   )}
                  
//                   {!inst.isVerified && (
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleVerify(inst.address)}
//                       disabled={verifyingAddress === inst.address}
//                       className="text-primary"
//                     >
//                       {verifyingAddress === inst.address ? (
//                         <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                       ) : (
//                         <ShieldCheck className="h-4 w-4 mr-2" />
//                       )}
//                       Verify
//                     </Button>
//                   )}
//                 </CardFooter>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//       {/* --- END OF REDESIGNED SECTION --- */}
//     </div>
//   );
// };


import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers'; 
import { adminService, Institution, DocumentDetails } from '../../services/adminService'; // <-- Import DocumentDetails
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context'; 
import { Button } from '../ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'; // <-- Import Table components
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import HashDisplay from '../common/HashDisplay';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Shield, 
  Users, 
  Inbox,
  Building,
  FileText, // <-- Added
  Clock,    // <-- Added
  AlertTriangle, // <-- Added
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils'; // <-- Corrected path for components

// Minimal ABI for the events we want to listen to
const contractABI = [
  "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)",
  "event DocumentIssued(bytes32 indexed documentHash, address indexed issuer, string recipientName, string documentType, string title, uint256 issuanceDate)"
];

// Get contract address from environment variables
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// --- New Sub-Component for Document Status ---
const DocumentStatusBadge: React.FC<{ status: DocumentDetails['status'] }> = ({ status }) => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="default">
          <ShieldCheck className="h-4 w-4 mr-1" />
          Verified
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary">
          <Clock className="h-4 w-4 mr-1" />
          Pending
        </Badge>
      );
    case 'revoked':
      return (
        <Badge variant="destructive">
          <XCircle className="h-4 w-4 mr-1" />
          Revoked
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="outline">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Expired
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};


export const AdminPage = () => {
  const { user } = useAuth();
  const { provider, isConnected } = useWeb3();
  
  // Institution State
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isInstLoading, setIsInstLoading] = useState(true);
  const [verifyingAddress, setVerifyingAddress] = useState<string | null>(null);
  
  // Document State
  const [allDocuments, setAllDocuments] = useState<DocumentDetails[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(true);

  // --- Institution Functions ---
  const fetchInstitutions = useCallback(async (showLoading = true) => {
    if (showLoading) setIsInstLoading(true);
    try {
      const data = await adminService.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      toast.error('Failed to fetch institutions', {
        description: (error as Error).message,
      });
    } finally {
      if (showLoading) setIsInstLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchInstitutions(true); // Initial load with spinner
  }, [fetchInstitutions]);

  // --- Document Functions ---
  const fetchAllDocuments = useCallback(async (showLoading = true) => {
    if (showLoading) setIsDocsLoading(true);
    try {
      const data = await adminService.getAllDocuments();
      setAllDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents', {
        description: (error as Error).message,
      });
    } finally {
      if (showLoading) setIsDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDocuments(true); // Initial load with spinner
  }, [fetchAllDocuments]);


  // --- Event Listeners ---
  useEffect(() => {
    if (isConnected && provider && contractAddress) {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      console.log('🎧 AdminPage: Listening for events...');

      // Listener 1: New Institutions
      const handleNewRegistration = (address: string, name: string) => {
        console.log(`🔔 New Institution Registered: ${name} (${address})`);
        toast.info('New Institution Registered', {
          description: `${name} has registered. Refreshing list...`,
        });
        fetchInstitutions(false); // Refresh without full page loader
      };
      
      // Listener 2: New Documents
      const handleNewDocument = (hash: string, issuer: string, recipient: string) => {
         console.log(`🔔 New Document Issued by ${issuer}`);
         toast.info('New Document Issued', {
          description: `A new document was issued by ${issuer.substring(0, 6)}... Refreshing list.`,
        });
        fetchAllDocuments(false); // Refresh without full page loader
      };

      // Set up the listeners
      contract.on('InstitutionRegistered', handleNewRegistration);
      contract.on('DocumentIssued', handleNewDocument);

      // Clean up the listeners
      return () => {
        console.log('🔇 AdminPage: Removing event listeners.');
        contract.off('InstitutionRegistered', handleNewRegistration);
        contract.off('DocumentIssued', handleNewDocument);
      };
    }
  }, [isConnected, provider, fetchInstitutions, fetchAllDocuments]); // Added fetchAllDocuments

  // Handler for the "Verify" button
  const handleVerify = async (address: string) => {
    setVerifyingAddress(address); 
    toast.info(`Sending verification for ${address}...`, {
      description: 'Please wait for the transaction to confirm.',
    });

    try {
      const result = await adminService.verifyInstitution(address);
      toast.success('Institution Verified!', {
        description: `Tx: ${result.transactionHash}`,
      });
      fetchInstitutions(false); // Refresh list without full loader
    } catch (error) {
      toast.error('Verification Failed', {
        description: (error as Error).message,
      });
    } finally {
      setVerifyingAddress(null); 
    }
  };

  // Main loading state (for initial page load)
  if (isInstLoading && institutions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-lg text-muted-foreground">Welcome, Admin</p>
        </div>
      </div>

      {/* --- Institution Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            On-Chain Institution Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isInstLoading && institutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <Inbox className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Institutions Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No institutions have registered on-chain yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isInstLoading && institutions.length === 0 && (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}
              {institutions.map((inst) => (
                <Card key={inst.address} className="flex flex-col justify-between shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {inst.name}
                    </CardTitle>
                    <CardDescription>
                      <HashDisplay hash={inst.address} size="sm" variant="compact" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="font-medium text-muted-foreground">Registration #</dt>
                        <dd>{inst.registrationNumber}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium text-muted-foreground">Contact Info</dt>
                        <dd>{inst.contactInfo}</dd>
                      </div>
                    </dl>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between items-center">
                    {inst.isVerified ? (
                      <Badge variant="default">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <ShieldAlert className="h-4 w-4 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                    
                    {!inst.isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(inst.address)}
                        disabled={verifyingAddress === inst.address}
                        className="text-primary"
                      >
                        {verifyingAddress === inst.address ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 mr-2" />
                        )}
                        Verify
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* --- NEW: All Documents Card --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Issued Documents
          </CardTitle>
          <CardDescription>
            A real-time list of all documents issued on the blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isDocsLoading && allDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <Inbox className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Documents Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No documents have been issued by any institution yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Title</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isDocsLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                )}
                {!isDocsLoading && allDocuments.map((doc) => (
                  <TableRow key={doc.documentHash}>
                    <TableCell className="font-medium">{doc.title || 'N/A'}</TableCell>
                    <TableCell>{doc.recipientName}</TableCell>
                    <TableCell>{doc.issuerName}</TableCell>
                    <TableCell>
                      <DocumentStatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell>
                      <HashDisplay hash={doc.documentHash} size="sm" variant="compact" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
};