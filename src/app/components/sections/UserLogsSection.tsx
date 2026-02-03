import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    FileText,
    RefreshCw,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import {
    getUserLogs,
    getUniqueActions,
    type UserLog,
} from '../../../../src/services/userLogs.service';

export function UserLogsSection() {
    const [logs, setLogs] = useState<UserLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [uniqueActions, setUniqueActions] = useState<string[]>([]);

    // Filters
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchUsername, setSearchUsername] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const logsPerPage = 10;

    // Expanded log details
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    // Fetch logs
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await getUserLogs({
                action: selectedAction || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page: currentPage,
                limit: logsPerPage,
            });

            let filteredLogs = response.logs;

            // Client-side username filtering
            if (searchUsername) {
                filteredLogs = filteredLogs.filter((log: UserLog) =>
                    log.username.toLowerCase().includes(searchUsername.toLowerCase())
                );
            }

            setLogs(filteredLogs);
            setTotalPages(response.pagination.pages);
            setTotalLogs(response.pagination.total);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to fetch user logs');
        } finally {
            setLoading(false);
        }
    };

    // Fetch unique actions for filter
    const fetchUniqueActions = async () => {
        try {
            const actions = await getUniqueActions();
            setUniqueActions(actions);
        } catch (error) {
            console.error('Error fetching unique actions:', error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchLogs();
        fetchUniqueActions();
    }, []);

    // Refetch when filters or page change
    useEffect(() => {
        fetchLogs();
    }, [selectedAction, startDate, endDate, currentPage, searchUsername]);

    // Handle refresh
    const handleRefresh = () => {
        fetchLogs();
        toast.success('Logs refreshed');
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSelectedAction('');
        setStartDate('');
        setEndDate('');
        setSearchUsername('');
        setCurrentPage(1);
        toast.success('Filters reset');
    };

    // Handle export
    const handleExport = () => {
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Logs exported successfully');
    };

    // Get action color
    const getActionColor = (action: string) => {
        if (action.startsWith('CREATE')) return 'text-green-700 bg-green-50';
        if (action.startsWith('UPDATE')) return 'text-blue-700 bg-blue-50';
        if (action.startsWith('DELETE')) return 'text-red-700 bg-red-50';
        if (action.includes('APPROVE') || action.includes('REJECT'))
            return 'text-purple-700 bg-purple-50';
        return 'text-gray-700 bg-gray-50';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">User Activity Logs</h2>
                </div>
                <div className="text-sm text-gray-600">
                    Total: <span className="font-semibold">{totalLogs}</span> logs
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Action Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Action Type
                        </label>
                        <select
                            value={selectedAction}
                            onChange={(e) => {
                                setSelectedAction(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Username Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchUsername}
                                onChange={(e) => {
                                    setSearchUsername(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search by username..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                    >
                        <X className="w-4 h-4" />
                        Reset Filters
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={logs.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" />
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No logs found</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Try adjusting your filters or perform some actions to generate logs
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timestamp
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.map((log) => (
                                        <tr
                                            key={log._id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-red-800">
                                                    {log.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                                                        log.action
                                                    )}`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {expandedLog === log._id ? (
                                                    <div className="space-y-2">
                                                        <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto max-w-md">
                                                            {JSON.stringify(log.details, null, 2)}
                                                        </pre>
                                                        <button
                                                            onClick={() => setExpandedLog(null)}
                                                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                        >
                                                            Hide Details
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setExpandedLog(log._id)}
                                                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                                    >
                                                        View Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                                <span className="font-medium">{totalPages}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                    }
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
