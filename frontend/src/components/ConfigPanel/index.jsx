import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';

const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-docker-border/50">
      <button 
        className="w-full flex items-center justify-between p-4 text-xs uppercase tracking-widest text-docker-muted hover:text-white transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ConfigPanel({ selectedNode, onUpdate, onClose }) {
  if (!selectedNode) return null;

  const data = selectedNode.data || {};
  
  const updateField = (field, value) => {
    onUpdate(selectedNode.id, { ...data, [field]: value });
  };

  const handleArrayChange = (field, index, value) => {
    const arr = [...(data[field] || [])];
    arr[index] = value;
    updateField(field, arr);
  };

  const addArrayItem = (field, defaultValue = '') => {
    const arr = [...(data[field] || []), defaultValue];
    updateField(field, arr);
  };

  const removeArrayItem = (field, index) => {
    const arr = [...(data[field] || [])];
    arr.splice(index, 1);
    updateField(field, arr);
  };

  // Environment variables are stored as object but edited as key=value pair for simplicity
  const envEntries = Object.entries(data.environment || {});
  
  const updateEnvKey = (oldKey, newKey, value) => {
    const newEnv = { ...data.environment };
    delete newEnv[oldKey];
    if (newKey) newEnv[newKey] = value;
    updateField('environment', newEnv);
  };
  
  const updateEnvValue = (key, newValue) => {
    updateField('environment', { ...(data.environment || {}), [key]: newValue });
  };

  const addEnvVar = () => {
    updateField('environment', { ...(data.environment || {}), [`VAR_${Date.now()}`]: 'value' });
  };

  const removeEnvVar = (key) => {
    const newEnv = { ...data.environment };
    delete newEnv[key];
    updateField('environment', newEnv);
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-[56px] bottom-0 w-[320px] bg-docker-surface border-l border-docker-border z-40 overflow-y-auto custom-scrollbar shadow-2xl flex flex-col"
    >
      <div className="p-4 border-b border-docker-border flex items-center justify-between sticky top-0 bg-docker-surface z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: data.color }}
          >
            {data.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{data.name}</h3>
            <div className="text-[9px] uppercase font-bold text-docker-muted">{data.category}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-docker-card rounded-md text-docker-muted hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 pb-10">
        <Section title="General">
          <div>
            <label className="block text-xs text-docker-muted mb-1">Image Tag</label>
            <input
              type="text"
              value={data.image || ''}
              onChange={(e) => updateField('image', e.target.value)}
              className="w-full bg-docker-card border border-docker-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-docker-blue focus:ring-1 focus:ring-docker-blue text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-docker-muted mb-1">Container Name (Optional)</label>
            <input
              type="text"
              value={data.container_name || ''}
              onChange={(e) => updateField('container_name', e.target.value)}
              className="w-full bg-docker-card border border-docker-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-docker-blue focus:ring-1 focus:ring-docker-blue text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-docker-muted mb-1">Restart Policy</label>
            <select
              value={data.restart || 'always'}
              onChange={(e) => updateField('restart', e.target.value)}
              className="w-full bg-docker-card border border-docker-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-docker-blue focus:ring-1 focus:ring-docker-blue text-white appearance-none"
            >
              <option value="no">no</option>
              <option value="always">always</option>
              <option value="unless-stopped">unless-stopped</option>
              <option value="on-failure">on-failure</option>
            </select>
          </div>
        </Section>

        <Section title="Ports">
          {data.ports && data.ports.map((port, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                type="text"
                value={port}
                onChange={(e) => handleArrayChange('ports', index, e.target.value)}
                placeholder="8080:80"
                className="flex-1 bg-docker-card border border-docker-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-docker-blue focus:ring-1 focus:ring-docker-blue text-white font-mono"
              />
              <button 
                onClick={() => removeArrayItem('ports', index)}
                className="p-1.5 text-docker-muted hover:text-red-500 bg-docker-card rounded-lg border border-docker-border transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addArrayItem('ports', '8080:80')}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-xs text-docker-blue hover:text-white border border-dashed border-docker-blue/30 hover:border-docker-blue rounded-lg transition-colors mt-2"
          >
            <Plus size={14} /> Add Port
          </button>
        </Section>

        <Section title="Environment Variables">
          {envEntries.map(([key, value], index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={key}
                onChange={(e) => updateEnvKey(key, e.target.value, value)}
                placeholder="KEY"
                className="w-1/3 bg-docker-card border border-docker-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-docker-blue text-white font-mono"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => updateEnvValue(key, e.target.value)}
                placeholder="Value"
                className="flex-1 bg-docker-card border border-docker-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-docker-blue text-white font-mono"
              />
              <button 
                onClick={() => removeEnvVar(key)}
                className="p-1.5 text-docker-muted hover:text-red-500 bg-docker-card rounded-lg border border-docker-border transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button 
            onClick={addEnvVar}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-xs text-docker-blue hover:text-white border border-dashed border-docker-blue/30 hover:border-docker-blue rounded-lg transition-colors mt-2"
          >
            <Plus size={14} /> Add Variable
          </button>
        </Section>

        <Section title="Volumes">
          {(data.volumes || []).map((vol, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                type="text"
                value={vol}
                onChange={(e) => handleArrayChange('volumes', index, e.target.value)}
                placeholder="./local:/container"
                className="flex-1 bg-docker-card border border-docker-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-docker-blue text-white font-mono"
              />
              <button 
                onClick={() => removeArrayItem('volumes', index)}
                className="p-1.5 text-docker-muted hover:text-red-500 bg-docker-card rounded-lg border border-docker-border transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addArrayItem('volumes', './data:/data')}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-xs text-docker-blue hover:text-white border border-dashed border-docker-blue/30 hover:border-docker-blue rounded-lg transition-colors mt-2"
          >
            <Plus size={14} /> Add Volume
          </button>
        </Section>
        
        <Section title="Networks">
          {(data.networks || []).map((net, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                type="text"
                value={net}
                onChange={(e) => handleArrayChange('networks', index, e.target.value)}
                placeholder="default"
                className="flex-1 bg-docker-card border border-docker-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-docker-blue text-white font-mono"
              />
              <button 
                onClick={() => removeArrayItem('networks', index)}
                className="p-1.5 text-docker-muted hover:text-red-500 bg-docker-card rounded-lg border border-docker-border transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => addArrayItem('networks', 'custom_net')}
            className="w-full py-1.5 flex items-center justify-center gap-1 text-xs text-docker-blue hover:text-white border border-dashed border-docker-blue/30 hover:border-docker-blue rounded-lg transition-colors mt-2"
          >
            <Plus size={14} /> Add Network
          </button>
        </Section>
      </div>
    </motion.div>
  );
}
