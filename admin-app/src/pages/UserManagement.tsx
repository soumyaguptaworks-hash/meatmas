import { useState } from 'react';
import { UserPlus, Search, Users, UserCheck, UserX, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const INITIAL_USERS = [
  { id: '1', name: 'Super Admin',     email: 'admin@meatmaster.com',   role: 'ADMIN',        appContext: 'ADMIN',   isActive: true },
  { id: '2', name: 'Factory Manager', email: 'factory@meatmaster.com', role: 'MANAGER',      appContext: 'FACTORY', isActive: true },
  { id: '3', name: 'POS Operator',    email: 'pos@meatmaster.com',     role: 'POS_OPERATOR', appContext: 'POS',     isActive: true },
];

const ROLE_STYLE: Record<string, string> = {
  ADMIN:        'bg-violet-100 text-violet-700',
  MANAGER:      'bg-blue-100 text-blue-700',
  STAFF:        'bg-gray-100 text-gray-600',
  POS_OPERATOR: 'bg-amber-100 text-amber-700',
};

const CONTEXT_STYLE: Record<string, string> = {
  ADMIN:   'bg-primary/10 text-[#d94040]',
  FACTORY: 'bg-emerald-100 text-emerald-700',
  POS:     'bg-orange-100 text-orange-700',
};

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-primary/10 text-[#d94040]',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

type User = typeof INITIAL_USERS[number];

interface AddUserForm {
  name: string; email: string; password: string;
  role: string; appContext: string;
}

const EMPTY_FORM: AddUserForm = { name: '', email: '', password: '', role: 'STAFF', appContext: 'ADMIN' };

export function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddUserForm>(EMPTY_FORM);
  const [showPw, setShowPw] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount   = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  function handleAddUser() {
    if (!form.name || !form.email) return;
    const newUser: User = {
      id: String(Date.now()),
      name: form.name,
      email: form.email,
      role: form.role,
      appContext: form.appContext,
      isActive: true,
    };
    setUsers((prev) => [...prev, newUser]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  }

  function toggleActive(id: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !u.isActive } : u));
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setShowModal(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users',    value: users.length,  icon: Users,      bg: 'bg-blue-50',    color: 'text-blue-500' },
          { label: 'Active',         value: activeCount,   icon: UserCheck,  bg: 'bg-emerald-50', color: 'text-emerald-500' },
          { label: 'Inactive',       value: inactiveCount, icon: UserX,      bg: 'bg-gray-50',    color: 'text-gray-400' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label} className="flex items-center gap-4 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-gray-700"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
            <option value="POS_OPERATOR">POS Operator</option>
          </select>
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">App</th>
              <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                {/* User column with avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0 ${getAvatarColor(user.name)}`}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 leading-none">{user.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_STYLE[user.role]}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CONTEXT_STYLE[user.appContext]}`}>
                    {user.appContext}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={user.isActive ? 'success' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="h-7 text-xs">Edit</Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-7 text-xs ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      onClick={() => toggleActive(user.id)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Users className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No users found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Add New User</h3>
                <p className="text-xs text-gray-400 mt-0.5">Create a new admin or operator account</p>
              </div>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Full Name</label>
                <input
                  type="text" placeholder="e.g. John Smith"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Email Address</label>
                <input
                  type="email" placeholder="e.g. john@meatmaster.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Role</label>
                  <select
                    value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 bg-white"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="STAFF">Staff</option>
                    <option value="POS_OPERATOR">POS Operator</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">App Context</label>
                  <select
                    value={form.appContext} onChange={(e) => setForm({ ...form, appContext: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 bg-white"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="FACTORY">Factory</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90 text-white">
                <UserPlus className="h-4 w-4 mr-1.5" /> Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
