import React from 'react';
import { withPermissionCheck } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Shield, 
  Settings, 
  Database, 
  BarChart3, 
  Bell
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application settings, users, and content
        </p>
      </header>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="system" className="hidden lg:flex">System</TabsTrigger>
          <TabsTrigger value="analytics" className="hidden lg:flex">Analytics</TabsTrigger>
          <TabsTrigger value="notifications" className="hidden lg:flex">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,259</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Generated Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,732</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">83</div>
                <p className="text-xs text-muted-foreground">+2% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Operational</div>
                <p className="text-xs text-muted-foreground">All systems running</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The latest user and system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-muted-foreground">User <b>john.doe</b> generated a new document</span>
                    <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-muted-foreground">New user <b>sarah.smith</b> registered</span>
                    <span className="text-xs text-muted-foreground ml-auto">15m ago</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-sm text-muted-foreground">System backup completed</span>
                    <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-muted-foreground">User <b>david.wilson</b> updated their profile</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm text-muted-foreground">API rate limit exceeded for OpenAI service</span>
                    <span className="text-xs text-muted-foreground ml-auto">3h ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Database Storage</span>
                      <span className="text-sm text-muted-foreground">68%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">API Quota (OpenAI)</span>
                      <span className="text-sm text-muted-foreground">42%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">API Quota (Claude)</span>
                      <span className="text-sm text-muted-foreground">89%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-destructive" style={{ width: '89%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">Server CPU</span>
                      <span className="text-sm text-muted-foreground">32%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex mb-4">
                <Button variant="outline" size="sm" className="ml-auto">Add User</Button>
              </div>
              <div className="text-muted-foreground text-center p-8">
                User management interface will be implemented soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage document templates and legal knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center p-8">
                Content management interface will be implemented soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center p-8">
                Role management interface will be implemented soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system preferences and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center p-8">
                System settings interface will be implemented soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>View system usage and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center p-8">
                Analytics dashboard will be implemented soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>Configure and view system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-center p-8">
                Notifications management will be implemented soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Export with permission check
export default withPermissionCheck(AdminDashboard, 'canAccessAdminPanel');