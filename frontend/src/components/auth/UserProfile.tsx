import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { siweService } from '../../services/siweService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Wallet, User, Calendar } from 'lucide-react';
import HashDisplay from '../common/HashDisplay'; // Assuming this path is correct
import { Badge } from '@/components/ui/badge';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await siweService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  if (!user) return null;

  const getAvatarFallback = () => {
    const displayName = user.ensName || user.address;
    return displayName ? displayName.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getAvatarFallback()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {user.ensName || 'Welcome!'}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="font-medium text-muted-foreground">Address:</span>
            <HashDisplay hash={user.address} variant="compact" size="sm" />
          </div>
          
          {user.ensName && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium text-muted-foreground">ENS:</span>
              <span className="font-medium text-foreground">{user.ensName}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium text-muted-foreground">Last Login:</span>
            <span className="text-foreground">
              {new Date(user.lastLoginAt).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleLogout} variant="destructive" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;