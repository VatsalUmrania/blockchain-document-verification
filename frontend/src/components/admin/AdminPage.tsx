import { useEffect, useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers'; 
import { adminService, Institution, DocumentDetails } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context'; 
import { Button } from '../ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'; // <-- IMPORTED TABS
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
  FileText, 
  Clock,    
  AlertTriangle,
  XCircle,
  User,
  UserCheck,
  Hash,      
  Contact,
  MousePointerClick 
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'; 
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip'; 

// Minimal ABI for the events
const contractABI = [
  "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)",
  "event DocumentIssued(bytes32 indexed documentHash, address indexed issuer, string recipientName, string documentType, string title, uint256 issuanceDate)"
];

// Get contract address from environment variables
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// --- Sub-Component for Document Status ---
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

  // Filter State
  const [institutionFilter, setInstitutionFilter] = useState<string>('all'); 

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
    fetchInstitutions(true); 
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
    fetchAllDocuments(true);
  }, [fetchAllDocuments]);


  // --- Event Listeners ---
  useEffect(() => {
    if (isConnected && provider && contractAddress) {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const handleNewRegistration = (address: string, name: string) => {
        toast.info('New Institution Registered', {
          description: `${name} has registered. Refreshing list...`,
        });
        fetchInstitutions(false); 
      };
      
      const handleNewDocument = (hash: string, issuer: string, recipient: string) => {
         toast.info('New Document Issued', {
          description: `A new document was issued. Refreshing list.`,
        });
        fetchAllDocuments(false); 
      };

      contract.on('InstitutionRegistered', handleNewRegistration);
      contract.on('DocumentIssued', handleNewDocument);

      return () => {
        contract.off('InstitutionRegistered', handleNewRegistration);
        contract.off('DocumentIssued', handleNewDocument);
      };
    }
  }, [isConnected, provider, fetchInstitutions, fetchAllDocuments]); 

  // --- Memoized Filtered List ---
  const filteredDocuments = useMemo(() => {
    if (institutionFilter === 'all') {
      return allDocuments;
    }
    return allDocuments.filter(doc => doc.issuer.toLowerCase() === institutionFilter.toLowerCase());
  }, [allDocuments, institutionFilter]);

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
      fetchInstitutions(false); 
    } catch (error) {
      toast.error('Verification Failed', {
        description: (error as Error).message,
      });
    } finally {
      setVerifyingAddress(null); 
    }
  };

  // Main loading state (for initial page load)
  if (isInstLoading && institutions.length === 0 && isDocsLoading && allDocuments.length === 0) {
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

      {/* --- NEW TABS LAYOUT --- */}
      <Tabs defaultValue="institutions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="institutions" className="text-base gap-2">
            <Users className="h-5 w-5" />
            Institution Management
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-base gap-2">
            <FileText className="h-5 w-5" />
            All Issued Documents
          </TabsTrigger>
        </TabsList>
        
        {/* --- Institutions Tab --- */}
        <TabsContent value="institutions">
          <Card>
            <CardHeader>
              <CardTitle>Institution Registry</CardTitle>
              <CardDescription>
                View and verify all institutions that have registered on-chain.
              </CardDescription>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Building className="h-4 w-4" />Institution Name
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />Address
                        </span>  
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />Registration
                        </span>  
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Contact className="h-4 w-4" />Contact Info
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />On-Chain Status
                        </span>    
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <MousePointerClick className="h-4 w-4" />Action
                        </span>    
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isInstLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    )}
                    {!isInstLoading && institutions.map((inst) => ( 
                      <TableRow key={inst.address}>
                        <TableCell className="font-medium">{inst.name}</TableCell>
                        <TableCell>
                          <HashDisplay hash={inst.address} size="sm" variant="compact" />
                        </TableCell>
                        <TableCell>{inst.registrationNumber}</TableCell>
                        <TableCell>{inst.contactInfo}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {!inst.isVerified && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerify(inst.address)}
                              disabled={verifyingAddress === inst.address}
                              className="text-primary hover:bg-primary/10"
                            >
                              {verifyingAddress === inst.address ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <ShieldCheck className="h-4 w-4 mr-2" />
                              )}
                              Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* --- Documents Tab --- */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className='space-y-1'>
                  <CardTitle>All Issued Documents</CardTitle>
                  <CardDescription>
                    A real-time list of all documents issued on the blockchain.
                  </CardDescription>
                </div>
                
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Filter by institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map(inst => (
                      <SelectItem key={inst.address} value={inst.address.toLowerCase()}>
                        {inst.name} ({inst.address.substring(0, 6)}...)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!isDocsLoading && filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
                  <Inbox className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    {institutionFilter === 'all' ? 'No Documents Found' : 'No Documents Found for this Institution'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {institutionFilter === 'all' ? 'No documents have been issued by any institution yet.' : 'This institution has not issued any documents.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />Document Title
                        </span>    
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />Recipient
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Building className="h-4 w-4" />Issuer
                        </span>    
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />Status
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />Hash
                        </span>
                      </TableHead>
                      <TableHead>
                        <span className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />Verified By
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isDocsLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    )}
                    {!isDocsLoading && filteredDocuments.map((doc) => (
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
                        <TableCell>
                          {doc.verifiedBy ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="cursor-default">
                                    <HashDisplay 
                                        hash={doc.verifiedBy} 
                                        size="sm" 
                                        variant="compact" 
                                    /> 
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Verified by: {doc.verifiedBy}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
