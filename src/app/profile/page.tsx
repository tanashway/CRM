import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h2 className="text-xl font-semibold mb-1">User Name</h2>
                <p className="text-muted-foreground mb-4">user@example.com</p>
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a placeholder for account settings. In a complete implementation, this would allow users to update their profile information, change password, and manage notification preferences.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a placeholder for subscription information. In a complete implementation, this would display the current subscription plan and allow users to upgrade or manage their subscription.
              </p>
              <Button variant="default" size="sm">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 