import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Bug, 
  FileText,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateDocumentHash, verifyDocumentHash } from '../../services/hashService';

// Types and Interfaces
interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface HashGenerationResult {
  hash: string;
  fullHash?: string;
  file: FileInfo;
  metadata?: Record<string, any>;
  algorithm: string;
  timestamp: number;
}

interface VerificationStrategy {
  name: string;
  hash: string;
  description?: string;
}

interface VerificationResult {
  isValid: boolean;
  expectedHash: string;
  matchingStrategy?: string;
  strategies?: VerificationStrategy[];
  timestamp: number;
}

interface ComparisonResult {
  identical: boolean;
  file1Hash: string;
  file2Hash: string;
  file1: FileInfo;
  file2: FileInfo;
}

interface DebugResult {
  hashGeneration: HashGenerationResult;
  verification?: VerificationResult;
  comparison?: ComparisonResult;
}

interface FileUploadProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
}

const HashDebugger: React.FC = () => {
  // State
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);

  // File selection handlers
  const handleFileSelect = useCallback((fileNumber: 1 | 2, event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0] || null;
    if (fileNumber === 1) {
      setFile1(file);
    } else {
      setFile2(file);
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Hash Copied', {
        description: 'Hash copied to clipboard successfully',
      });
    } catch (error) {
      toast.error('Copy Failed', {
        description: 'Failed to copy hash to clipboard',
      });
    }
  }, []);

  // Debug hash analysis
  const debugHash = useCallback(async (): Promise<void> => {
    if (!file1) {
      toast.error('File Required', {
        description: 'Please select a file to debug',
      });
      return;
    }

    setIsDebugging(true);
    try {
      // Generate hash with detailed info
      const hashResult = await generateDocumentHash(file1);
      
      // If expected hash is provided, verify it
      let verificationResult: VerificationResult | null = null;
      if (expectedHash.trim()) {
        verificationResult = await verifyDocumentHash(file1, expectedHash.trim());
      }

      // Compare with second file if provided
      let comparisonResult: ComparisonResult | null = null;
      if (file2) {
        const hash2 = await generateDocumentHash(file2);
        comparisonResult = {
          identical: hashResult.hash === hash2.hash,
          file1Hash: hashResult.hash,
          file2Hash: hash2.hash,
          file1: hashResult.file,
          file2: hash2.file
        };
      }

      setDebugResult({
        hashGeneration: hashResult,
        verification: verificationResult || undefined,
        comparison: comparisonResult || undefined
      });

      toast.success('Analysis Complete', {
        description: 'Debug analysis completed successfully',
      });
    } catch (error) {
      console.error('Debug error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Debug Failed', {
        description: `Debug failed: ${errorMessage}`,
      });
    } finally {
      setIsDebugging(false);
    }
  }, [file1, file2, expectedHash]);

  // File Upload Component
  const FileUpload: React.FC<FileUploadProps> = ({ label, file, onFileSelect, accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">{label}</Label>
      <Input
        type="file"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
        accept={accept}
        className="cursor-pointer"
      />
      {file && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );

  // Hash Display Component
  const HashDisplay: React.FC<{ label: string; hash: string; className?: string }> = ({ label, hash, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(hash)}
          className="h-8 w-8 p-0"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <Card>
        <CardContent className="p-3">
          <code className="text-xs font-mono break-all">{hash}</code>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full border border-red-200 dark:border-red-800">
              <Bug className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Hash Debugger
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Advanced troubleshooting tool for hash mismatch issues and document hashing analysis
          </p>
        </div>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bug className="w-5 h-5 text-primary" />
              </div>
              <span>Debug Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="📄 Primary File (to debug)"
                file={file1}
                onFileSelect={setFile1}
              />
              <FileUpload
                label="🔄 Comparison File (optional)"
                file={file2}
                onFileSelect={setFile2}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">🎯 Expected Hash (for verification)</Label>
              <Input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Enter the expected hash value for comparison..."
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={debugHash}
              disabled={!file1 || isDebugging}
              variant="destructive"
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isDebugging ? (
                <>
                  <Bug className="w-5 h-5 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bug className="w-5 h-5 mr-2" />
                  Start Debug Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Debug Results */}
        {debugResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <Tabs defaultValue="generation" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="generation">Hash Generation</TabsTrigger>
                {debugResult.verification && (
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                )}
                {debugResult.comparison && (
                  <TabsTrigger value="comparison">File Comparison</TabsTrigger>
                )}
              </TabsList>

              {/* Hash Generation Results */}
              <TabsContent value="generation">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Hash Generation Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Information */}
                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-base">File Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <strong>Name:</strong> {debugResult.hashGeneration.file.name}
                          </div>
                          <div>
                            <strong>Size:</strong> {debugResult.hashGeneration.file.size.toLocaleString()} bytes
                          </div>
                          <div>
                            <strong>Type:</strong> {debugResult.hashGeneration.file.type || 'Unknown'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Generated Hashes */}
                    <div className="space-y-4">
                      <HashDisplay
                        label="📄 File Content Hash"
                        hash={debugResult.hashGeneration.hash}
                      />
                      
                      {debugResult.hashGeneration.fullHash && (
                        <HashDisplay
                          label="📋 File + Metadata Hash"
                          hash={debugResult.hashGeneration.fullHash}
                        />
                      )}
                    </div>

                    {/* Metadata */}
                    {debugResult.hashGeneration.metadata && (
                      <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardHeader>
                          <CardTitle className="text-base text-purple-700 dark:text-purple-300">
                            Metadata Used in Hash
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs bg-card p-3 rounded-lg overflow-auto border">
                            {JSON.stringify(debugResult.hashGeneration.metadata, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Verification Results */}
              {debugResult.verification && (
                <TabsContent value="verification">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ClipboardCheck className="w-5 h-5 text-green-600" />
                        <span>Verification Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert className={debugResult.verification.isValid ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}>
                        <div className="flex items-center justify-center space-x-3 mb-4">
                          {debugResult.verification.isValid ? (
                            <>
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                              <span className="text-green-600 dark:text-green-400 font-bold text-xl">✅ MATCH FOUND</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                              <span className="text-red-600 dark:text-red-400 font-bold text-xl">❌ NO MATCH</span>
                            </>
                          )}
                          {debugResult.verification.matchingStrategy && (
                            <Badge variant="secondary" className="text-xs">
                              Strategy: {debugResult.verification.matchingStrategy}
                            </Badge>
                          )}
                        </div>

                        <AlertDescription>
                          <div className="space-y-4">
                            <HashDisplay
                              label="🎯 Expected Hash"
                              hash={debugResult.verification.expectedHash}
                            />

                            {debugResult.verification.strategies && (
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">🧪 Tested Strategies</Label>
                                {debugResult.verification.strategies.map((strategy, index) => (
                                  <Card key={index} className="bg-card">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{strategy.name}</span>
                                        <div className="flex items-center space-x-2">
                                          <Badge 
                                            variant={strategy.hash === debugResult.verification!.expectedHash ? "default" : "destructive"}
                                            className="text-xs"
                                          >
                                            {strategy.hash === debugResult.verification!.expectedHash ? '✅ MATCH' : '❌ NO MATCH'}
                                          </Badge>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(strategy.hash)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Copy className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <code className="text-xs text-muted-foreground break-all font-mono">
                                        {strategy.hash}
                                      </code>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* File Comparison Results */}
              {debugResult.comparison && (
                <TabsContent value="comparison">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span>File Comparison Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Alert className={debugResult.comparison.identical ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"}>
                        <div className="text-center mb-6">
                          {debugResult.comparison.identical ? (
                            <div className="flex items-center justify-center space-x-2">
                              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                              <span className="text-green-600 dark:text-green-400 font-bold text-xl">✅ FILES ARE IDENTICAL</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">⚠️ FILES ARE DIFFERENT</span>
                            </div>
                          )}
                        </div>

                        <AlertDescription>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  <span>File 1</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                <div><strong>Name:</strong> {debugResult.comparison.file1.name}</div>
                                <HashDisplay 
                                  label="Hash"
                                  hash={debugResult.comparison.file1Hash}
                                />
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <span>File 2</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm space-y-2">
                                <div><strong>Name:</strong> {debugResult.comparison.file2.name}</div>
                                <HashDisplay 
                                  label="Hash"
                                  hash={debugResult.comparison.file2Hash}
                                />
                              </CardContent>
                            </Card>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HashDebugger;
