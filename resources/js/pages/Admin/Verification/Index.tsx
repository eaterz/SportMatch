import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { StatusBadge } from '@/components/Admin/StatusBadge';
import { DocumentIcon } from '@/components/Admin/DocumentIcon';
import { PaginationLink } from '@/components/Admin/PaginationLink';
import { Search, CheckCircle, Eye, User, RefreshCw } from 'lucide-react';

interface IndexProps {
    requests: {
        data: Array<{
            id: number;
            user: {
                id: number;
                name: string;
                lastname?: string;
                email: string;
                profile?: {
                    main_photo?: string;
                };
            };
            status: 'pending' | 'approved' | 'rejected' | 'expired';
            created_at: string;
            verification_code: string;
            selfie_photo: string;
            id_document_photo: string;
            selfie_with_id_photo?: string;
        }>;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    stats: {
        pending: number;
        approved?: number;
        rejected?: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ requests, stats, filters }: IndexProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'pending');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        router.get('/admin/verification', {
            search: searchTerm,
            status: statusFilter
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(requests.data.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const bulkApprove = () => {
        if (selectedIds.length === 0) return;

        if (confirm(`Apstiprināt ${selectedIds.length} verifikācijas?`)) {
            setLoading(true);
            router.post('/admin/verification/bulk-approve', {
                ids: selectedIds
            }, {
                onFinish: () => {
                    setLoading(false);
                    setSelectedIds([]);
                }
            });
        }
    };

    const handleRefresh = () => {
        router.reload({ only: ['requests', 'stats'] });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Verifikāciju saraksts - Admin" />

            <AdminHeader title="Verifikāciju pieprasījumi" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters and Actions Bar */}
                <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-3 items-center flex-1">
                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="pending">Gaida ({stats.pending || 0})</option>
                                <option value="approved">Apstiprināti</option>
                                <option value="rejected">Noraidīti</option>
                                <option value="">Visi</option>
                            </select>

                            {/* Search */}
                            <div className="flex flex-1 max-w-md">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Meklēt pēc vārda vai e-pasta..."
                                    className="flex-1 px-4 py-2.5 border border-r-0 border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2.5 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Atjaunināt"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Bulk Actions */}
                        {selectedIds.length > 0 && statusFilter === 'pending' && (
                            <button
                                onClick={bulkApprove}
                                disabled={loading}
                                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2 font-medium"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Apstiprināt izvēlētos ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                {statusFilter === 'pending' && (
                                    <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={toggleAll}
                                            checked={selectedIds.length === requests.data.length && requests.data.length > 0}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lietotājs
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kods
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Iesniegts
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statuss
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dokumenti
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Darbības
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {requests.data.length > 0 ? (
                                requests.data.map(request => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        {statusFilter === 'pending' && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(request.id)}
                                                    onChange={() => toggleSelection(request.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {request.user.profile?.main_photo ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={request.user.profile.main_photo}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.user.name} {request.user.lastname || ''}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-sm font-bold text-gray-700">
                                                    {request.verification_code}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(request.created_at).toLocaleDateString('lv-LV')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(request.created_at).toLocaleTimeString('lv-LV', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={request.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <DocumentIcon type="selfie" exists={!!request.selfie_photo} />
                                                <DocumentIcon type="id" exists={!!request.id_document_photo} />
                                                <DocumentIcon type="selfie_id" exists={!!request.selfie_with_id_photo} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/admin/verification/${request.id}`}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Skatīt
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={statusFilter === 'pending' ? 7 : 6} className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p>Nav atrasti rezultāti</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requests.last_page > 1 && (
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Rāda <span className="font-medium">{requests.from || 0}</span> līdz{' '}
                                <span className="font-medium">{requests.to || 0}</span> no{' '}
                                <span className="font-medium">{requests.total}</span> rezultātiem
                            </div>
                            <div className="flex gap-2">
                                {requests.links.map((link, index) => (
                                    <PaginationLink key={index} link={link} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
