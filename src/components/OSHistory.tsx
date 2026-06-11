import React, { useState } from 'react';
import { ServiceOrder } from '../types';
import { 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Copy, 
  Calendar, 
  Sparkles, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface OSHistoryProps {
  orders: ServiceOrder[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function OSHistory({
  orders,
  activeId,
  onSelect,
  onCreateNew,
  onDelete,
  onDuplicate,
}: OSHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter orders based on user typing in search bar
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.clienteNome.toLowerCase().includes(term) ||
      order.osNumber.toLowerCase().includes(term) ||
      order.vendedor.toLowerCase().includes(term) ||
      order.material.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[820px]">
      {/* Upper header action */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Histórico de O.S.</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Salvos no navegador</p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center gap-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova O.S.
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por cliente, nº O.S..."
          className="w-full text-xs pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      {/* List items scrollbox */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px]">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <p className="text-xs font-semibold">Nenhuma O.S. encontrada</p>
            <p className="text-[10px] text-slate-400 mt-1">Busque outro termo ou crie uma nova no botão acima.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isActive = order.id === activeId;
            
            // Render nice visual badges for status
            let statusBadge = null;
            if (order.status === 'producao') {
              statusBadge = <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-black flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Produção</span>;
            } else if (order.status === 'concluido') {
              statusBadge = <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-black flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> Finalizado</span>;
            } else {
              statusBadge = <span className="text-[9px] bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium">Rascunho</span>;
            }

            return (
              <div
                key={order.id}
                onClick={() => onSelect(order.id)}
                className={`group border rounded-lg p-3 text-left cursor-pointer transition-all ${
                  isActive 
                  ? 'bg-slate-950 border-slate-950 shadow-md text-white' 
                  : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 text-slate-800'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="font-mono text-xs font-bold tracking-wide">
                    {order.osNumber}
                  </div>
                  {/* Status */}
                  <div className="shrink-0">{statusBadge}</div>
                </div>

                <div className="font-semibold text-xs line-clamp-1 mb-1">
                  {order.clienteNome || 'Cliente não cadastrado'}
                </div>

                <div className="flex justify-between items-center text-[10px] mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tight font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {order.material}
                    </span>
                    <span className={isActive ? 'text-slate-300 font-mono' : 'text-slate-500 font-mono'}>
                      {order.largura.toFixed(2)}×{order.altura.toFixed(2)}m
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    {order.pastedImage && (
                      <ImageIcon className={`w-3.5 h-3.5 mr-0.5 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} title="Contém imagem" />
                    )}
                    <span className={isActive ? 'text-slate-300' : 'text-slate-400'}>
                      {order.dataEntrega.split('-')[2]}/{order.dataEntrega.split('-')[1]}
                    </span>
                  </div>
                </div>

                {/* Hover actions inside list item (duplicate / delete) */}
                <div className="flex justify-end gap-1 mt-2.5 pt-2 border-t border-dashed border-slate-100/15 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(order.id);
                    }}
                    className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                      isActive 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Duplicar O.S."
                  >
                    <Copy className="w-2.5 h-2.5" />
                    Dual
                  </button>
                  <button
                    type="button"
                    disabled={orders.length === 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(order.id);
                    }}
                    className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded transition disabled:opacity-30 ${
                      isActive 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                    }`}
                    title="Excluir O.S."
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span className="uppercase tracking-wider">PERSISTÊNCIA LOCAL ATIVA</span>
      </div>
    </div>
  );
}
