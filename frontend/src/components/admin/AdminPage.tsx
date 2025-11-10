import { useEffect, useState } from 'react';
import { adminService, Institution } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import HashDisplay from '../common/HashDisplay';
import { ShieldCheck, ShieldAlert, Loader2, Shield, Users, Inbox } from 'lucide-react';

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

  // Main loading state (initial load)
  if (isLoading && institutions.length === 0) {
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            On-Chain Institution Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && institutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
              <Inbox className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Institutions Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No institutions have registered on-chain yet.
              </p>
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>On-Chain Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  )}
                  {institutions.map((inst) => (
                    <TableRow key={inst.address}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell>
                        <HashDisplay hash={inst.address} size="sm" variant="compact" />
                      </TableCell>
                      <TableCell>{inst.registrationNumber}</TableCell>
                      <TableCell>{inst.contactInfo}</TableCell>
                      <TableCell>
                        {inst.isVerified ? (
                          <Badge variant="default" className='bg-green-500'>
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className='bg-red-400'>
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
                            className=''
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};