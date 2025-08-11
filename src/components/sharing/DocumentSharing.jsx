import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  ShareIcon, 
  LinkIcon, 
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import Modal from '../common/Modal';

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

  const generateShareLink = async () => {
    try {
      // Generate a unique share link
      const linkId = Math.random().toString(36).substring(2, 15);
      const generatedLink = `${window.location.origin}/shared/${linkId}`;
      setShareLink(generatedLink);
      toast.success('Share link generated successfully!');
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const addUser = () => {
    if (!newUserEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (shareSettings.sharedWith.some(user => user.email === newUserEmail)) {
      toast.error('User already has access to this document');
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
    toast.success(`Access granted to ${newUserEmail}`);
  };

  const removeUser = (userId) => {
    setShareSettings(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.filter(user => user.id !== userId)
    }));
    toast.info('User access revoked');
  };

  const updateUserPermission = (userId, newPermission) => {
    setShareSettings(prev => ({
      ...prev,
      sharedWith: prev.sharedWith.map(user => 
        user.id === userId ? { ...user, permission: newPermission } : user
      )
    }));
    toast.success('Permission updated');
  };

  const saveShareSettings = async () => {
    try {
      // Here you would save the share settings to your backend/blockchain
      console.log('Saving share settings:', shareSettings);
      toast.success('Share settings saved successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to save share settings');
    }
  };

  const PermissionIcon = ({ permission }) => {
    switch (permission) {
      case 'view':
        return <EyeIcon className="w-4 h-4" />;
      case 'edit':
        return <PencilIcon className="w-4 h-4" />;
      case 'admin':
        return <UserGroupIcon className="w-4 h-4" />;
      default:
        return <EyeIcon className="w-4 h-4" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ShareIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Share Document</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800">{document?.name}</h3>
            <p className="text-sm text-gray-600">
              Hash: {document?.hash?.substring(0, 16)}...
            </p>
          </div>

          {/* Public Sharing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Public Sharing</h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={shareSettings.isPublic}
                    onChange={(e) => setShareSettings({
                      ...shareSettings,
                      isPublic: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="font-medium">Make document publicly accessible</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Anyone with the link can access this document
                </p>
              </div>
            </div>

            {shareSettings.isPublic && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    placeholder="Click 'Generate Link' to create a share link"
                    className="input-field flex-1"
                  />
                  <Button onClick={generateShareLink} size="sm">
                    Generate Link
                  </Button>
                  {shareLink && (
                    <Button
                      onClick={() => copyToClipboard(shareLink)}
                      variant="outline"
                      size="sm"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Password (Optional)
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

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.allowDownload}
                      onChange={(e) => setShareSettings({
                        ...shareSettings,
                        allowDownload: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Allow download</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.allowVerification}
                      onChange={(e) => setShareSettings({
                        ...shareSettings,
                        allowVerification: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Allow verification</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* User-specific Sharing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Share with Specific Users</h3>
            
            <div className="flex space-x-2">
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
                className="input-field w-auto"
              >
                <option value="view">View Only</option>
                <option value="edit">Can Edit</option>
                <option value="admin">Admin</option>
              </select>
              <Button onClick={addUser}>Add User</Button>
            </div>

            {/* User List */}
            {shareSettings.sharedWith.length > 0 && (
              <div className="space-y-2">
                {shareSettings.sharedWith.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <PermissionIcon permission={user.permission} />
                      <div>
                        <p className="font-medium text-gray-800">{user.email}</p>
                        <p className="text-sm text-gray-600">
                          Added {new Date(user.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.permission}
                        onChange={(e) => updateUserPermission(user.id, e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="view">View</option>
                        <option value="edit">Edit</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={saveShareSettings}>
              Save Share Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DocumentSharing;
