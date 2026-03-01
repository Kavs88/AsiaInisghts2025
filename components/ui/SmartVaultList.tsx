import React from 'react';
import { FileText, Search, Plus, Filter } from 'lucide-react';
import ExpiringItemCard from './ExpiringItemCard';

interface Document {
    id: string;
    name: string;
    provider: string;
    expiryDate: string;
    daysRemaining: number;
}

interface SmartVaultListProps {
    documents: Document[];
    onUploadClick?: () => void;
}

const SmartVaultList: React.FC<SmartVaultListProps> = ({ documents, onUploadClick }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#002060]">Smart Vault</h2>
                    <p className="text-gray-500 text-sm">AI-powered document management</p>
                </div>
                <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 bg-[#002060] text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition-all font-medium shadow-sm"
                >
                    <Plus size={20} />
                    <span>Upload New</span>
                </button>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                </div>
                <button className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                    <Filter size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                    <ExpiringItemCard
                        key={doc.id}
                        title={doc.name}
                        provider={doc.provider}
                        expiryDate={doc.expiryDate}
                        daysRemaining={doc.daysRemaining}
                    />
                ))}
                {documents.length === 0 && (
                    <div className="col-span-full py-12 flex flex-center flex-col items-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <FileText size={48} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No documents found</p>
                        <button className="text-blue-600 text-sm font-semibold mt-2 hover:underline">
                            Start by uploading your first contract
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartVaultList;
