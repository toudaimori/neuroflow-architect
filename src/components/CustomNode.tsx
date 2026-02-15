import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
// アイコンを大量追加
import {
    MessageSquare, FileText, Cpu, Split, Database, Send, Scissors, Mail, Box,
    Globe, Image as ImageIcon, Mic, Code, Workflow, HardDrive, Slack, Webhook
} from 'lucide-react';
import { useFlowStore } from '../store/useFlowStore';
import clsx from 'clsx';

// アイコンマッピングを拡張
const iconMap: Record<string, React.ElementType> = {
    MessageSquare, FileText, Cpu, Split, Database, Send, Scissors, Mail, Box,
    Globe, ImageIcon, Mic, Code, Workflow, HardDrive, Slack, Webhook
};

const CustomNode = ({ id, data }: NodeProps) => {
    // アイコンの取得（デフォルトはBox）
    const Icon = iconMap[data.icon as string] || Box;

    // ストアから現在の実行状態を取得
    const activeNodeId = useFlowStore((state) => state.activeNodeId);
    const isActive = activeNodeId === id;

    return (
        <div className={clsx(
            "w-64 shadow-xl rounded-lg border-2 bg-slate-800 transition-all duration-300",
            // アクティブなときは青く光らせる
            isActive ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-105" : "border-slate-700 hover:border-slate-500"
        )}>
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b border-slate-700 bg-slate-900/50 rounded-t-lg">
                <div className="p-1.5 rounded-md bg-slate-700 text-blue-400">
                    <Icon size={16} />
                </div>
                <span className="font-semibold text-sm text-slate-200">{data.label as string}</span>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Status</span>
                    {isActive ? (
                        <div className="flex items-center gap-2 text-blue-400">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                            <span className="text-xs font-medium">Processing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500">
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                            <span className="text-xs">Idle</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ハンドル（接続点） */}
            <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3 hover:!bg-blue-400" />
            <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-3 !h-3 hover:!scale-125 transition-transform" />
        </div>
    );
};

export default memo(CustomNode);