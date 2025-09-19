import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Users, Shield, UserCheck, Clock,
    Search, Filter, MoreVertical, Crown
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    lastname?: string;
    profile?: {
        main_photo?: string;
        location?: string;
    };
    pivot?: {
        role: string;
        joined_at: string;
    };
}

interface Group {
    id: number;
    name: string;
    creator_id: number;
}

interface Props {
    user: User;
    group: Group;
    members: User[];
    pendingMembers: User[];
    is_admin: boolean;
}

export default function GroupMembers({ user, group, members, pendingMembers, is_admin }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [selectedMember, setSelectedMember] = useState<number | null>(null);

    const filteredMembers = members.filter(member => {
        const matchesSearch = `${member.name} ${member.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || member.pivot?.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const formatJoinDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('lv-LV', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getRoleBadge = (role: string, userId: number) => {
        if (userId === group.creator_id) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    <Crown className="w-3 h-3" />
                    Izveidotājs
                </span>
            );
        }

        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        <Shield className="w-3 h-3" />
                        Administrators
                    </span>
                );
            case 'moderator':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <UserCheck className="w-3 h-3" />
                        Moderators
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        <Users className="w-3 h-3" />
                        Dalībnieks
                    </span>
                );
        }
    };

    const approveMember = (memberId: number) => {
        router.post(`/groups/${group.id}/members/${memberId}/approve`, {}, {
            preserveScroll: true,
        });
    };

    const removeMember = (memberId: number, memberName: string) => {
        if (confirm(`Vai tiešām vēlaties noņemt ${memberName} no grupas?`)) {
            router.delete(`/groups/${group.id}/members/${memberId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Dalībnieki - ${group.name} - SportMatch`} />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('groups.show', group.id)}
                            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-6 h-6" />
                                Dalībnieki
                            </h1>
                            <p className="text-gray-600">{group.name}</p>
                        </div>
                    </div>

                </div>

                {/* Pending Members (Admin only) */}
                {is_admin && pendingMembers.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                        <h2 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Gaidošie dalībnieki ({pendingMembers.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingMembers.map(member => (
                                <div key={member.id} className="bg-white border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                            {member.profile?.main_photo ? (
                                                <img
                                                    src={member.profile.main_photo}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {member.name} {member.lastname}
                                            </p>
                                            {member.profile?.location && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {member.profile.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => approveMember(member.id)}
                                            className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                        >
                                            Apstiprināt
                                        </button>
                                        <button
                                            onClick={() => removeMember(member.id, `${member.name} ${member.lastname || ''}`)}
                                            className="flex-1 px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
                                        >
                                            Noraidīt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Meklēt dalībniekus..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            >
                                <option value="all">Visi</option>
                                <option value="admin">Administratori</option>
                                <option value="moderator">Moderatori</option>
                                <option value="member">Dalībnieki</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Members List */}
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">
                            Apstiprinātie dalībnieki ({filteredMembers.length})
                        </h2>
                    </div>

                    {filteredMembers.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {filteredMembers.map(member => (
                                <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                {member.profile?.main_photo ? (
                                                    <img
                                                        src={member.profile.main_photo}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium text-lg">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        {member.name} {member.lastname}
                                                    </h3>
                                                    {getRoleBadge(member.pivot?.role || 'member', member.id)}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    {member.profile?.location && (
                                                        <span>{member.profile.location}</span>
                                                    )}
                                                    {member.pivot?.joined_at && (
                                                        <span>Pievienojās {formatJoinDate(member.pivot.joined_at)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions for admin */}
                                        {is_admin && member.id !== group.creator_id && member.id !== user.id && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {selectedMember === member.id && (
                                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => {
                                                                    removeMember(member.id, `${member.name} ${member.lastname || ''}`);
                                                                    setSelectedMember(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                Noņemt no grupas
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nav atrasti dalībnieki</h3>
                            <p className="text-gray-500">
                                {searchTerm || filterRole !== 'all'
                                    ? 'Izmēģiniet citus meklēšanas kritērijus'
                                    : 'Grupa ir tukša'
                                }
                            </p>
                        </div>
                    )}
                </div>

            {/* Click outside to close dropdown */}
            {selectedMember && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setSelectedMember(null)}
                />
            )}
        </div>
        </div>
    );
}
