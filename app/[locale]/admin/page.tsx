'use client';

import { Activity, TrendingUp, Users, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="pt-12 lg:pt-0">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Welcome back, {user?.displayName || 'Admin'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              12 starting this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">
              Compared to last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-heading text-base sm:text-lg font-bold">Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {[
                { name: 'John Doe', email: 'john@example.com', time: '2 min ago' },
                { name: 'Jane Smith', email: 'jane@example.com', time: '5 min ago' },
                { name: 'Bob Wilson', email: 'bob@example.com', time: '12 min ago' },
                { name: 'Alice Johnson', email: 'alice@example.com', time: '25 min ago' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {user.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="font-heading text-base sm:text-lg font-bold">System Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {[
                { name: 'API Server', status: 'Operational', color: 'bg-success' },
                { name: 'Database', status: 'Operational', color: 'bg-success' },
                { name: 'Authentication', status: 'Operational', color: 'bg-success' },
                { name: 'CDN', status: 'Operational', color: 'bg-success' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium text-sm sm:text-base">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${service.color}`} />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
