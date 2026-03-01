import React from 'react';
import { Calendar, AlertCircle, ExternalLink } from 'lucide-react';

interface ExpiringItemCardProps {
    title: string;
    provider: string;
    expiryDate: string;
    daysRemaining: number;
    documentUrl?: string;
}

const ExpiringItemCard: React.FC<ExpiringItemCardProps> = ({
    title,
    provider,
    expiryDate,
    daysRemaining,
    documentUrl,
}) => {
    const isUrgent = daysRemaining <= 7;
    const isWarning = daysRemaining > 7 && daysRemaining <= 30;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`p-1.5 rounded-full ${isUrgent ? 'bg-red-50 text-red-600' : isWarning ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            <AlertCircle size={16} />
                        </span>
                        <h3 className="font-semibold text-gray-900 leading-tight">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 font-medium ml-8">{provider}</p>
                </div>
                {documentUrl && (
                    <a
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <ExternalLink size={18} />
                    </a>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-1.5 text-gray-400" />
                    <span>Expires {new Date(expiryDate).toLocaleDateString()}</span>
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isUrgent ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {daysRemaining} Days left
                </div>
            </div>
        </div>
    );
};

export default ExpiringItemCard;
