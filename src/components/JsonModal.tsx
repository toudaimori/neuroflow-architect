import React, { useState } from 'react';
import { X, Copy, Check, Code, FileJson, FileCode } from 'lucide-react';

type JsonModalProps = {
    isOpen: boolean;
    onClose: () => void;
    // App.tsxから渡されるデータの型定義
    data: {
        json: any;
        python: string;
    } | null;
};

export default function JsonModal({ isOpen, onClose, data }: JsonModalProps) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'json' | 'python'>('json');

    if (!isOpen || !data) return null;

    // タブに応じて表示するテキストを決定
    const contentString = activeTab === 'json'
        ? JSON.stringify(data.json, null, 2)
        : data.python;

    const handleCopy = () => {
        navigator.clipboard.writeText(contentString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Code size={20} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-100">Export Pipeline</h2>
                        </div>

                        {/* タブ切り替えボタン */}
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => setActiveTab('json')}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'json' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <FileJson size={14} /> JSON
                            </button>
                            <button
                                onClick={() => setActiveTab('python')}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'python' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <FileCode size={14} /> Python
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Code Block Area */}
                <div className="flex-1 overflow-auto bg-[#0d1117] p-4 font-mono text-sm custom-scrollbar relative">
                    {/* 言語によって色を少し変える演出 */}
                    <pre className={activeTab === 'python' ? "text-green-300/90 leading-relaxed" : "text-blue-100/90 leading-relaxed"}>
                        {contentString}
                    </pre>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 rounded-b-xl flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">
                        {activeTab === 'python' ? 'Python Script (LangChain)' : 'Pipeline Schema (JSON)'}
                    </span>
                    <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${copied
                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                            }`}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                </div>

            </div>
        </div>
    );
}