'use client';

import { useState } from 'react';
import { Loader2, Plus, Users } from 'lucide-react';

import { usersColumns } from '@/components/admin/users-columns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers } from '@/hooks/use-users';
import { Role, User } from '@/types';

// Mock data for demo purposes - replace with actual API call
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@5sport.com',
    displayName: 'System Admin',
    role: Role.ADMIN,
    tags: ['staff', 'management'],
    avatarUrl: '',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    role: Role.ORGANIZER,
    tags: ['football', 'basketball', 'premium'],
    avatarUrl: '',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    role: Role.USER,
    tags: ['tennis'],
    avatarUrl: '',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    email: 'bob.wilson@example.com',
    displayName: 'Bob Wilson',
    role: Role.USER,
    tags: ['swimming', 'running', 'cycling', 'triathlon'],
    avatarUrl: '',
    createdAt: '2024-03-25T16:45:00Z',
  },
  {
    id: '5',
    email: 'alice.johnson@example.com',
    displayName: 'Alice Johnson',
    role: Role.ORGANIZER,
    tags: ['yoga', 'wellness'],
    avatarUrl: '',
    createdAt: '2024-04-01T11:20:00Z',
  },
  {
    id: '6',
    email: 'charlie.brown@example.com',
    displayName: 'Charlie Brown',
    role: Role.USER,
    tags: [],
    avatarUrl: '',
    createdAt: '2024-04-15T08:00:00Z',
  },
];

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const { data, isLoading, error } = useUsers({ page: 1, limit: 100 });

  // Use API data if available, otherwise use mock data
  const users = data?.data || mockUsers;

  // Filter users by role
  const filteredUsers =
    roleFilter === 'all'
      ? users
      : users.filter((user) => user.role === roleFilter);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === Role.ADMIN).length,
    organizers: users.filter((u) => u.role === Role.ORGANIZER).length,
    users: users.filter((u) => u.role === Role.USER).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <div className="h-2 w-2 rounded-full bg-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizers</CardTitle>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.organizers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <div className="h-2 w-2 rounded-full bg-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                A list of all users in your application.
              </CardDescription>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                <SelectItem value={Role.ORGANIZER}>Organizer</SelectItem>
                <SelectItem value={Role.USER}>User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Failed to load users. Using demo data.
            </div>
          ) : (
            <DataTable
              columns={usersColumns}
              data={filteredUsers}
              searchKey="email"
              searchPlaceholder="Search by email..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
