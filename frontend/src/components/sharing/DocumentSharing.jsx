// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import { 
//   ShareIcon, 
//   LinkIcon, 
//   UserGroupIcon,
//   EyeIcon,
//   PencilIcon,
//   TrashIcon 
// } from '@heroicons/react/24/outline';
// import Button from '../common/Button';
// import Modal from '../common/Modal';

// const DocumentSharing = ({ document, isOpen, onClose }) => {
//   const [shareSettings, setShareSettings] = useState({
//     isPublic: false,
//     allowDownload: true,
//     allowVerification: true,
//     expiresAt: '',
//     password: '',
//     sharedWith: []
//   });
//   const [shareLink, setShareLink] = useState('');
//   const [newUserEmail, setNewUserEmail] = useState('');
//   const [selectedPermission, setSelectedPermission] = useState('view');

//   const generateShareLink = async () => {
//     try {
//       // Generate a unique share link
//       const linkId = Math.random().toString(36).substring(2, 15);
//       const generatedLink = `${window.location.origin}/shared/${linkId}`;
//       setShareLink(generatedLink);
//       toast.success('Share link generated successfully!');
//     } catch (error) {
//       toast.error('Failed to generate share link');
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text).then(() => {
//       toast.success('Link copied to clipboard!');
//     }).catch(() => {
//       toast.error('Failed to copy link');
//     });
//   };

//   const addUser = () => {
//     if (!newUserEmail.trim()) {
//       toast.error('Please enter a valid email address');
//       return;
//     }

//     if (shareSettings.sharedWith.some(user => user.email === newUserEmail)) {
//       toast.error('User already has access to this document');
//       return;
//     }

//     const newUser = {
//       id: Math.random().toString(36).substring(2, 15),
//       email: newUserEmail,
//       permission: selectedPermission,
//       addedAt: Date.now()
//     };

//     setShareSettings(prev => ({
//       ...prev,
//       sharedWith: [...prev.sharedWith, newUser]
//     }));

//     setNewUserEmail('');
//     toast.success(`Access granted to ${newUserEmail}`);
//   };

//   const removeUser = (userId) => {
//     setShareSettings(prev => ({
//       ...prev,
//       sharedWith: prev.sharedWith.filter(user => user.id !== userId)
//     }));
//     toast.info('User access revoked');
//   };

//   const updateUserPermission = (userId, newPermission) => {
//     setShareSettings(prev => ({
//       ...prev,
//       sharedWith: prev.sharedWith.map(user => 
//         user.id === userId ? { ...user, permission: newPermission } : user
//       )
//     }));
//     toast.success('Permission updated');
//   };

//   const saveShareSettings = async () => {
//     try {
//       // Here you would save the share settings to your backend/blockchain
//       console.log('Saving share settings:', shareSettings);
//       toast.success('Share settings saved successfully!');
//       onClose();
//     } catch (error) {
//       toast.error('Failed to save share settings');
//     }
//   };

//   const PermissionIcon = ({ permission }) => {
//     switch (permission) {
//       case 'view':
//         return <EyeIcon className="w-4 h-4" />;
//       case 'edit':
//         return <PencilIcon className="w-4 h-4" />;
//       case 'admin':
//         return <UserGroupIcon className="w-4 h-4" />;
//       default:
//         return <EyeIcon className="w-4 h-4" />;
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl mx-auto">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white rounded-lg p-6"
//       >
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-3">
//             <ShareIcon className="w-6 h-6 text-blue-500" />
//             <h2 className="text-xl font-semibold">Share Document</h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="space-y-6">
//           {/* Document Info */}
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-800">{document?.name}</h3>
//             <p className="text-sm text-gray-600">
//               Hash: {document?.hash?.substring(0, 16)}...
//             </p>
//           </div>

//           {/* Public Sharing */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Public Sharing</h3>
            
//             <div className="flex items-center justify-between p-4 border rounded-lg">
//               <div>
//                 <label className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     checked={shareSettings.isPublic}
//                     onChange={(e) => setShareSettings({
//                       ...shareSettings,
//                       isPublic: e.target.checked
//                     })}
//                     className="rounded"
//                   />
//                   <span className="font-medium">Make document publicly accessible</span>
//                 </label>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Anyone with the link can access this document
//                 </p>
//               </div>
//             </div>

//             {shareSettings.isPublic && (
//               <div className="space-y-3">
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="text"
//                     value={shareLink}
//                     readOnly
//                     placeholder="Click 'Generate Link' to create a share link"
//                     className="input-field flex-1"
//                   />
//                   <Button onClick={generateShareLink} size="sm">
//                     Generate Link
//                   </Button>
//                   {shareLink && (
//                     <Button
//                       onClick={() => copyToClipboard(shareLink)}
//                       variant="outline"
//                       size="sm"
//                     >
//                       <LinkIcon className="w-4 h-4" />
//                     </Button>
//                   )}
//                 </div>

//                 {/* Advanced Options */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Expiration Date
//                     </label>
//                     <input
//                       type="datetime-local"
//                       value={shareSettings.expiresAt}
//                       onChange={(e) => setShareSettings({
//                         ...shareSettings,
//                         expiresAt: e.target.value
//                       })}
//                       className="input-field"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Access Password (Optional)
//                     </label>
//                     <input
//                       type="password"
//                       value={shareSettings.password}
//                       onChange={(e) => setShareSettings({
//                         ...shareSettings,
//                         password: e.target.value
//                       })}
//                       placeholder="Leave empty for no password"
//                       className="input-field"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={shareSettings.allowDownload}
//                       onChange={(e) => setShareSettings({
//                         ...shareSettings,
//                         allowDownload: e.target.checked
//                       })}
//                       className="rounded"
//                     />
//                     <span className="text-sm">Allow download</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={shareSettings.allowVerification}
//                       onChange={(e) => setShareSettings({
//                         ...shareSettings,
//                         allowVerification: e.target.checked
//                       })}
//                       className="rounded"
//                     />
//                     <span className="text-sm">Allow verification</span>
//                   </label>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* User-specific Sharing */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Share with Specific Users</h3>
            
//             <div className="flex space-x-2">
//               <input
//                 type="email"
//                 value={newUserEmail}
//                 onChange={(e) => setNewUserEmail(e.target.value)}
//                 placeholder="Enter email address"
//                 className="input-field flex-1"
//               />
//               <select
//                 value={selectedPermission}
//                 onChange={(e) => setSelectedPermission(e.target.value)}
//                 className="input-field w-auto"
//               >
//                 <option value="view">View Only</option>
//                 <option value="edit">Can Edit</option>
//                 <option value="admin">Admin</option>
//               </select>
//               <Button onClick={addUser}>Add User</Button>
//             </div>

//             {/* User List */}
//             {shareSettings.sharedWith.length > 0 && (
//               <div className="space-y-2">
//                 {shareSettings.sharedWith.map((user) => (
//                   <div
//                     key={user.id}
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex items-center space-x-3">
//                       <PermissionIcon permission={user.permission} />
//                       <div>
//                         <p className="font-medium text-gray-800">{user.email}</p>
//                         <p className="text-sm text-gray-600">
//                           Added {new Date(user.addedAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <select
//                         value={user.permission}
//                         onChange={(e) => updateUserPermission(user.id, e.target.value)}
//                         className="input-field text-sm"
//                       >
//                         <option value="view">View</option>
//                         <option value="edit">Edit</option>
//                         <option value="admin">Admin</option>
//                       </select>
//                       <button
//                         onClick={() => removeUser(user.id)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <TrashIcon className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
//             <Button onClick={onClose} variant="outline">
//               Cancel
//             </Button>
//             <Button onClick={saveShareSettings}>
//               Save Share Settings
//             </Button>
//           </div>
//         </div>
//       </motion.div>
//     </Modal>
//   );
// };

// export default DocumentSharing;


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  ShareIcon, 
  LinkIcon, 
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon,
  LockClosedIcon,
  KeyIcon,
  DocumentIcon,
  UserPlusIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';
import HashDisplay from '../common/HashDisplay';

const DocumentSharing = ({ document, isOpen, onClose }) => {
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowDownload: true,
    allowVerification: true,
    expiresAt: '',
    password: '',
    sharedWith: []
  });
  const [shareLink, setShareLink] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('view');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    try {
      // Generate a unique share link
      const linkId = Math.random().toString(36).substring(2, 15);
      const generatedLink = `${window.location.origin}/shared/${linkId}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShareLink(generatedLink);
      toast.success('🔗 Share link generated successfully!');
    } catch (error) {
      toast.error('❌ Failed to generate share link');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('📋 Link copied to clipboard!');
    }).catch(() => {
      toast.error('❌ Failed to copy link');
    });
  };

  const addUser = () => {
    if (!newUserEmail.trim()) {
      toast.error('❌ Please enter a valid email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast.error('❌ Please enter a valid email address');
      return;
    }

    if (shareSettings.sharedWith.some(user => user.email === newUserEmail)) {
      toast.error('❌ User already has access to this document');
      return;
    }

    const newUser = {
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
    toast.success(`✅ Access granted to ${newUserEmail}`);
  };

  const removeUser = (userId) => {
    const user = shareSettings.sharedWith.find(u => u.id === userId);
    setShareSettings(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.filter(user => user.id !== userId)
    }));
    toast.info(`🗑️ Access revoked for ${user?.email}`);
  };

  const updateUserPermission = (userId, newPermission) => {
    setShareSettings(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.map(user => 
        user.id === userId ? { ...user, permission: newPermission } : user
      )
    }));
    toast.success('✅ Permission updated');
  };

  const saveShareSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would save the share settings to your backend/blockchain
      console.log('Saving share settings:', shareSettings);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('💾 Share settings saved successfully!');
      onClose();
    } catch (error) {
      toast.error('❌ Failed to save share settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getPermissionConfig = (permission) => {
    const configs = {
      view: {
        icon: EyeIcon,
        label: 'View Only',
        color: 'text-[rgb(var(--color-primary))]',
        bgColor: 'bg-[rgb(var(--color-primary)/0.1)]'
      },
      edit: {
        icon: PencilIcon,
        label: 'Can Edit',
        color: 'text-[rgb(var(--color-warning))]',
        bgColor: 'bg-[rgb(var(--color-warning)/0.1)]'
      },
      admin: {
        icon: UserGroupIcon,
        label: 'Admin',
        color: 'text-[rgb(var(--color-success))]',
        bgColor: 'bg-[rgb(var(--color-success)/0.1)]'
      }
    };
    return configs[permission] || configs.view;
  };

  const PermissionIcon = ({ permission, className = "w-4 h-4" }) => {
    const config = getPermissionConfig(permission);
    const Icon = config.icon;
    return <Icon className={`${className} ${config.color}`} />;
  };

  if (!document) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[rgb(var(--border-primary))]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[rgb(var(--color-primary)/0.1)] rounded-lg">
              <ShareIcon className="w-6 h-6 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Share Document</h2>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Control who can access this document</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            icon={XMarkIcon}
            className="text-[rgb(var(--text-quaternary))] hover:text-[rgb(var(--text-primary))]"
          />
        </div>

        <div className="space-y-8">
          {/* Document Info */}
          <div className="bg-[rgb(var(--surface-secondary))] p-4 rounded-xl border border-[rgb(var(--border-primary))]">
            <div className="flex items-center space-x-3">
              <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <div className="flex-1">
                <h3 className="font-medium text-[rgb(var(--text-primary))]">{document.name}</h3>
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
          </div>

          {/* Public Sharing */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Public Sharing</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-[rgb(var(--border-primary))] rounded-xl hover:border-[rgb(var(--color-primary)/0.3)] transition-colors">
              <div className="flex-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareSettings.isPublic}
                    onChange={(e) => setShareSettings({
                      ...shareSettings,
                      isPublic: e.target.checked
                    })}
                    className="w-4 h-4 text-[rgb(var(--color-primary))] bg-[rgb(var(--surface-primary))] border-[rgb(var(--border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                  />
                  <div>
                    <span className="font-medium text-[rgb(var(--text-primary))]">Make document publicly accessible</span>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                      Anyone with the link can access this document
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <AnimatePresence>
              {shareSettings.isPublic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      placeholder="Click 'Generate Link' to create a share link"
                      className="input-field flex-1 font-mono text-sm"
                    />
                    <Button 
                      onClick={generateShareLink} 
                      size="sm"
                      loading={isGeneratingLink}
                      disabled={isGeneratingLink}
                    >
                      {isGeneratingLink ? 'Generating...' : 'Generate Link'}
                    </Button>
                    {shareLink && (
                      <Button
                        onClick={() => copyToClipboard(shareLink)}
                        variant="secondary"
                        size="sm"
                        icon={LinkIcon}
                        title="Copy link"
                      />
                    )}
                  </div>

                  {/* Advanced Options */}
                  <div className="bg-[rgb(var(--surface-secondary))] p-4 rounded-xl border border-[rgb(var(--border-primary))]">
                    <h4 className="font-medium text-[rgb(var(--text-primary))] mb-4">Advanced Options</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>Expiration Date</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={shareSettings.expiresAt}
                          onChange={(e) => setShareSettings({
                            ...shareSettings,
                            expiresAt: e.target.value
                          })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                          <LockClosedIcon className="w-4 h-4" />
                          <span>Access Password (Optional)</span>
                        </label>
                        <input
                          type="password"
                          value={shareSettings.password}
                          onChange={(e) => setShareSettings({
                            ...shareSettings,
                            password: e.target.value
                          })}
                          placeholder="Leave empty for no password"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareSettings.allowDownload}
                          onChange={(e) => setShareSettings({
                            ...shareSettings,
                            allowDownload: e.target.checked
                          })}
                          className="w-4 h-4 text-[rgb(var(--color-primary))] bg-[rgb(var(--surface-primary))] border-[rgb(var(--border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                        />
                        <span className="text-sm text-[rgb(var(--text-primary))]">Allow download</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shareSettings.allowVerification}
                          onChange={(e) => setShareSettings({
                            ...shareSettings,
                            allowVerification: e.target.checked
                          })}
                          className="w-4 h-4 text-[rgb(var(--color-primary))] bg-[rgb(var(--surface-primary))] border-[rgb(var(--border-primary))] rounded focus:ring-[rgb(var(--color-primary))] focus:ring-2"
                        />
                        <span className="text-sm text-[rgb(var(--text-primary))]">Allow verification</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User-specific Sharing */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="w-5 h-5 text-[rgb(var(--color-success))]" />
              <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">Share with Specific Users</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter email address"
                className="input-field flex-1"
              />
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                className="input-field w-full sm:w-auto"
              >
                <option value="view">View Only</option>
                <option value="edit">Can Edit</option>
                <option value="admin">Admin</option>
              </select>
              <Button 
                onClick={addUser}
                icon={UserPlusIcon}
                className="w-full sm:w-auto"
              >
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
                  <div className="text-sm font-medium text-[rgb(var(--text-secondary))]">
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
                        className="flex items-center justify-between p-4 bg-[rgb(var(--surface-secondary))] rounded-xl border border-[rgb(var(--border-primary))] hover:border-[rgb(var(--color-primary)/0.3)] transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${permissionConfig.bgColor}`}>
                            <PermissionIcon permission={user.permission} />
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--text-primary))]">{user.email}</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">
                              Added {new Date(user.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value={user.permission}
                            onChange={(e) => updateUserPermission(user.id, e.target.value)}
                            className="input-field text-sm min-w-[100px]"
                          >
                            <option value="view">View</option>
                            <option value="edit">Edit</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            onClick={() => removeUser(user.id)}
                            variant="danger"
                            size="sm"
                            icon={TrashIcon}
                            title="Remove user"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[rgb(var(--border-primary))]">
            <Button 
              onClick={onClose} 
              variant="secondary"
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveShareSettings}
              variant="primary"
              loading={isSaving}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSaving ? 'Saving...' : 'Save Share Settings'}
            </Button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DocumentSharing;
