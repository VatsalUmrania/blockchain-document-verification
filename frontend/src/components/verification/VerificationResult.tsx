import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Copy,
  Shield,
  Calendar,
  User,
  Info,
  Link,
  Download,
  Share,
  Hash,
  FileText,
  Sparkles,
  Building,
  Box
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay';

// --- Types and Interfaces ---

interface VerificationMetadata {
  name?: string;
  size?: number;
  type?: string;
  timestamp?: number | string;
  uploader?: string;
  description?: string;
  documentType?: string;
  issuerName?: string;
  recipientName?: string;
  issuanceDate?: number | string | Date;
  [key: string]: any;
}

interface BlockchainVerification {
  isValid?: boolean;
  status?: string;
  transactionHash?: string;
  [key: string]: any;
}

interface VerificationResultData {
  isValid: boolean;
  generatedHash: string;
  expectedHash: string;
  matchingStrategy?: string;
  blockchainVerification?: BlockchainVerification;
  hasBlockchainRecord?: boolean;
  blockchainStatus?: string;
  transactionHash?: string | null;
  statusUpdated?: boolean;
  foundInStorage?: boolean;
  currentStatus?: string;
  metadata?: VerificationMetadata;
  debugInfo?: any;
}

interface VerificationResultProps {
  result: VerificationResultData;
  className?: string;
}

interface CertificateData {
  verificationResult: boolean;
  timestamp: string;
  generatedHash: string;
  expectedHash: string;
  metadata?: VerificationMetadata;
  blockchainVerification?: BlockchainVerification | null;
  blockchainStatus?: string;
  transactionHash?: string | null;
  statusUpdated?: boolean;
  foundInStorage?: boolean;
  currentStatus?: string;
  certificateId: string;
  verificationDetails: {
    algorithm: string;
    blockchainNetwork: string;
    verifiedBy: string;
    hasBlockchainRecord?: boolean;
    verificationMethod?: string;
  };
}

interface ShareData {
  title: string;
  text: string;
  url: string;
}

// --- Helper Sub-Component ---

const InfoItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <Icon className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div className="min-w-0">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-foreground font-semibold break-words">{value || 'N/A'}</div>
    </div>
  </div>
);

// --- Main Component ---

const VerificationResult: React.FC<VerificationResultProps> = ({ result, className }) => {
  
  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to Clipboard');
    } catch (error) {
      toast.error('Copy Failed');
    }
  }, []);

  // Download certificate
  const downloadCertificate = useCallback((): void => {
    const certificateData: CertificateData = {
      verificationResult: result.isValid,
      timestamp: new Date().toISOString(),
      generatedHash: result.generatedHash,
      expectedHash: result.expectedHash,
      metadata: result.metadata,
      blockchainVerification: result.blockchainVerification || null,
      blockchainStatus: result.blockchainStatus || 'not_found',
      transactionHash: result.transactionHash || null,
      statusUpdated: result.statusUpdated || false,
      foundInStorage: result.foundInStorage || false,
      currentStatus: result.currentStatus || 'not_found',
      certificateId: `CERT-${Date.now()}`,
      verificationDetails: {
        algorithm: 'SHA-256',
        blockchainNetwork: 'Ethereum',
        verifiedBy: 'DocVerify System',
        hasBlockchainRecord: result.hasBlockchainRecord || false,
        verificationMethod: result.matchingStrategy || 'hash_comparison'
      }
    };

    const dataStr = JSON.stringify(certificateData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-certificate-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Certificate Downloaded');
  }, [result]);

  // Share verification result
  const shareVerificationResult = useCallback(async (): Promise<void> => {
    const shareData: ShareData = {
      title: 'Document Verification Result - DocVerify',
      text: `Document verification ${result.isValid ? 'successful' : 'failed'} - DocVerify System`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Result Shared');
      } catch (error) {
        copyToClipboard(window.location.href);
      }
    } else {
      copyToClipboard(window.location.href);
    }
  }, [result.isValid, copyToClipboard]);

  // Format date
  const formatDate = (date: any): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={className}
    >
      <Card className={cn(
        "border-l-4",
        result.isValid ? "border-l-primary" : "border-l-destructive"
      )}>
        <CardHeader className="text-center items-center">
          {/* 1. The Verdict */}
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center border-4",
            result.isValid 
              ? "bg-primary/10 border-primary/20" 
              : "bg-destructive/10 border-destructive/20"
          )}>
            {result.isValid ? (
              <CheckCircle className="w-10 h-10 text-primary" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <CardTitle className={cn(
            "text-2xl font-bold pt-2",
            result.isValid ? "text-primary" : "text-destructive"
          )}>
            {result.isValid ? 'Verification Successful' : 'Verification Failed'}
          </CardTitle>
          <p className="text-muted-foreground text-lg max-w-lg">
            {result.isValid 
              ? 'The document hash matches the expected value, confirming its integrity.'
              : 'The document hash does not match. This file may have been altered or is not the correct document.'
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 2. Summary of Evidence */}
          <Alert variant={result.isValid ? "default" : "destructive"}>
            <Shield className="h-4 w-4" />
            <AlertTitle>Summary of Evidence</AlertTitle>
            <AlertDescription>
              <ul className="space-y-2 mt-2">
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cryptographic Hash Comparison</span>
                  <Badge variant={result.isValid ? "default" : "destructive"}>
                    {result.isValid ? 'Match' : 'No Match'}
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">Blockchain Record</span>
                  <Badge variant={result.hasBlockchainRecord ? "default" : "secondary"}>
                    {result.hasBlockchainRecord ? 'Found' : 'Not Found'}
                  </Badge>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-sm font-medium">Local Database Status</span>
                  <Badge variant={result.statusUpdated ? "default" : "secondary"}>
                    {result.statusUpdated ? 'Updated to Verified' : (result.foundInStorage ? `Found (${result.currentStatus})` : 'Not Found')}
                  </Badge>
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* 3. Document Details */}
          {result.metadata && (
            <div className="space-y-4">
              <Separator />
              <h4 className="text-lg font-semibold">Document Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={FileText}
                  label="Document Type"
                  value={<Badge variant="secondary" className="capitalize">{result.metadata.documentType || 'N/A'}</Badge>}
                />
                <InfoItem
                  icon={User}
                  label="Recipient"
                  value={result.metadata.recipientName}
                />
                <InfoItem
                  icon={Building}
                  label="Issuer"
                  value={result.metadata.issuerName}
                />
                <InfoItem
                  icon={Calendar}
                  label="Issuance Date"
                  value={formatDate(result.metadata.issuanceDate)}
                />
              </div>
            </div>
          )}

          {/* 4. Verification Data */}
          <div className="space-y-4">
            <Separator />
            <h4 className="text-lg font-semibold">Verification Data</h4>
            <HashDisplay 
              hash={result.expectedHash}
              label="Expected Hash (From Request)"
              variant="card"
              size="sm"
            />
            <HashDisplay 
              hash={result.generatedHash}
              label="Generated Hash (From Uploaded File)"
              variant="card"
              size="sm"
            />
            {result.transactionHash && (
              <HashDisplay 
                hash={result.transactionHash}
                label="Blockchain Transaction Hash"
                variant="card"
                size="sm"
              />
            )}
          </div>
        </CardContent>

        {/* 5. Next Steps */}
        <CardFooter className="flex flex-wrap gap-4">
          <Button onClick={downloadCertificate} className="h-11">
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
          <Button onClick={shareVerificationResult} variant="outline" className="h-11">
            <Share className="w-4 h-4 mr-2" />
            Share Result
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default VerificationResult;