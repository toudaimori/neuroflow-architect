import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from './store/useFlowStore';
import CustomNode from './components/CustomNode';
import ConfigPanel from './components/ConfigPanel';
import {
  Play, LayoutTemplate, MessageSquare, Cpu, Database, Scissors, Mail,
  Globe, Image as ImageIcon, Mic,
  Code as CodeIcon,
  Workflow, HardDrive, Slack, Webhook
} from 'lucide-react';
import JsonModal from './components/JsonModal';
import { generatePipelineConfig, generatePythonCode } from './utils/flowTransformer';

// カスタムノードの登録
const nodeTypes = { custom: CustomNode };

// --- サイドバーコンポーネント ---
const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, icon: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label, icon }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const DraggableItem = ({ label, icon: Icon, type }: { label: string, icon: any, type: string }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type, label, (Icon as any).displayName || Icon.name)}
      className="flex items-center gap-3 p-3 bg-slate-800 rounded border border-slate-700 cursor-grab hover:border-blue-500 transition-colors active:cursor-grabbing group"
    >
      <Icon size={16} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
      <span className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</span>
    </div>
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-xl shrink-0 h-full overflow-hidden">
      {/* --- ヘッダー（固定） --- */}
      <div className="p-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            NeuroFlow
          </h1>
        </div>
      </div>

      {/* --- スクロールエリア（可変） --- */}
      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-6 custom-scrollbar">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Triggers</h3>
          <div className="space-y-2">
            <DraggableItem label="Chat Input" icon={MessageSquare} type="trigger" />
            <DraggableItem label="Webhook" icon={Webhook} type="trigger" />
            <DraggableItem label="File Upload" icon={HardDrive} type="trigger" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Processing</h3>
          <div className="space-y-2">
            <DraggableItem label="LLM Node" icon={Cpu} type="processing" />
            <DraggableItem label="Text Splitter" icon={Scissors} type="processing" />
            <DraggableItem label="Web Scraper" icon={Globe} type="processing" />
            <DraggableItem label="Image Gen" icon={ImageIcon} type="processing" />
            <DraggableItem label="Transcribe" icon={Mic} type="processing" />
            <DraggableItem label="Code Interpreter" icon={CodeIcon} type="processing" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Data & Logic</h3>
          <div className="space-y-2">
            <DraggableItem label="Vector DB" icon={Database} type="data" />
            <DraggableItem label="Router (If/Else)" icon={Workflow} type="logic" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Actions</h3>
          <div className="space-y-2">
            <DraggableItem label="Send Email" icon={Mail} type="action" />
            <DraggableItem label="Slack Notify" icon={Slack} type="action" />
          </div>
        </div>
      </div>

      {/* --- フッター（固定） --- */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-600 text-center shrink-0 bg-slate-900">
        Drag nodes to canvas
      </div>
    </aside>
  );
};

// --- メインキャンバス ---
const FlowCanvas = () => {
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    addNode, loadDemo, setActiveNodeId, setIsRunning, isRunning,
    setSelectedNodeId
  } = useFlowStore();

  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // モーダル用State
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

  // ドロップ時の処理
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const dataString = event.dataTransfer.getData('application/reactflow');

      if (!dataString) return;

      const data = JSON.parse(dataString);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: crypto.randomUUID(),
        type: 'custom',
        position,
        data: { label: data.label, type: data.type, icon: data.icon },
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // Exportボタンの処理
  const handleExport = () => {
    setExportData({
      json: generatePipelineConfig(nodes, edges),
      python: generatePythonCode(nodes, edges)
    });
    setShowJsonModal(true);
  };

  // --- シミュレーション実行ロジック (Logger呼び出しを削除) ---
  const runSimulation = async () => {
    if (nodes.length === 0) return;
    setIsRunning(true);

    const startNode = nodes.find(n => n.data.type === 'trigger') || nodes[0];
    if (!startNode) {
      setIsRunning(false);
      return;
    }

    const traverse = async (nodeId: string) => {
      setActiveNodeId(nodeId);

      // 処理中のふり (1.5秒待機)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const outgoingEdges = edges.filter(e => e.source === nodeId);

      setActiveNodeId(null);

      if (outgoingEdges.length > 0) {
        // エッジのアニメーション待ち
        await new Promise(resolve => setTimeout(resolve, 300));
        await Promise.all(outgoingEdges.map(edge => traverse(edge.target)));
      }
    };

    await traverse(startNode.id);
    setIsRunning(false);
  };

  return (
    <div className="flex-1 h-full relative flex flex-row overflow-hidden" ref={reactFlowWrapper}>
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          className="bg-slate-950"
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls className="bg-slate-800 border-slate-700 fill-slate-200" />

          <Panel position="top-right" className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 border border-slate-700 text-sm font-medium transition-colors shadow-lg cursor-pointer"
            >
              <CodeIcon size={16} className="text-blue-400" /> Code
            </button>

            <button
              onClick={loadDemo}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 border border-slate-700 text-sm font-medium transition-colors shadow-lg cursor-pointer"
            >
              <LayoutTemplate size={16} /> Load Demo
            </button>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all border border-transparent ${isRunning
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-blue-500/20 cursor-pointer'
                }`}
            >
              {isRunning ? 'Running...' : (
                <>
                  <Play size={16} fill="currentColor" /> Run Flow
                </>
              )}
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <ConfigPanel />

      <JsonModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        data={exportData}
      />
    </div>
  );
};

// --- アプリケーション全体 ---
export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
        <Sidebar />
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}