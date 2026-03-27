import React, { memo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { useDroppable } from '@dnd-kit/core';
import { Settings, X, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceNode = memo(({ data, selected }) => {
  return (
    <div className={`relative bg-docker-card border rounded-xl overflow-hidden min-w-[240px] shadow-lg transition-all
      ${selected ? 'border-docker-blue shadow-[0_0_20px_rgba(29,99,237,0.4)] scale-[1.02]' : 'border-docker-border hover:border-docker-blue/50 hover:scale-[1.01]'}`}>
      
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-docker-blue border-2 border-docker-card shadow-[0_0_8px_rgba(29,99,237,0.8)]" />
      
      <div className="p-3 border-b border-docker-border bg-[#151f32] flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
          style={{ backgroundColor: data.color }}
        >
          {data.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{data.name}</div>
          <div className="text-[9px] uppercase px-1.5 py-0.5 rounded font-medium inline-block mt-0.5"
            style={{ color: data.color, backgroundColor: `${data.color}22` }}>
            {data.category}
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <button onClick={() => data.onEdit && data.onEdit(data.id)} className="text-docker-muted hover:text-docker-blue">
            <Settings size={14} />
          </button>
          <button onClick={() => data.onDelete && data.onDelete(data.id)} className="text-docker-muted hover:text-red-500">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-3 text-xs">
        <div className="text-docker-muted mb-2 font-mono truncate">{data.image}</div>
        
        {data.ports && data.ports.length > 0 && (
          <div className="mb-2">
            <div className="text-[10px] text-docker-muted uppercase mb-1">Ports</div>
            <div className="flex flex-wrap gap-1">
              {data.ports.map((port, i) => (
                <span key={i} className="bg-[#1e293b] text-white px-1.5 py-0.5 rounded text-[10px] border border-[#334155] font-mono">
                  {port}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.networks && data.networks.length > 0 && (
          <div>
            <div className="text-[10px] text-docker-muted uppercase mb-1">Networks</div>
            <div className="flex flex-wrap gap-1">
              {data.networks.map((net, i) => (
                <span key={i} className="text-docker-muted text-[10px]">
                  #{net}{i < data.networks.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-docker-blue border-2 border-docker-card shadow-[0_0_8px_rgba(29,99,237,0.8)]" />
    </div>
  );
});

const nodeTypes = {
  serviceNode: ServiceNode,
};

export default function Canvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeSelect }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 h-full relative ${isOver ? 'bg-docker-surface/50' : ''}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="rgba(139, 156, 182, 0.2)" 
          className="bg-docker-bg"
        />
        <Controls 
          className="bg-docker-card border-docker-border fill-white text-white" 
          style={{ button: { backgroundColor: '#111827', borderBottom: '1px solid #1f2937', color: 'white' } }} 
        />
        <MiniMap 
          className="bg-docker-card border border-docker-border rounded-lg"
          maskColor="rgba(10, 15, 30, 0.7)"
          nodeColor={(node) => node.data?.color || '#1D63ED'}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-8 bg-docker-card/60 backdrop-blur-md rounded-2xl border border-docker-border/50 shadow-2xl"
          >
            <div className="w-20 h-20 bg-docker-blue/10 rounded-full flex items-center justify-center mb-4 text-4xl shadow-[0_0_20px_rgba(29,99,237,0.2)]">
              📦
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Canvas is empty</h3>
            <p className="text-sm text-docker-muted max-w-xs text-center">
              Drag a service from the sidebar on the left, or browse templates to get started quickly.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
