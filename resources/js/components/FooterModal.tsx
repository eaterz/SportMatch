import React, { JSX } from 'react';
import { X } from 'lucide-react';

interface FooterModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const FooterModal: React.FC<FooterModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;


    const formatContent = (text: string) => {
        const lines = text.trim().split('\n');
        const elements: JSX.Element[] = [];
        let key = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('## ')) {
                elements.push(
                    <h2 key={key++} className="text-2xl font-bold text-gray-900 mb-4 mt-6">
                        {line.replace('## ', '')}
                    </h2>
                );
            } else if (line.startsWith('### ')) {
                elements.push(
                    <h3 key={key++} className="text-lg font-semibold text-gray-800 mb-3 mt-5">
                        {line.replace('### ', '')}
                    </h3>
                );
            } else if (line.startsWith('- **') && line.includes('**')) {
                const match = line.match(/- \*\*(.*?)\*\*(.*)/);
                if (match) {
                    elements.push(
                        <li key={key++} className="mb-2">
                            <strong className="text-gray-900">{match[1]}</strong>
                            <span className="text-gray-700">{match[2]}</span>
                        </li>
                    );
                }
            } else if (line.startsWith('- ')) {
                elements.push(
                    <li key={key++} className="text-gray-700 mb-1">
                        {line.replace('- ', '')}
                    </li>
                );
            } else if (line.startsWith('**') && line.endsWith('**')) {
                elements.push(
                    <p key={key++} className="font-semibold text-gray-900 mb-2">
                        {line.replace(/\*\*/g, '')}
                    </p>
                );
            } else if (line.trim() === '') {
                elements.push(<div key={key++} className="mb-2"></div>);
            } else if (line.trim() !== '') {
                elements.push(
                    <p key={key++} className="text-gray-700 mb-3 leading-relaxed">
                        {line}
                    </p>
                );
            }
        }

        return elements;
    };

    return (
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="prose prose-lg max-w-none">
                        {formatContent(content)}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FooterModal;
