import React, { useRef, useEffect } from 'react';
import { MaterialType, ServiceOrder, OSDetails } from '../types';
import { 
  Clipboard, 
  Trash2, 
  RotateCw, 
  Maximize2, 
  Layers, 
  Grid, 
  Flag, 
  Scissors, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  ChevronRight, 
  FolderGit2, 
  Upload, 
  HelpCircle 
} from 'lucide-react';

interface OSFormProps {
  activeOS: ServiceOrder;
  onChange: (updated: ServiceOrder) => void;
}

export default function OSForm({ activeOS, onChange }: OSFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper handling basic field changes
  const updateField = (key: keyof ServiceOrder, value: any) => {
    onChange({
      ...activeOS,
      [key]: value
    });
  };

  // Helper handling material details changes
  const updateDetail = (key: keyof OSDetails, value: any) => {
    onChange({
      ...activeOS,
      detalhes: {
        ...activeOS.detalhes,
        [key]: value
      }
    });
  };

  // Triggered when user selects a local file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process a selected or dropped file to base64
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        updateField('pastedImage', event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clean the currently held screenshot
  const removeImage = () => {
    updateField('pastedImage', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Preset Dimensions Helpers
  const applyPresetDimensions = (larg: number, alt: number) => {
    onChange({
      ...activeOS,
      largura: larg,
      altura: alt
    });
  };

  // Material lists with visual styling and icon helper
  const materials: { name: MaterialType; icon: React.ReactNode; desc: string; color: string }[] = [
    { name: 'Adesivo', icon: <Scissors className="w-4 h-4" />, desc: 'Vinil Brilho/Fosco', color: 'text-indigo-650' },
    { name: 'Adesivo Perfurado', icon: <Grid className="w-4 h-4" />, desc: 'Traseira Veículos', color: 'text-purple-650' },
    { name: 'Lona', icon: <Layers className="w-4 h-4" />, desc: 'Front / Backlight', color: 'text-amber-650' },
    { name: 'PVC', icon: <FileText className="w-4 h-4" />, desc: 'Chapa Rígida PSAI', color: 'text-emerald-650' },
    { name: 'Acrílico', icon: <Maximize2 className="w-4 h-4" />, desc: 'Corte Laser Nobre', color: 'text-sky-650' },
    { name: 'MDF', icon: <FolderGit2 className="w-4 h-4" />, desc: 'Madeira Revestida', color: 'text-orange-750' },
    { name: 'Banner', icon: <Flag className="w-4 h-4" />, desc: 'Acabamento Bastão', color: 'text-rose-650' },
  ];

  // Specific preset buttons for speed input
  const presets = [
    { label: 'A4 (21x30 cm)', w: 0.21, h: 0.30 },
    { label: 'Placa 1x1m', w: 1.0, h: 1.0 },
    { label: 'Chapa PVC Inteira', w: 1.22, h: 2.44 },
    { label: 'Lona Padrão 2x1m', w: 2.0, h: 1.0 },
    { label: 'Traseira Veículo', w: 1.30, h: 0.85 },
  ];

  // Auto calculate total area for instant live designer feedback
  const areaUnitaria = activeOS.largura * activeOS.altura;
  const areaTotal = areaUnitaria * activeOS.quantidade;

  return (
    <div className="space-y-6">
      {/* 1. ADMIN & COMPANY METADATA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
          Identificação da Ordem de Serviço
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Empresa / Logomarca Texto</label>
            <input 
              type="text" 
              value={activeOS.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ex: Alfa Comunicação Visual"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">WhatsApp / Telefone O.S.</label>
            <input 
              type="text" 
              value={activeOS.companyPhone || ''}
              onChange={(e) => updateField('companyPhone', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ex: (11) 98765-4321"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Número da O.S.</label>
            <input 
              type="text" 
              value={activeOS.osNumber}
              onChange={(e) => updateField('osNumber', e.target.value)}
              className="w-full text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-900 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Vendedor</label>
            <input 
              type="text" 
              value={activeOS.vendedor}
              onChange={(e) => updateField('vendedor', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-850 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Vendedor"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Arte-Finalista</label>
            <input 
              type="text" 
              value={activeOS.designer}
              onChange={(e) => updateField('designer', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-850 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Criado por..."
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status de Produção</label>
            <select
              value={activeOS.status}
              onChange={(e) => updateField('status', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-850 font-bold transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="rascunho">📝 Rascunho / Criação</option>
              <option value="producao">⚙️ Para Produção</option>
              <option value="concluido">✅ Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. CLIENT DATA */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          Dados do Cliente & Prazos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Nome do Cliente / Razão Social</label>
            <input 
              type="text" 
              value={activeOS.clienteNome}
              onChange={(e) => updateField('clienteNome', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-900 font-semibold transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ex: Padaria do Sol / João Silva"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Contato (Telefone/Celular)</label>
            <input 
              type="text" 
              value={activeOS.clienteContato}
              onChange={(e) => updateField('clienteContato', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-850 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ex: (11) 99999-8888"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Data de Emissão</label>
            <input 
              type="date" 
              value={activeOS.dataEmissao}
              onChange={(e) => updateField('dataEmissao', e.target.value)}
              className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Prazo de Entrega (Produção)</label>
            <input 
              type="date" 
              value={activeOS.dataEntrega}
              onChange={(e) => updateField('dataEntrega', e.target.value)}
              className="w-full text-xs bg-rose-50 border border-rose-200 focus:border-rose-500 rounded-lg px-3 py-2 text-rose-700 font-bold transition focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* 3. MATERIAL SELECTION */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
            Selecione o Material <span className="text-[11px] text-indigo-600 font-bold font-mono">(Marcado no Gabarito)</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {materials.map((m) => {
            const isSelected = activeOS.material === m.name;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => updateField('material', m.name)}
                className={`flex flex-col items-center justify-center p-3 text-center rounded-xl border transition-all active:scale-95 duration-150 ${
                  isSelected 
                  ? 'bg-slate-950 border-slate-950 text-white shadow-md ring-1 ring-slate-950' 
                  : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`p-1.5 rounded-lg mb-1.5 ${isSelected ? 'bg-white/10 text-indigo-300' : 'bg-slate-100 ' + m.color}`}>
                  {m.icon}
                </div>
                <span className="text-xs font-bold leading-tight tracking-tight">{m.name}</span>
                <span className={`text-[9px] block mt-0.5 font-medium leading-none ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{m.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MEASUREMENTS & DIMENSIONS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-600 rounded"></span>
          Dimensões & Quantidade de Produção
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
              <span>Largura (m)</span>
              <span className="text-[10px] text-slate-400 font-mono">LARG</span>
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                value={activeOS.largura || ''}
                onChange={(e) => updateField('largura', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-emerald-500 rounded-lg pl-3 pr-8 py-2 text-slate-900 transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold font-mono">m</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
              <span>Altura (m)</span>
              <span className="text-[10px] text-slate-400 font-mono">ALT</span>
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                value={activeOS.altura || ''}
                onChange={(e) => updateField('altura', parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-emerald-500 rounded-lg pl-3 pr-8 py-2 text-slate-900 transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold font-mono">m</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Quantidade</label>
            <input 
              type="number" 
              min="1"
              value={activeOS.quantidade || ''}
              onChange={(e) => updateField('quantidade', parseInt(e.target.value) || 1)}
              className="w-full text-xs font-mono font-bold bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-900 transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="1"
            />
          </div>
        </div>

        {/* Dynamic calculation banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex justify-between items-center text-slate-700">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Área do Item Único</span>
            <span className="text-[13px] font-mono font-bold text-slate-800">
              {activeOS.largura}m × {activeOS.altura}m = {areaUnitaria.toFixed(3)} m²
            </span>
          </div>
          <div className="text-right border-l border-slate-200 pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Área Total ({activeOS.quantidade} un)</span>
            <span className="text-[15px] font-mono font-extrabold text-indigo-700">
              {areaTotal.toFixed(2)} m²
            </span>
          </div>
        </div>

        {/* Preset dimension shortcuts */}
        <div className="space-y-1.5 font-sans">
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Atalhos rápidos para gabaritos:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPresetDimensions(preset.w, preset.h)}
                className="text-[10px] bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 text-slate-600 rounded px-2 py-1 font-semibold transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
         {/* 5. MATERIAL SPECIFIC CONFIG (DYNAMIC FIELDS) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
          Especificações do Material: <span className="text-indigo-650 font-extrabold">{activeOS.material}</span>
        </h3>

        {/* ADESIVO / ADESIVO PERFURADO SECTOR */}
        {(activeOS.material === 'Adesivo' || activeOS.material === 'Adesivo Perfurado') && (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo de Recorte</label>
              <select
                value={activeOS.detalhes.recorte || 'Sem Recorte'}
                onChange={(e) => updateDetail('recorte', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Sem Recorte">✂️ Sem Recorte (Retangular)</option>
                <option value="Recorte de Contorno">🌀 Recorte de Contorno (Logo)</option>
                <option value="Recorte Eletrônico">⚡ Recorte Eletrônico (Vazado)</option>
                <option value="Manual">🤚 Recorte Manual</option>
                <option value="Meio Corte">🏁 Meio Corte na Folha</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Acabamento do Vinil</label>
              <select
                value={activeOS.detalhes.acabamento || 'Brilho'}
                onChange={(e) => updateDetail('acabamento', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Brilho">✨ Verniz / Brilho</option>
                <option value="Fosco">🌑 Fosco Antireflexo</option>
                <option value="Laminado Protetivo">🛡️ Laminado de Proteção</option>
                <option value="Sem Acabamento">🚫 Sem Acabamento / Padrão</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Aplicação Prevista</label>
              <select
                value={activeOS.detalhes.aplicacao || 'Vidro / Vitrine'}
                onChange={(e) => updateDetail('aplicacao', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Vidro / Vitrine">🪟 Vidro de Vitrine</option>
                <option value="Veículo">🚗 Lataria / Vidro de Veículo</option>
                <option value="Parede Interna">🧱 Parede Lisa (Massa)</option>
                <option value="Placa PSAI / PVC">🪧 Acoplado em Placa</option>
                <option value="Acrílico">💎 Acoplado em Acrílico</option>
                <option value="Chapa de Aço / ACM">🏢 Revestimento em ACM / Chapa</option>
                <option value="Muro / Fachada">🏗️ Parede Rugosa / Tapume</option>
                <option value="Outro">🌐 Outro (Especificar na Obs)</option>
              </select>
            </div>
          </div>
        )}

        {/* LONA / BANNER SECTOR */}
        {(activeOS.material === 'Lona' || activeOS.material === 'Banner') && (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Acabamento de Impressão</label>
              <select
                value={activeOS.detalhes.acabamento || 'Bastão e Cordão'}
                onChange={(e) => updateDetail('acabamento', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Bainha e Ilhós">🕳️ Bainha Dobrada e Ilhós para Amarras</option>
                <option value="Bastão e Cordão">🪵 Bastão de Madeira, Ponteira e Cordão</option>
                <option value="Bainha Sem Ilhós">🧵 Bainha sem Reforço</option>
                <option value="Refile Rente">📐 Refile Rente (Sem Sobras)</option>
                <option value="Com Sobra de 5cm">📏 Com Sobras laterais para esticar</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Aplicação / Fixação</label>
              <select
                value={activeOS.detalhes.aplicacao || 'Fachada Interna/Externo'}
                onChange={(e) => updateDetail('aplicacao', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Estrutura de Metal / Cavalete">🏗️ Fixação em Metal/Cavalete por Enforcagato</option>
                <option value="Bastão Pendurado">📎 Pendurar com Gancho (Bastão)</option>
                <option value="Direto em Fachada de Prédio">🧱 Chumbado ou amarrado em fachada</option>
                <option value="Painel Luminoso Interno">💡 Painel Backlight Interno</option>
                <option value="Liso sem estrutura">📄 Liso / Somente Impresso</option>
              </select>
            </div>
          </div>
        )}

        {/* PVC / ACRÍLICO / MDF SECTOR */}
        {(activeOS.material === 'PVC' || activeOS.material === 'Acrílico' || activeOS.material === 'MDF') && (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Espessura da Chapa</label>
              <select
                value={activeOS.detalhes.espessura || '2mm'}
                onChange={(e) => updateDetail('espessura', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="1.0mm">📏 1.0 mm (PS mais fino)</option>
                <option value="2.0mm">📏 2.0 mm (PS comum)</option>
                <option value="3.0mm">📏 3.0 mm (Rígido padrão)</option>
                <option value="5.0mm">📏 5.0 mm (Espesso estrutural)</option>
                <option value="10mm">📏 10 mm (Grosso - Letra Caixa)</option>
                <option value="Outra">🎨 Outra espessura / Combinar</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tipo de Corte</label>
              <select
                value={activeOS.detalhes.tipoCorte || 'Reto / Linear'}
                onChange={(e) => updateDetail('tipoCorte', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Retor / Linear">📐 Corte Reto / No Esquadro</option>
                <option value="Router CNC">⚙️ Router CNC</option>
                <option value="Corte Laser">🔥 Corte Laser (Premium)</option>
                <option value="Manual">🤚 Estilete / Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Acabamento / Adesivação</label>
              <select
                value={activeOS.detalhes.acabamento || 'Adesivado por cima'}
                onChange={(e) => updateDetail('acabamento', e.target.value)}
                className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-2.5 py-2 text-slate-800 transition focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="Adesivado por cima">🖼️ Vinil Adesivo Aplicado Na Frente</option>
                <option value="Adesivado Verso (Inverso)">💎 Vinil Reverso (Vidro/Acrílico Cristal)</option>
                <option value="Impressão Direta UV">☀️ Impressão UV direta na chapa</option>
                <option value="Apenas chapa sem impressão">🚫 Sem Impressão / Placa virgem</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. UPLOAD / COLAR PRINT - CTRL+V */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
            Imagem do Layout (Representação Central)
          </h3>
          <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-700 px-2 py-0.5 rounded-full font-bold font-mono">
            CTRL+V ATIVO NO SITE
          </span>
        </div>

        {/* Paste dropzone block */}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            activeOS.pastedImage 
            ? 'border-indigo-300 bg-indigo-50/10' 
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          {activeOS.pastedImage ? (
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="relative mx-auto max-w-[240px] aspect-video border border-slate-200 rounded-lg bg-white p-1 hover:shadow-md transition duration-200 overflow-hidden flex items-center justify-center">
                <img 
                  src={activeOS.pastedImage} 
                  alt="Print da Arte" 
                  className="max-h-full max-w-full object-contain"
                  style={{ transform: `rotate(${activeOS.imageRotation}deg)` }}
                />
              </div>
              <div className="flex justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const rot = (activeOS.imageRotation + 90) % 360;
                    updateField('imageRotation', rot);
                  }}
                  className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-2.5 py-1.5 rounded-md font-semibold transition"
                  title="Girar Imagem"
                >
                  <RotateCw className="w-3 h-3 text-indigo-600" />
                  Girar ({activeOS.imageRotation}°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextFit = activeOS.imageFit === 'contain' ? 'cover' : 'contain';
                    updateField('imageFit', nextFit);
                  }}
                  className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 px-2.5 py-1.5 rounded-md font-semibold transition"
                  title="Mudar corte"
                >
                  <Maximize2 className="w-3 h-3 text-slate-600" />
                  Preencher ({activeOS.imageFit === 'contain' ? 'Inteira' : 'Corte'})
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 text-[11px] bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 px-2.5 py-1.5 rounded-md font-semibold transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Arraste um novo print ou aperte Ctrl+V para trocar de imagem.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pointer-events-none">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Como colar a foto da arte?</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                1. Dê um <i>Print Screen</i> ou copie uma imagem de layout <b>(Ctrl+C)</b> do Corel, Illustrator or Whatsapp.<br />
                2. Depois pressione a tecla <kbd className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded text-[10px] font-mono font-bold">Ctrl + V</kbd> em qualquer lugar deste site.<br />
                <span className="text-indigo-600 font-semibold text-[10px]">Ou clique aqui para escolher um arquivo de imagem do seu computador.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 7. OBSERVATIONS */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
          Observações Técnicas de Acabamento & Produção
        </h3>

        <div>
          <textarea
            value={activeOS.observacoes}
            onChange={(e) => updateField('observacoes', e.target.value)}
            rows={4}
            className="w-full text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            placeholder="Ex: Impressão espelhada para aplicação por trás do vidro. Retirar rebarbas com estilete liso. Fazer reforço com ilhós a cada 20cm..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}
