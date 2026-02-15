import { create } from 'zustand';
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    type Connection,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
} from '@xyflow/react';

type FlowState = {
    nodes: Node[];
    edges: Edge[];
    activeNodeId: string | null;
    selectedNodeId: string | null; // 追加: 選択中のノードID
    isRunning: boolean;

    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    setActiveNodeId: (id: string | null) => void;
    setSelectedNodeId: (id: string | null) => void; // 追加
    updateNodeData: (id: string, data: any) => void; // 追加: データ更新用
    setIsRunning: (isRunning: boolean) => void;
    loadDemo: () => void;
};

// 初期デモデータ
const demoNodes: Node[] = [
    { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'User Input', type: 'trigger', icon: 'MessageSquare', config: {} } },
    { id: '2', type: 'custom', position: { x: 400, y: 100 }, data: { label: 'Text Splitter', type: 'processing', icon: 'Scissors', config: { chunkSize: 1000 } } },
    { id: '3', type: 'custom', position: { x: 700, y: 100 }, data: { label: 'Vector DB', type: 'data', icon: 'Database', config: { index: 'main-index' } } },
    { id: '4', type: 'custom', position: { x: 700, y: 300 }, data: { label: 'LLM (GPT-4)', type: 'processing', icon: 'Cpu', config: { model: 'gpt-4', temperature: 0.7 } } },
    { id: '5', type: 'custom', position: { x: 1000, y: 300 }, data: { label: 'Output Response', type: 'action', icon: 'Send', config: {} } },
];

const demoEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true },
    { id: 'e4-5', source: '4', target: '5', animated: true },
];

export const useFlowStore = create<FlowState>((set, get) => ({
    nodes: [],
    edges: [],
    activeNodeId: null,
    selectedNodeId: null, // 初期値
    isRunning: false,

    onNodesChange: (changes: NodeChange[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
    },
    onConnect: (connection: Connection) => {
        set({ edges: addEdge({ ...connection, animated: true }, get().edges) });
    },
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    addNode: (node) => set({ nodes: [...get().nodes, node] }),

    setActiveNodeId: (id) => set({ activeNodeId: id }),
    setSelectedNodeId: (id) => set({ selectedNodeId: id }), // 実装

    // 指定したノードのdataを更新する
    updateNodeData: (id, newData) => {
        set({
            nodes: get().nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            ),
        });
    },

    setIsRunning: (isRunning) => set({ isRunning }),

    loadDemo: () => {
        set({ nodes: demoNodes, edges: demoEdges });
    }
}));