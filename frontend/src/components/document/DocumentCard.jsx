// // src/components/document/DocumentCard.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   DocumentIcon, 
//   CalendarIcon, 
//   TagIcon,
//   ShareIcon,
//   CheckCircleIcon,
//   ClockIcon,
//   ExclamationTriangleIcon,
//   EyeIcon,
//   EyeSlashIcon,
//   UserIcon,
//   InformationCircleIcon,
//   ShieldCheckIcon,
//   DocumentTextIcon,
//   FolderIcon,
//   ChartBarIcon,
//   HashtagIcon,
//   CubeIcon
// } from '@heroicons/react/24/outline';
// import HashDisplay from '../common/HashDisplay';
// import Button from '../common/Button';

// const DocumentCard = ({ document, onShare, onVerify, onSelect, isSelected }) => {
//   const [showDetails, setShowDetails] = useState(false);

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'verified':
//         return <CheckCircleIcon className="w-5 h-5 text-[#00C853]" />;
//       case 'pending':
//         return <ClockIcon className="w-5 h-5 text-[#FF9800]" />;
//       case 'failed':
//         return <ExclamationTriangleIcon className="w-5 h-5 text-[#FF4C4C]" />;
//       default:
//         return <DocumentIcon className="w-5 h-5 text-[#666666]" />;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'verified':
//         return 'bg-[#00C853]/20 text-[#00C853] border-[#00C853]/30';
//       case 'pending':
//         return 'bg-[#FF9800]/20 text-[#FF9800] border-[#FF9800]/30';
//       case 'failed':
//         return 'bg-[#FF4C4C]/20 text-[#FF4C4C] border-[#FF4C4C]/30';
//       default:
//         return 'bg-[#333333] text-[#999999] border-[#444444]';
//     }
//   };

//   const getFileTypeIcon = (type) => {
//     if (type?.includes('pdf')) return <DocumentTextIcon className="w-5 h-5 text-[#FF4C4C]" />;
//     if (type?.includes('image')) return <CubeIcon className="w-5 h-5 text-[#00C853]" />;
//     if (type?.includes('word') || type?.includes('document')) return <DocumentIcon className="w-5 h-5 text-[#296CFF]" />;
//     return <FolderIcon className="w-5 h-5 text-[#8B5CF6]" />;
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       whileHover={{ y: -4, scale: 1.02 }}
//       className={`card hover:shadow-2xl hover:shadow-[#296CFF]/20 transition-all duration-300 cursor-pointer ${
//         isSelected ? 'ring-2 ring-[#296CFF] bg-[#296CFF]/5' : ''
//       }`}
//       onClick={() => onSelect && onSelect(document.id)}
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center space-x-3">
//           <div className="p-2 bg-[#121212] rounded-lg border border-[#333333]">
//             {getFileTypeIcon(document.type)}
//           </div>
//           <div className="min-w-0 flex-1">
//             <h3 className="text-lg font-semibold text-white truncate">
//               {document.name}
//             </h3>
//             <div className="flex items-center space-x-2 text-sm text-[#999999]">
//               <ChartBarIcon className="w-3 h-3" />
//               <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
//               <span className="text-[#666666]">•</span>
//               <span>{document.type || 'Unknown'}</span>
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           {isSelected && (
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               className="p-1 bg-[#296CFF] rounded-full"
//             >
//               <CheckCircleIcon className="w-3 h-3 text-white" />
//             </motion.div>
//           )}
//           <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(document.status)}`}>
//             <div className="flex items-center space-x-1">
//               {getStatusIcon(document.status)}
//               <span>{document.status || 'Unknown'}</span>
//             </div>
//           </span>
//         </div>
//       </div>

//       {/* Document Hash - Beautiful Display */}
//       <div className="mb-4">
//         <HashDisplay 
//           hash={document.hash} 
//           label="Document Hash"
//           variant="card"
//         />
//       </div>

//       {/* Metadata */}
//       <div className="space-y-3 mb-4">
//         <div className="flex items-center text-sm text-[#CCCCCC]">
//           <CalendarIcon className="w-4 h-4 mr-2 text-[#296CFF]" />
//           <span>Uploaded {new Date(document.timestamp).toLocaleDateString()}</span>
//         </div>
        
//         {document.category && (
//           <div className="flex items-center text-sm text-[#CCCCCC]">
//             <TagIcon className="w-4 h-4 mr-2 text-[#00C853]" />
//             <span className="capitalize bg-[#121212] px-2 py-1 rounded border border-[#333333]">
//               {document.category}
//             </span>
//           </div>
//         )}
        
//         {document.metadata?.uploader && (
//           <div className="flex items-center text-sm text-[#CCCCCC]">
//             <UserIcon className="w-4 h-4 mr-2 text-[#8B5CF6]" />
//             <span className="font-mono text-xs">
//               {document.metadata.uploader.substring(0, 8)}...
//             </span>
//           </div>
//         )}
        
//         {document.description && (
//           <div className="bg-[#121212] p-3 rounded-lg border border-[#333333]">
//             <div className="flex items-start space-x-2">
//               <InformationCircleIcon className="w-4 h-4 text-[#296CFF] mt-0.5 flex-shrink-0" />
//               <p className="text-sm text-[#CCCCCC]">
//                 {document.description}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Expandable Details */}
//       <div className="border-t border-[#333333] pt-4">
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={(e) => {
//             e.stopPropagation();
//             setShowDetails(!showDetails);
//           }}
//           className="flex items-center space-x-2 text-sm text-[#296CFF] hover:text-[#2979FF] font-medium mb-4 transition-colors duration-200"
//         >
//           {showDetails ? (
//             <EyeSlashIcon className="w-4 h-4" />
//           ) : (
//             <EyeIcon className="w-4 h-4" />
//           )}
//           <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
//         </motion.button>

//         {showDetails && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="space-y-4 mb-4"
//           >
//             {/* Full Hash Display */}
//             <div>
//               <HashDisplay 
//                 hash={document.hash}
//                 label="Full Document Hash"
//                 showFullHash
//               />
//             </div>

//             {/* Additional Metadata */}
//             {document.metadata && (
//               <div className="bg-[#121212] rounded-xl p-4 border border-[#333333]">
//                 <div className="flex items-center space-x-2 mb-3">
//                   <HashtagIcon className="w-4 h-4 text-[#8B5CF6]" />
//                   <h5 className="font-semibold text-white">Metadata</h5>
//                 </div>
//                 <div className="space-y-3 text-sm">
//                   {document.metadata.uploader && (
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-2">
//                         <UserIcon className="w-4 h-4 text-[#296CFF]" />
//                         <span className="font-medium text-[#E0E0E0]">Uploader:</span>
//                       </div>
//                       <HashDisplay 
//                         hash={document.metadata.uploader}
//                         variant="compact"
//                         showLabel={false}
//                       />
//                     </div>
//                   )}
                  
//                   {document.metadata.uploadedAt && (
//                     <div className="flex items-center space-x-2">
//                       <CalendarIcon className="w-4 h-4 text-[#00C853]" />
//                       <span className="font-medium text-[#E0E0E0]">Upload Time:</span>
//                       <span className="text-[#CCCCCC]">
//                         {new Date(document.metadata.uploadedAt).toLocaleString()}
//                       </span>
//                     </div>
//                   )}
                  
//                   {document.metadata.fileType && (
//                     <div className="flex items-center space-x-2">
//                       <FolderIcon className="w-4 h-4 text-[#FF9800]" />
//                       <span className="font-medium text-[#E0E0E0]">File Type:</span>
//                       <span className="text-[#CCCCCC] bg-[#0D0D0D] px-2 py-1 rounded border border-[#333333]">
//                         {document.metadata.fileType}
//                       </span>
//                     </div>
//                   )}
                  
//                   {document.metadata.description && (
//                     <div>
//                       <div className="flex items-center space-x-2 mb-2">
//                         <InformationCircleIcon className="w-4 h-4 text-[#296CFF]" />
//                         <span className="font-medium text-[#E0E0E0]">Description:</span>
//                       </div>
//                       <p className="text-[#CCCCCC] bg-[#0D0D0D] p-3 rounded border border-[#333333]">
//                         {document.metadata.description}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Document Stats */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-[#296CFF]/10 p-3 rounded-lg border border-[#296CFF]/30">
//                 <div className="flex items-center space-x-2">
//                   <ChartBarIcon className="w-4 h-4 text-[#296CFF]" />
//                   <span className="text-xs font-medium text-[#296CFF]">File Size</span>
//                 </div>
//                 <p className="text-lg font-bold text-white mt-1">
//                   {(document.size / 1024 / 1024).toFixed(2)} MB
//                 </p>
//               </div>
              
//               <div className="bg-[#00C853]/10 p-3 rounded-lg border border-[#00C853]/30">
//                 <div className="flex items-center space-x-2">
//                   <CheckCircleIcon className="w-4 h-4 text-[#00C853]" />
//                   <span className="text-xs font-medium text-[#00C853]">Status</span>
//                 </div>
//                 <p className="text-lg font-bold text-white mt-1 capitalize">
//                   {document.status || 'Unknown'}
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Actions */}
//         <div className="flex space-x-3">
//           <Button 
//             onClick={(e) => {
//               e.stopPropagation();
//               onVerify(document);
//             }} 
//             size="sm" 
//             variant="primary"
//             className="flex items-center space-x-2"
//           >
//             <ShieldCheckIcon className="w-4 h-4" />
//             <span>Verify</span>
//           </Button>
          
//           <Button 
//             onClick={(e) => {
//               e.stopPropagation();
//               onShare(document);
//             }} 
//             size="sm" 
//             variant="outline"
//             className="flex items-center space-x-2"
//           >
//             <ShareIcon className="w-4 h-4" />
//             <span>Share</span>
//           </Button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default DocumentCard;

// src/components/document/DocumentCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentIcon, 
  CalendarIcon, 
  TagIcon,
  ShareIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  FolderIcon,
  ChartBarIcon,
  HashtagIcon,
  CubeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import HashDisplay from '../common/HashDisplay';
import Button from '../common/Button';

const DocumentCard = ({ document, onShare, onVerify, onSelect, isSelected }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5 text-[rgb(var(--color-success))]" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-[rgb(var(--color-warning))]" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-[rgb(var(--color-error))]" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-[rgb(var(--text-quaternary))]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-[rgb(var(--color-success)/0.2)] text-[rgb(var(--color-success))] border-[rgb(var(--color-success)/0.3)]';
      case 'pending':
        return 'bg-[rgb(var(--color-warning)/0.2)] text-[rgb(var(--color-warning))] border-[rgb(var(--color-warning)/0.3)]';
      case 'failed':
        return 'bg-[rgb(var(--color-error)/0.2)] text-[rgb(var(--color-error))] border-[rgb(var(--color-error)/0.3)]';
      default:
        return 'bg-[rgb(var(--text-quaternary)/0.2)] text-[rgb(var(--text-quaternary))] border-[rgb(var(--border-primary))]';
    }
  };

  const getFileTypeIcon = (type) => {
    if (type?.includes('pdf')) return <DocumentTextIcon className="w-5 h-5 text-[rgb(var(--color-error))]" />;
    if (type?.includes('image')) return <PhotoIcon className="w-5 h-5 text-[rgb(var(--color-success))]" />;
    if (type?.includes('word') || type?.includes('document')) return <DocumentIcon className="w-5 h-5 text-[rgb(var(--color-primary))]" />;
    return <FolderIcon className="w-5 h-5 text-[rgb(139,92,246)]" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`card hover:shadow-2xl transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary)/0.05)]' : ''
      }`}
      onClick={() => onSelect && onSelect(document.id)}
      style={isSelected ? {
        boxShadow: `0 0 0 2px rgb(var(--color-primary)), 0 20px 40px rgba(var(--color-primary), 0.2)`
      } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[rgb(var(--surface-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
            {getFileTypeIcon(document.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] truncate">
              {document.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-[rgb(var(--text-secondary))]">
              <ChartBarIcon className="w-3 h-3" />
              <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
              <span className="text-[rgb(var(--text-quaternary))]">•</span>
              <span>{document.type || 'Unknown'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="p-1 bg-[rgb(var(--color-primary))] rounded-full"
              >
                <CheckCircleIcon className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(document.status)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(document.status)}
              <span className="capitalize">{document.status || 'Unknown'}</span>
            </div>
          </span>
        </div>
      </div>

      {/* Document Hash - Beautiful Display */}
      <div className="mb-4">
        <HashDisplay 
          hash={document.hash} 
          label="Document Hash"
          variant="card"
          size="sm"
        />
      </div>

      {/* Metadata */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-[rgb(var(--text-secondary))]">
          <CalendarIcon className="w-4 h-4 mr-2 text-[rgb(var(--color-primary))]" />
          <span>Uploaded {new Date(document.timestamp).toLocaleDateString()}</span>
        </div>
        
        {document.category && (
          <div className="flex items-center text-sm text-[rgb(var(--text-secondary))]">
            <TagIcon className="w-4 h-4 mr-2 text-[rgb(var(--color-success))]" />
            <span className="capitalize bg-[rgb(var(--surface-secondary))] px-2 py-1 rounded border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))]">
              {document.category}
            </span>
          </div>
        )}
        
        {document.metadata?.uploader && (
          <div className="flex items-center text-sm text-[rgb(var(--text-secondary))]">
            <UserIcon className="w-4 h-4 mr-2 text-[rgb(139,92,246)]" />
            <span className="font-mono text-xs">
              {document.metadata.uploader.substring(0, 8)}...
            </span>
          </div>
        )}
        
        {document.description && (
          <div className="bg-[rgb(var(--surface-secondary))] p-3 rounded-lg border border-[rgb(var(--border-primary))]">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                {document.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <div className="border-t border-[rgb(var(--border-primary))] pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="flex items-center space-x-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-hover))] font-medium mb-4 transition-colors duration-200"
        >
          {showDetails ? (
            <EyeSlashIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 mb-4 overflow-hidden"
            >
              {/* Full Hash Display */}
              <div>
                <HashDisplay 
                  hash={document.hash}
                  label="Full Document Hash"
                  showFullHash
                  size="sm"
                />
              </div>

              {/* Additional Metadata */}
              {document.metadata && (
                <div className="bg-[rgb(var(--surface-secondary))] rounded-xl p-4 border border-[rgb(var(--border-primary))]">
                  <div className="flex items-center space-x-2 mb-3">
                    <HashtagIcon className="w-4 h-4 text-[rgb(139,92,246)]" />
                    <h5 className="font-semibold text-[rgb(var(--text-primary))]">Metadata</h5>
                  </div>
                  <div className="space-y-3 text-sm">
                    {document.metadata.uploader && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                          <span className="font-medium text-[rgb(var(--text-primary))]">Uploader:</span>
                        </div>
                        <HashDisplay 
                          hash={document.metadata.uploader}
                          variant="compact"
                          showLabel={false}
                          size="sm"
                        />
                      </div>
                    )}
                    
                    {document.metadata.uploadedAt && (
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                        <span className="font-medium text-[rgb(var(--text-primary))]">Upload Time:</span>
                        <span className="text-[rgb(var(--text-secondary))]">
                          {new Date(document.metadata.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {document.metadata.fileType && (
                      <div className="flex items-center space-x-2">
                        <FolderIcon className="w-4 h-4 text-[rgb(var(--color-warning))]" />
                        <span className="font-medium text-[rgb(var(--text-primary))]">File Type:</span>
                        <span className="text-[rgb(var(--text-secondary))] bg-[rgb(var(--surface-primary))] px-2 py-1 rounded border border-[rgb(var(--border-primary))]">
                          {document.metadata.fileType}
                        </span>
                      </div>
                    )}
                    
                    {document.metadata.description && (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <InformationCircleIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                          <span className="font-medium text-[rgb(var(--text-primary))]">Description:</span>
                        </div>
                        <p className="text-[rgb(var(--text-secondary))] bg-[rgb(var(--surface-primary))] p-3 rounded border border-[rgb(var(--border-primary))]">
                          {document.metadata.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[rgb(var(--color-primary)/0.1)] p-3 rounded-lg border border-[rgb(var(--color-primary)/0.3)]">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                    <span className="text-xs font-medium text-[rgb(var(--color-primary))]">File Size</span>
                  </div>
                  <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-1">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className="bg-[rgb(var(--color-success)/0.1)] p-3 rounded-lg border border-[rgb(var(--color-success)/0.3)]">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-4 h-4 text-[rgb(var(--color-success))]" />
                    <span className="text-xs font-medium text-[rgb(var(--color-success))]">Status</span>
                  </div>
                  <p className="text-lg font-bold text-[rgb(var(--text-primary))] mt-1 capitalize">
                    {document.status || 'Unknown'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onVerify(document);
            }} 
            size="sm" 
            variant="primary"
            icon={ShieldCheckIcon}
          >
            Verify
          </Button>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onShare(document);
            }} 
            size="sm" 
            variant="secondary"
            icon={ShareIcon}
          >
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DocumentCard;
