// import React from 'react';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { 
//   BuildingOfficeIcon,
//   UserGroupIcon,
//   DocumentPlusIcon,
//   ShieldCheckIcon,
//   QrCodeIcon,
//   ArrowRightIcon,
//   CheckCircleIcon,
//   CubeTransparentIcon
// } from '@heroicons/react/24/outline';

// const UserTypeSelection = () => {
//   const userTypes = [
//     {
//       title: "Institution / Issuer",
//       description: "Register your institution and issue verifiable documents on the blockchain",
//       icon: BuildingOfficeIcon,
//       color: "from-purple-500 to-purple-700",
//       features: [
//         "Register institution on blockchain",
//         "Issue documents with metadata",
//         "Generate QR codes for verification",
//         "Manage document lifecycle"
//       ],
//       actions: [
//         { label: "Issue Documents", path: "/issue-document", primary: true },
//         { label: "Upload Documents", path: "/upload", primary: false }
//       ]
//     },
//     {
//       title: "Third-Party Verifier",
//       description: "Verify documents independently without relying on centralized servers",
//       icon: UserGroupIcon,
//       color: "from-blue-500 to-blue-700",
//       features: [
//         "Verify documents from blockchain",
//         "Upload files for verification",
//         "Scan QR codes instantly",
//         "Access complete document info"
//       ],
//       actions: [
//         { label: "Verify Documents", path: "/third-party-verify", primary: true },
//         { label: "QR Scanner", path: "/qr-scanner", primary: false }
//       ]
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#121212] py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-16"
//         >
//           <div className="flex items-center justify-center mb-6">
//             <div className="p-4 bg-gradient-to-r from-[#296CFF] to-[#2979FF] rounded-2xl shadow-lg shadow-[#296CFF]/30">
//               <CubeTransparentIcon className="w-12 h-12 text-white" />
//             </div>
//           </div>
          
//           <h1 className="text-5xl font-bold mb-4">
//             <span className="bg-gradient-to-r from-[#296CFF] to-[#2979FF] bg-clip-text text-transparent">
//               Decentralized Document
//             </span>
//             <br />
//             <span className="text-[#E0E0E0]">Verification System</span>
//           </h1>
          
//           <p className="text-xl text-[#B0B0B0] max-w-3xl mx-auto leading-relaxed">
//             A blockchain-based system where institutions can issue documents and third parties 
//             can verify them without relying on centralized servers. Choose your role below:
//           </p>
//         </motion.div>

//         {/* User Type Cards */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
//           {userTypes.map((userType, index) => (
//             <motion.div
//               key={userType.title}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6, delay: index * 0.2 }}
//               className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-8 hover:border-[#296CFF] transition-all duration-300 hover:shadow-lg hover:shadow-[#296CFF]/10"
//             >
//               {/* Header */}
//               <div className="flex items-center mb-6">
//                 <div className={`p-4 bg-gradient-to-r ${userType.color} rounded-xl shadow-lg mr-4`}>
//                   <userType.icon className="w-8 h-8 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold text-[#E0E0E0] mb-2">
//                     {userType.title}
//                   </h3>
//                   <p className="text-[#B0B0B0]">
//                     {userType.description}
//                   </p>
//                 </div>
//               </div>

//               {/* Features */}
//               <div className="mb-8">
//                 <h4 className="text-lg font-semibold text-[#E0E0E0] mb-4">Key Features:</h4>
//                 <ul className="space-y-3">
//                   {userType.features.map((feature, featureIndex) => (
//                     <li key={featureIndex} className="flex items-center text-[#B0B0B0]">
//                       <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
//                       {feature}
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               {/* Actions */}
//               <div className="space-y-3">
//                 {userType.actions.map((action, actionIndex) => (
//                   <Link
//                     key={actionIndex}
//                     to={action.path}
//                     className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
//                       action.primary
//                         ? `bg-gradient-to-r ${userType.color} text-white hover:shadow-lg hover:shadow-current/30 transform hover:scale-105`
//                         : 'bg-[#2A2A2A] text-[#E0E0E0] border border-[#333333] hover:border-[#296CFF] hover:bg-[#333333]'
//                     }`}
//                   >
//                     {action.label}
//                     <ArrowRightIcon className="w-5 h-5 ml-2" />
//                   </Link>
//                 ))}
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* How It Works */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//           className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-8"
//         >
//           <h2 className="text-3xl font-bold text-[#E0E0E0] mb-8 text-center">
//             How It Works
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="text-center">
//               <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <DocumentPlusIcon className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">1. Issue</h3>
//               <p className="text-[#B0B0B0]">
//                 Institutions register and issue documents with metadata on the blockchain
//               </p>
//             </div>
            
//             <div className="text-center">
//               <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <QrCodeIcon className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">2. Share</h3>
//               <p className="text-[#B0B0B0]">
//                 QR codes are generated and embedded in documents for easy verification
//               </p>
//             </div>
            
//             <div className="text-center">
//               <div className="p-4 bg-gradient-to-r from-green-500 to-green-700 rounded-xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
//                 <ShieldCheckIcon className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl font-semibold text-[#E0E0E0] mb-2">3. Verify</h3>
//               <p className="text-[#B0B0B0]">
//                 Third parties verify documents directly from blockchain without centralized servers
//               </p>
//             </div>
//           </div>
//         </motion.div>

//         {/* Benefits */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.6 }}
//           className="mt-16 text-center"
//         >
//           <h2 className="text-3xl font-bold text-[#E0E0E0] mb-8">
//             Why Choose Decentralized Verification?
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {[
//               { title: "No Dependencies", desc: "Works without issuer's servers" },
//               { title: "Tamper-Proof", desc: "Stored on immutable blockchain" },
//               { title: "Global Access", desc: "Verify from anywhere in the world" },
//               { title: "Real-Time", desc: "Instant verification results" }
//             ].map((benefit, index) => (
//               <div key={index} className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-[#E0E0E0] mb-2">
//                   {benefit.title}
//                 </h3>
//                 <p className="text-[#B0B0B0] text-sm">
//                   {benefit.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default UserTypeSelection;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentPlusIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CubeTransparentIcon,
  GlobeAltIcon,
  ClockIcon,
  LockClosedIcon,
  ServerIcon
} from '@heroicons/react/24/outline';

const UserTypeSelection = () => {
  const userTypes = [
    {
      title: "Institution / Issuer",
      description: "Register your institution and issue verifiable documents on the blockchain",
      icon: BuildingOfficeIcon,
      gradientFrom: "rgb(147, 51, 234)", // purple-600
      gradientTo: "rgb(126, 34, 206)",   // purple-700
      features: [
        "Register institution on blockchain",
        "Issue documents with metadata",
        "Generate QR codes for verification",
        "Manage document lifecycle"
      ],
      actions: [
        { label: "Issue Documents", path: "/issue-document", primary: true },
        { label: "Upload Documents", path: "/upload", primary: false }
      ]
    },
    {
      title: "Third-Party Verifier",
      description: "Verify documents independently without relying on centralized servers",
      icon: UserGroupIcon,
      gradientFrom: "rgb(var(--color-primary))",
      gradientTo: "rgb(var(--color-primary-hover))",
      features: [
        "Verify documents from blockchain",
        "Upload files for verification",
        "Scan QR codes instantly",
        "Access complete document info"
      ],
      actions: [
        { label: "Verify Documents", path: "/third-party-verify", primary: true },
        { label: "QR Scanner", path: "/qr-scanner", primary: false }
      ]
    }
  ];

  const workflowSteps = [
    {
      icon: DocumentPlusIcon,
      title: "Issue",
      description: "Institutions register and issue documents with metadata on the blockchain",
      gradientFrom: "rgb(147, 51, 234)",
      gradientTo: "rgb(126, 34, 206)"
    },
    {
      icon: QrCodeIcon,
      title: "Share",
      description: "QR codes are generated and embedded in documents for easy verification",
      gradientFrom: "rgb(var(--color-primary))",
      gradientTo: "rgb(var(--color-primary-hover))"
    },
    {
      icon: ShieldCheckIcon,
      title: "Verify",
      description: "Third parties verify documents directly from blockchain without centralized servers",
      gradientFrom: "rgb(var(--color-success))",
      gradientTo: "rgb(var(--color-success-hover))"
    }
  ];

  const benefits = [
    { 
      title: "No Dependencies", 
      desc: "Works without issuer's servers",
      icon: ServerIcon
    },
    { 
      title: "Tamper-Proof", 
      desc: "Stored on immutable blockchain",
      icon: LockClosedIcon
    },
    { 
      title: "Global Access", 
      desc: "Verify from anywhere in the world",
      icon: GlobeAltIcon
    },
    { 
      title: "Real-Time", 
      desc: "Instant verification results",
      icon: ClockIcon
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))] py-12">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(var(--color-primary), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(var(--color-success), 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(var(--color-primary), 0.05) 0%, transparent 50%)
          `
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div 
              className="p-4 rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-hover)))`,
                boxShadow: `0 10px 30px rgba(var(--color-primary), 0.3)`
              }}
            >
              <CubeTransparentIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">
            
            <span className="bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary-hover))] bg-clip-text text-transparent">
              Decentralized Document
            </span>
            <br />
            <span className="text-[rgb(var(--text-primary))]">Verification System</span>
          </h1>
          
          <p className="text-xl text-[rgb(var(--text-secondary))] max-w-3xl mx-auto leading-relaxed">
            A blockchain-based system where institutions can issue documents and third parties 
            can verify them without relying on centralized servers. Choose your role below:
          </p>
        </motion.div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {userTypes.map((userType, index) => (
            <motion.div
              key={userType.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card group"
            >
              {/* Header */}
              <div className="flex items-center mb-6">
                <div 
                  className="p-4 rounded-xl shadow-lg mr-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${userType.gradientFrom}, ${userType.gradientTo})`
                  }}
                >
                  <userType.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    {userType.title}
                  </h3>
                  <p className="text-[rgb(var(--text-secondary))]">
                    {userType.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">Key Features:</h4>
                <ul className="space-y-3">
                  {userType.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      className="flex items-center text-[rgb(var(--text-secondary))]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + featureIndex * 0.1 }}
                    >
                      <CheckCircleIcon className="w-5 h-5 text-[rgb(var(--color-success))] mr-3 flex-shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {userType.actions.map((action, actionIndex) => (
                  <Link
                    key={actionIndex}
                    to={action.path}
                    className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                      action.primary
                        ? 'text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                        : 'btn-secondary'
                    }`}
                    style={action.primary ? {
                      background: `linear-gradient(135deg, ${userType.gradientFrom}, ${userType.gradientTo})`,
                      boxShadow: `0 10px 20px rgba(var(--color-primary), 0.3)`
                    } : {}}
                  >
                    {action.label}
                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.2 }}
              >
                <div 
                  className="p-4 rounded-xl shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`
                  }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-[rgb(var(--text-secondary))]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-8">
            Why Choose Decentralized Verification?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                className="card-stats group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-lg bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))] mb-4 group-hover:scale-110 transition-transform duration-300">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-[rgb(var(--text-secondary))] text-sm">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-16 text-center"
        >
          <div 
            className="card p-8"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(var(--color-primary), 0.05) 0%, 
                  rgba(var(--surface-primary), 1) 50%, 
                  rgba(var(--color-success), 0.05) 100%
                )
              `
            }}
          >
            <h3 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-[rgb(var(--text-secondary))] mb-6 max-w-2xl mx-auto">
              Join the future of document verification. Whether you're an institution looking to issue 
              secure documents or a verifier ensuring authenticity, our platform has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard" className="btn-primary">
                View Dashboard
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/upload" className="btn-secondary">
                Start Verifying
                <ShieldCheckIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
