'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: async () => {
            const { data } = await api.get('/dashboard/metrics');
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Empresas"
                    value={metrics?.companies ?? 0}
                    color="blue"
                />
                <MetricCard
                    title="Contactos"
                    value={metrics?.contacts ?? 0}
                    color="green"
                />
                <MetricCard
                    title="Cotizaciones"
                    value={metrics?.quotes ?? 0}
                    color="purple"
                />
                <MetricCard
                    title="Ingresos"
                    value={formatCurrency(metrics?.revenue ?? 0)}
                    color="amber"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Actividad Reciente
                </h2>
                <p className="text-gray-500 text-sm">
                    Las actividades recientes apareceran aqui.
                </p>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    color,
}: {
    title: string;
    value: string | number;
    color: 'blue' | 'green' | 'purple' | 'amber';
}) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
        amber: 'bg-amber-50 text-amber-700',
    };

    return (
        <div className={`rounded-xl p-6 ${colorMap[color]}`}>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
}
