import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Upload, 
  Search, 
  Users, 
  FileCheck, 
  Building,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Types
type UserType = 'individual' | 'organization' | 'verifier';

interface UserTypeOption {
  id: UserType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  primaryAction: string;
  route: string;
  color: string;
}

const UserTypeSelection: React.FC = () => {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const navigate = useNavigate();

  const userTypes: UserTypeOption[] = [
    {
      id: 'individual',
      title: 'Individual User',
      description: 'Personal document verification and management',
      icon: Shield,
      features: [
        'Upload personal documents',
        'Verify document authenticity',
        'Track verification status',
        'Generate QR codes'
      ],
      primaryAction: 'Get Started',
      route: '/dashboard',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'Enterprise document management and issuance',
      icon: Building,
      features: [
        'Issue verified documents',
        'Bulk document processing',
        'Organization dashboard',
        'Advanced analytics'
      ],
      primaryAction: 'Setup Organization',
      route: '/issue-document',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'verifier',
      title: 'Third-Party Verifier',
      description: 'Verify documents without platform registration',
      icon: FileCheck,
      features: [
        'Instant verification',
        'No account required',
        'Hash-based verification',
        'QR code scanning'
      ],
      primaryAction: 'Start Verifying',
      route: '/third-party-verify',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const handleContinue = (userType: UserTypeOption): void => {
    // Store user type preference
    localStorage.setItem('user_type_preference', userType.id);
    navigate(userType.route);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Shield className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl font-bold mb-4">Welcome to DocVerify</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose your role to get started with our secure blockchain-based document verification platform
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {userTypes.map((userType, index) => (
            <motion.div
              key={userType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className={`h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
                  selectedType === userType.id 
                    ? 'border-primary shadow-lg' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedType(userType.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    selectedType === userType.id 
                      ? 'bg-primary/20' 
                      : 'bg-muted'
                  }`}>
                    <userType.icon className={`w-8 h-8 ${
                      selectedType === userType.id 
                        ? 'text-primary' 
                        : userType.color
                    }`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{userType.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {userType.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {userType.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContinue(userType);
                    }}
                    className="w-full"
                    variant={selectedType === userType.id ? "default" : "outline"}
                  >
                    {userType.primaryAction}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-muted/50 rounded-xl p-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/verify')}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Quick Verify</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/upload')}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>View Dashboard</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold mb-8">Why Choose DocVerify?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Secure', desc: 'Blockchain-based security' },
              { icon: CheckCircle, title: 'Verified', desc: 'Cryptographic proof' },
              { icon: Search, title: 'Transparent', desc: 'Open verification' },
              { icon: Users, title: 'Trusted', desc: 'Enterprise-grade' }
            ].map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;
