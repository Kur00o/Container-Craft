import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { SERVICES } from '../../services/api';

const ServiceCard = ({ service }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: service.id,
    data: { service },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative p-3 mb-3 bg-docker-card rounded-xl border border-docker-border cursor-grab hover:bg-docker-surface hover:translate-x-1 transition-all
        ${isDragging ? 'opacity-50 scale-95 cursor-grabbing z-50 shadow-lg' : ''}`}
      style={{
        borderLeft: `4px solid ${service.color}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: service.color }}
        >
          {service.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium truncate pr-2">{service.name}</h4>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-docker-muted flex-shrink-0">
              {service.version.split(':')[1] || 'latest'}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full bg-opacity-20"
              style={{ color: service.color, backgroundColor: `${service.color}33` }}
            >
              {service.category}
            </span>
          </div>
          <p className="text-xs text-docker-muted mt-2 line-clamp-1">{service.description}</p>
        </div>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Popular');

  const filters = ['Popular', 'Backend', 'Database', 'Cache', 'Frontend'];

  const filteredServices = SERVICES.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'Popular' ? true : s.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-[260px] h-full bg-docker-surface border-r border-docker-border flex flex-col flex-shrink-0 relative z-10">
      <div className="p-4 border-b border-docker-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-docker-muted" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] text-white text-sm rounded-lg pl-9 pr-3 py-2 border border-docker-border focus:outline-none focus:border-docker-blue focus:ring-1 focus:ring-docker-blue transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto mt-4 pb-1 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-docker-blue text-white' 
                  : 'bg-transparent text-docker-muted border border-docker-border hover:bg-docker-card'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <motion.div layout className="flex flex-col">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ServiceCard service={service} />
            </motion.div>
          ))}
          {filteredServices.length === 0 && (
            <div className="text-center text-sm text-docker-muted mt-8">
              No services found.
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="p-3 text-center border-t border-docker-border">
        <p className="text-xs text-docker-muted">Drag items to the canvas</p>
      </div>
    </div>
  );
}
