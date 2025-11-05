import { useEffect, useState } from 'react';
import { adminService, Institution } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import HashDisplay from '../common/HashDisplay';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

export const AdminPage = () => {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingAddress, setVerifyingAddress] = useState<string | null>(null);

  // Function to fetch institutions
  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getInstitutions();
      setInstitutions(data);
    } catch (error) {
      toast.error('Failed to fetch institutions', {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchInstitutions();
  }, []);

  // Handler for the "Verify" button
  const handleVerify = async (address: string) => {
    setVerifyingAddress(address); // Set loading state for this specific button
    toast.info(`Sending verification for ${address}...`, {
      description: 'Please wait for the transaction to confirm.',
    });

    try {
      const result = await adminService.verifyInstitution(address);
      toast.success('Institution Verified!', {
        description: `Tx: ${result.transactionHash}`,
      });
      // Refresh the list to show the new "Verified" status
      fetchInstitutions();
    } catch (error) {
      toast.error('Verification Failed', {
        description: (error as Error).message,
      });
    } finally {
      setVerifyingAddress(null); // Clear loading state
    }
  };

  if (isLoading && institutions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-6 text-muted-foreground">Welcome, Admin</p>

      <Card>
        <CardHeader>
          <CardTitle>On-Chain Institution Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Institution Name</TableHead>
                <TableHead>Address</TableHead>
                {/* 1. ADDED NEW COLUMNS */}
                <TableHead>Registration #</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>On-Chain Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((inst) => (
                <TableRow key={inst.address}>
                  <TableCell>
                    {/* 2. FIXED: Use inst.name */}
                    {inst.name}
                  </TableCell>
                  <TableCell>
                    {/* 3. FIXED: Use inst.address */}
                    <HashDisplay hash={inst.address} />
                  </TableCell>
                  
                  {/* 4. ADDED NEW DATA CELLS */}
                  <TableCell>{inst.registrationNumber}</TableCell>
                  <TableCell>{inst.contactInfo}</TableCell>

                  <TableCell>
                    {/* 5. FIXED: This logic is correct */}
                    {inst.isVerified ? (
                      <Badge variant="default" className="flex items-center w-fit">
                        <ShieldCheck className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center w-fit">
                        <ShieldAlert className="h-4 w-4 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!inst.isVerified && (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(inst.address)}
                        disabled={verifyingAddress === inst.address}
                        className='text-accent-foreground'
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
        </CardContent>
      </Card>
    </div>
  );
};