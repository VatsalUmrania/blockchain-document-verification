import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Share2, 
  Link, 
  Users,
  Eye,
  Edit,
  Trash2,
  X,
  Clock,
  Lock,
  Key,
  FileText,
  UserPlus,
  Globe,
  Copy,
  Calendar,
  Download,
  Shield,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import HashDisplay from '../common/HashDisplay';

// Types and Interfaces
interface Document {
  id: string;
  name: string;
  hash: string;
  type?: string;
  size?: number;
  status?: string;
  [key: string]: any;
}

interface SharedUser {
  id: string;
  email: string;
  permission: Permission;
  addedAt: number;
}

type Permission = 'view' | 'edit' | 'admin';

interface ShareSettings {
  isPublic: boolean;
  allowDownload: boolean;
  allowVerification: boolean;
  expiresAt: string;
  password: string;
  sharedWith: SharedUser[];
}

interface DocumentSharingProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface PermissionConfig {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
  bgColor: string;
}

interface PermissionIconProps {
  permission: Permission;
  className?: string;
}

const DocumentSharing: React.FC<DocumentSharingProps> = ({ 
  document, 
  isOpen, 
  onClose,
  className 
}) => {
  // State
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    allowDownload: true,
    allowVerification: true,
    expiresAt: '',
    password: '',
    sharedWith: []
  });
  const [shareLink, setShareLink] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<Permission>('view');
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Generate share link
  const generateShareLink = useCallback(async (): Promise<void> => {
    setIsGeneratingLink(true);
    try {
      // Generate a unique share link
      const linkId = Math.random().toString(36).substring(2, 15);
      const generatedLink = `${window.location.origin}/shared/${linkId}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShareLink(generatedLink);
      toast.success('Share Link Generated', {
        description: 'Share link created successfully',
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Generation Failed', {
        description: 'Failed to generate share link',
      });
    } finally {
      setIsGeneratingLink(false);
    }
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link Copied', {
        description: 'Link copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Copy Failed', {
        description: 'Failed to copy link to clipboard',
      });
    }
  }, []);

  // Add user
  const addUser = useCallback((): void => {
    if (!newUserEmail.trim()) {
      toast.error('Email Required', {
        description: 'Please enter a valid email address',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address',
      });
      return;
    }

    if (shareSettings.sharedWith.some(user => user.email === newUserEmail)) {
      toast.error('User Already Added', {
        description: 'User already has access to this document',
      });
      return;
    }

    const newUser: SharedUser = {
      id: Math.random().toString(36).substring(2, 15),
      email: newUserEmail,
      permission: selectedPermission,
      addedAt: Date.now()
    };

    setShareSettings(prev => ({
      ...prev,
      sharedWith: [...prev.sharedWith, newUser]
    }));

    setNewUserEmail('');
    toast.success('User Added', {
      description: `Access granted to ${newUserEmail}`,
    });
  }, [newUserEmail, selectedPermission, shareSettings.sharedWith]);

  // Remove user
  const removeUser = useCallback((userId: string): void => {
    const user = shareSettings.sharedWith.find(u => u.id === userId);
    setShareSettings(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.filter(user => user.id !== userId)
    }));
    
    if (user) {
      toast.info('User Removed', {
        description: `Access revoked for ${user.email}`,
      });
    }
  }, [shareSettings.sharedWith]);

  // Update user permission
  const updateUserPermission = useCallback((userId: string, newPermission: Permission): void => {
    setShareSettings(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.map(user => 
        user.id === userId ? { ...user, permission: newPermission } : user
      )
    }));
    toast.success('Permission Updated', {
      description: 'User permission has been updated',
    });
  }, []);

  // Save share settings
  const saveShareSettings = useCallback(async (): Promise<void> => {
    setIsSaving(true);
    try {
      // Here you would save the share settings to your backend/blockchain
      console.log('Saving share settings:', shareSettings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Settings Saved', {
        description: 'Share settings saved successfully',
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Save Failed', {
        description: 'Failed to save share settings',
      });
    } finally {
      setIsSaving(false);
    }
  }, [shareSettings, onClose]);

  // Get permission configuration
  const getPermissionConfig = useCallback((permission: Permission): PermissionConfig => {
    const configs: Record<Permission, PermissionConfig> = {
      view: {
        icon: Eye,
        label: 'View Only',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20'
      },
      edit: {
        icon: Edit,
        label: 'Can Edit',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
      },
      admin: {
        icon: Users,
        label: 'Admin',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20'
      }
    };
    return configs[permission];
  }, []);

  // Permission Icon Component
  const PermissionIcon: React.FC<PermissionIconProps> = ({ permission, className = "w-4 h-4" }) => {
    const config = getPermissionConfig(permission);
    const Icon = config.icon;
    return <Icon className={cn(className, config.color)} />;
  };

  // Update share setting handler
  const updateShareSetting = useCallback(<K extends keyof ShareSettings>(
    key: K, 
    value: ShareSettings[K]
  ): void => {
    setShareSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-6"
        >
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Share2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Share Document</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Control who can access this document
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Document Info */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{document.name}</h3>
                    <div className="mt-2">
                      <HashDisplay 
                        hash={document.hash} 
                        variant="compact" 
                        showLabel={false}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Public Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Globe className="w-5 h-5 text-primary" />
                  <span>Public Sharing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={shareSettings.isPublic}
                    onCheckedChange={(checked) => 
                      updateShareSetting('isPublic', checked === true)
                    }
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    <div>
                      <span className="font-medium">Make document publicly accessible</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Anyone with the link can access this document
                      </p>
                    </div>
                  </Label>
                </div>

                <AnimatePresence>
                  {shareSettings.isPublic && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Share Link Generation */}
                      <div className="flex items-center space-x-2">
                        <Input
                          value={shareLink}
                          readOnly
                          placeholder="Click 'Generate Link' to create a share link"
                          className="flex-1 font-mono text-sm"
                        />
                        <Button 
                          onClick={generateShareLink} 
                          size="sm"
                          disabled={isGeneratingLink}
                        >
                          {isGeneratingLink ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Link'
                          )}
                        </Button>
                        {shareLink && (
                          <Button
                            onClick={() => copyToClipboard(shareLink)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Advanced Options */}
                      <Card className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-sm">Advanced Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="flex items-center space-x-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Expiration Date</span>
                              </Label>
                              <Input
                                type="datetime-local"
                                value={shareSettings.expiresAt}
                                onChange={(e) => updateShareSetting('expiresAt', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="flex items-center space-x-2 text-sm">
                                <Lock className="w-4 h-4" />
                                <span>Access Password (Optional)</span>
                              </Label>
                              <Input
                                type="password"
                                value={shareSettings.password}
                                onChange={(e) => updateShareSetting('password', e.target.value)}
                                placeholder="Leave empty for no password"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="allowDownload"
                                checked={shareSettings.allowDownload}
                                onCheckedChange={(checked) => 
                                  updateShareSetting('allowDownload', checked === true)
                                }
                              />
                              <Label htmlFor="allowDownload" className="text-sm cursor-pointer">
                                Allow download
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="allowVerification"
                                checked={shareSettings.allowVerification}
                                onCheckedChange={(checked) => 
                                  updateShareSetting('allowVerification', checked === true)
                                }
                              />
                              <Label htmlFor="allowVerification" className="text-sm cursor-pointer">
                                Allow verification
                              </Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* User-specific Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  <span>Share with Specific Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1"
                  />
                  <Select value={selectedPermission} onValueChange={(value: Permission) => setSelectedPermission(value)}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="edit">Can Edit</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addUser} className="w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>

                {/* User List */}
                <AnimatePresence>
                  {shareSettings.sharedWith.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="text-sm font-medium text-muted-foreground">
                        {shareSettings.sharedWith.length} user{shareSettings.sharedWith.length > 1 ? 's' : ''} with access
                      </div>
                      {shareSettings.sharedWith.map((user) => {
                        const permissionConfig = getPermissionConfig(user.permission);
                        return (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={cn("p-2 rounded-lg", permissionConfig.bgColor)}>
                                <PermissionIcon permission={user.permission} />
                              </div>
                              <div>
                                <p className="font-medium">{user.email}</p>
                                <p className="text-sm text-muted-foreground">
                                  Added {new Date(user.addedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Select
                                value={user.permission}
                                onValueChange={(value: Permission) => updateUserPermission(user.id, value)}
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="view">View</SelectItem>
                                  <SelectItem value="edit">Edit</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                onClick={() => removeUser(user.id)}
                                variant="outline"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button 
                onClick={onClose} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                onClick={saveShareSettings}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Share Settings'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSharing;
