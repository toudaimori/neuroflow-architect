import React from 'react';
import { useFlowStore } from '../store/useFlowStore';
import { X, Settings2, Save } from 'lucide-react';

export default function ConfigPanel() {
    const { selectedNodeId, nodes, setSelectedNodeId, updateNodeData } = useFlowStore();

    // 選択中のノードを探す
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    if (!selectedNode) {
        return (
            <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-slate-500 gap-4">
                <Settings2 size={48} className="opacity-20" />
                <p className="text-sm">Select a node to configure</p>
            </div>
        );
    }

    // ノードデータ（安全にアクセス）
    const { label, type, config = {} } = selectedNode.data as any;

    // 入力変更ハンドラ
    const handleChange = (key: string, value: any) => {
        updateNodeData(selectedNode.id, {
            config: { ...config, [key]: value }
        });
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateNodeData(selectedNode.id, { label: e.target.value });
    };

    return (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-20">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                <h2 className="font-bold text-slate-200 flex items-center gap-2">
                    <Settings2 size={18} className="text-blue-400" />
                    Configuration
                </h2>
                <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

                {/* Common Settings */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Node Name</label>
                    <input
                        type="text"
                        value={label}
                        onChange={handleLabelChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <hr className="border-slate-800" />

                {/* Specific Settings based on Type */}

                {/* LLM Settings */}
                {type === 'processing' && label.includes('LLM') && (
                    <>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase">Model</label>
                            <select
                                value={config.model || 'gpt-4'}
                                onChange={(e) => handleChange('model', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                            >
                                <option value="gpt-4">GPT-4 Turbo</option>
                                <option value="gpt-3.5">GPT-3.5 Turbo</option>
                                <option value="claude-3">Claude 3 Opus</option>
                                <option value="local-llama">Local Llama 3</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                                Temperature ({config.temperature || 0.7})
                            </label>
                            <input
                                type="range"
                                min="0" max="1" step="0.1"
                                value={config.temperature || 0.7}
                                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase">System Prompt</label>
                            <textarea
                                rows={4}
                                value={config.systemPrompt || ''}
                                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                                placeholder="You are a helpful assistant..."
                                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>
                    </>
                )}

                {/* Vector DB Settings */}
                {type === 'data' && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Index Name</label>
                        <input
                            type="text"
                            value={config.index || ''}
                            onChange={(e) => handleChange('index', e.target.value)}
                            placeholder="my-knowledge-base"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                )}

                {/* Default / Other */}
                {!label.includes('LLM') && type !== 'data' && (
                    <div className="p-4 bg-slate-800/50 rounded border border-slate-800 text-xs text-slate-500 text-center italic">
                        No advanced settings available for this node type.
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium transition-colors">
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </div>
    );
}