import React, { useState, useCallback, useRef } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import ReactFlow, { 
  addEdge, 
  useNodesState, 
  useEdgesState,
} from 'reactflow';
import { Package, Download, Play, Rocket, Share2, Save, Settings } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Canvas from '../components/Canvas';
import ConfigPanel from '../components/ConfigPanel';
import ExportModal from '../components/ExportModal';
import { SERVICES } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [activeDragService, setActiveDragService] = useState(null);
  const [projectName, setProjectName] = useState('My Project');

  const onConnect = useCallback((params) => 
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#1D63ED', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onDragStart = (event) => {
    const { active } = event;
    const service = active.data.current?.service;
    if (service) setActiveDragService(service);
  };

  const onDragEnd = (event) => {
    setActiveDragService(null);
    const { over, active } = event;
    
    if (over && over.id === 'canvas-drop') {
      const service = active.data.current?.service;
      if (!service) return;

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'serviceNode',
        position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
        data: { 
          ...service,
          onEdit: (id) => setSelectedNodeId(id),
          onDelete: (id) => {
            setNodes((nds) => nds.filter((n) => n.id !== id));
            setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
            if (selectedNodeId === id) setSelectedNodeId(null);
            toast.success(`${service.name} removed`);
          }
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`${service.name} added to canvas`);
    }
  };

  const onNodeUpdate = useCallback((id, updatedData) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, ...updatedData } };
      }
      return n;
    }));
  }, [setNodes]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen bg-docker-bg overflow-hidden text-white font-sans">
      {/* TopBar */}
      <div className="h-[56px] bg-docker-surface border-b border-docker-border px-4 flex items-center justify-between z-20 shadow-sm relative">
        <div className="flex items-center gap-2">
          <Package className="text-docker-blue" size={24} />
          <Link to="/" className="font-bold text-xl tracking-tight flex">
            <span className="text-white">Container</span>
            <span className="gradient-text ml-0.5">Craft</span>
          </Link>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border border-transparent hover:border-docker-border focus:border-docker-blue focus:bg-docker-card rounded px-3 py-1 text-center font-medium focus:outline-none transition-all w-48 text-gray-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/templates"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-docker-muted hover:text-white border border-docker-border bg-docker-card rounded-md transition-colors"
          >
            Templates
          </Link>
          
          <button 
            onClick={() => toast.success("Validation passed!")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-success hover:bg-success/10 border border-success/30 rounded-md transition-colors"
          >
            <Play size={16} /> Validate
          </button>
          
          <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-docker-blue hover:text-white border border-docker-blue bg-docker-card rounded-md transition-colors hover:shadow-[0_0_10px_rgba(29,99,237,0.3)]"
          >
            <Download size={16} /> Export
          </button>
          
          <button 
            onClick={() => toast('Deploying stack...', { icon: '🚀' })}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-docker-blue hover:bg-blue-600 text-white rounded-md transition-colors glow-border hover:scale-[1.02]"
          >
            <Rocket size={16} /> Deploy
          </button>

          <div className="w-px h-6 bg-docker-border mx-1"></div>
          
          <button className="p-1.5 text-docker-muted hover:text-white rounded transition-colors"><Share2 size={18} /></button>
          <button className="p-1.5 text-docker-muted hover:text-white rounded transition-colors"><Save size={18} /></button>
          <button className="p-1.5 text-docker-muted hover:text-white rounded transition-colors"><Settings size={18} /></button>
        </div>
      </div>

      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar />
          
          <Canvas 
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeSelect={(id) => setSelectedNodeId(Number(id) === id ? id.toString() : id)}
            selectedNodeId={selectedNodeId}
          />

          <AnimatePresence>
            {selectedNodeId && (
              <ConfigPanel 
                key="config-panel"
                selectedNode={selectedNode} 
                onUpdate={onNodeUpdate} 
                onClose={() => setSelectedNodeId(null)} 
              />
            )}
          </AnimatePresence>
        </div>

        <DragOverlay>
          {activeDragService ? (
            <div className="p-3 bg-docker-card border border-docker-blue rounded-xl opacity-90 shadow-2xl scale-105 flex items-center gap-3 min-w-[200px]">
               <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: activeDragService.color }}
                >
                  {activeDragService.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-white font-medium pr-2">{activeDragService.name}</h4>
                  <p className="text-xs text-docker-muted">{activeDragService.category}</p>
                </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
