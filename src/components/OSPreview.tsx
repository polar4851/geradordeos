import React from 'react';
import { ServiceOrder } from '../types';

interface OSPreviewProps {
  activeOS: ServiceOrder;
}

export default function OSPreview({ activeOS }: OSPreviewProps) {
  const areaUnitaria = activeOS.largura * activeOS.altura;
  const areaTotal = areaUnitaria * activeOS.quantidade;

  // Format date helper from ISO string to visual format (DD/MM/AAAA)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Informative Tip (Hidden on print) */}
      <div className="no-print w-full max-w-[794px] mb-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-3 shadow-sm">
        <span className="bg-indigo-100 text-indigo-700 w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0 mt-0.5">!</span>
        <div className="space-y-0.5">
          <p className="font-bold text-[13px] text-indigo-900">Prévia A4 em Proporção Perfeita (Fábrica)</p>
          <p className="text-slate-600 leading-relaxed">Esta folha representa fisicamente o lote de impressão que vai para a produção. Removidos dados dispensáveis para que caiba tudo em 1 folha sem cortar ou achatar.</p>
        </div>
      </div>

      {/* The Printable A4 Container with strict aspect ratio */}
      <div 
        id="a4-job-ticket"
        className="print-page bg-white rounded-none text-slate-900 relative flex flex-col justify-between border border-slate-350 shadow-lg"
        style={{
          fontFamily: 'Inter, sans-serif',
          boxSizing: 'border-box',
          width: '794px',
          height: '1123px',
          minWidth: '794px',
          minHeight: '1123px',
          maxWidth: '794px',
          maxHeight: '1123px',
          padding: '36px',
        }}
      >
        {/* Top absolute header brand line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-950"></div>

        <div className="flex flex-col flex-1 justify-start">
          {/* Header Block */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3">
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                {activeOS.companyName || 'SUL SINALIZAÇÃO'}
              </h1>
              {activeOS.companyPhone && (
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Fone: {activeOS.companyPhone}
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className="bg-slate-950 text-white font-mono text-center px-4 py-1.5 rounded shadow-sm inline-block">
                <span className="block text-[8px] tracking-widest text-slate-400 font-bold uppercase">ORDEM DE PRODUÇÃO</span>
                <span className="text-lg font-black tracking-tight">{activeOS.osNumber || 'OS-1001'}</span>
              </div>
            </div>
          </div>

          {/* Simplified Metadata */}
          <div className="grid grid-cols-4 border border-slate-900/20 bg-slate-50 mt-3 text-xs rounded-lg overflow-hidden">
            <div className="p-2.5 col-span-3 border-r border-slate-900/10">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">CLIENTE / SOLICITANTE</span>
              <span className="font-extrabold text-slate-950 text-sm block truncate">
                {activeOS.clienteNome || 'Consumidor Final'}
              </span>
            </div>
            <div className="p-2.5 bg-rose-50 flex flex-col justify-center">
              <span className="block text-[8px] font-black text-rose-500 uppercase tracking-wider">ENTREGA URGENÇÃO</span>
              <span className="font-mono font-black text-rose-700 text-sm block">
                {formatDate(activeOS.dataEntrega)}
              </span>
            </div>
          </div>

          {/* Material & Details Horizontal Banner */}
          <div className="mt-3 bg-slate-950 text-white rounded-lg p-3 flex justify-between items-center">
            <div>
              <span className="block text-[8px] tracking-widest text-slate-300 font-black uppercase">MATERIAL RÍGIDO/FLEXÍVEL</span>
              <span className="text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5 mt-0.5">
                ⚙️ {activeOS.material}
              </span>
            </div>
            
            {/* Context specs depending on chosen material */}
            <div className="text-right text-xs">
              {activeOS.material === 'Adesivo' || activeOS.material === 'Adesivo Perfurado' ? (
                <div className="flex gap-4">
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black">RECORTE</span>
                    <span className="font-bold text-emerald-400">{activeOS.detalhes.recorte || 'Sem Recorte'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black">ACABAMENTO</span>
                    <span className="font-bold text-emerald-400">{activeOS.detalhes.acabamento || 'Sem Acabamento'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black">APLICAÇÃO</span>
                    <span className="font-bold text-emerald-400">{activeOS.detalhes.aplicacao || 'Vidro'}</span>
                  </div>
                </div>
              ) : activeOS.material === 'Lona' || activeOS.material === 'Banner' ? (
                <div className="flex gap-4">
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black font-bold">ACABAMENTO</span>
                    <span className="font-bold text-amber-400">{activeOS.detalhes.acabamento || 'Não Informado'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black font-bold">APLICAÇÃO</span>
                    <span className="font-bold text-amber-400">{activeOS.detalhes.aplicacao || 'Fábrica'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black">ESPESSURA</span>
                    <span className="font-bold text-sky-400">{activeOS.detalhes.espessura || '2mm'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black">CORTE CHAPA</span>
                    <span className="font-bold text-sky-400">{activeOS.detalhes.tipoCorte || 'Reto'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-400 uppercase font-black">FINISHING</span>
                    <span className="font-bold text-sky-400">{activeOS.detalhes.acabamento || 'Adesivado'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Giant Measurements block */}
          <div className="mt-3 border border-slate-900/20 bg-slate-50/50 rounded-lg p-3">
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              📐 MEDIDAS TÉCNICAS E QUANTIDADE (VERIFIQUE ANTES DE CORTAR)
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white border border-slate-200 rounded p-2 text-center shadow-sm">
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">LARGURA (LARG)</span>
                <span className="font-mono text-xl font-black text-slate-950 block mt-0.5">
                  {activeOS.largura.toFixed(2)} <span className="text-xs font-semibold text-slate-500">m</span>
                </span>
                <span className="block text-[9px] text-slate-400">({(activeOS.largura * 100).toFixed(0)} cm)</span>
              </div>
              
              <div className="bg-white border border-slate-200 rounded p-2 text-center shadow-sm">
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">ALTURA (ALT)</span>
                <span className="font-mono text-xl font-black text-slate-950 block mt-0.5">
                  {activeOS.altura.toFixed(2)} <span className="text-xs font-semibold text-slate-500">m</span>
                </span>
                <span className="block text-[9px] text-slate-400">({(activeOS.altura * 100).toFixed(0)} cm)</span>
              </div>

              <div className="bg-emerald-950 text-white rounded p-2.5 text-center shadow-sm flex flex-col justify-center">
                <span className="block text-[8px] text-emerald-400 font-black uppercase tracking-widest">QUANTIDADE</span>
                <span className="font-mono text-2xl font-black text-white leading-none block my-1">
                  {activeOS.quantidade} <span className="text-[11px] font-semibold">UN</span>
                </span>
                <span className="text-[8px] text-slate-300 font-mono">
                  M² Total: {areaTotal.toFixed(2)} m²
                </span>
              </div>
            </div>
          </div>

          {/* Large Artwork Screen Preview Box */}
          <div className="mt-3 flex-1 flex flex-col min-h-0">
            <div className="bg-slate-100 border border-slate-200 border-b-0 rounded-t-lg px-3 py-1 flex justify-between items-center text-[9px] font-black text-slate-600 tracking-wider">
              <span>🖼️ PRINT DO LAYOUT DE DESIGN (REFERÊNCIA DE MONTAGEM)</span>
              <span className="font-mono text-[8px]">PROPORÇÃO REAL A4</span>
            </div>
            
            <div className="border border-slate-205 bg-slate-50/70 rounded-b-lg h-[460px] max-h-[460px] flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
              {activeOS.pastedImage ? (
                <div className="w-full h-full flex items-center justify-center transition-all">
                  <img
                    src={activeOS.pastedImage}
                    alt="Layout Visual"
                    className={`max-w-full max-h-full shadow-md rounded border border-slate-200 ${
                      activeOS.imageFit === 'contain' ? 'object-contain' : 'object-cover w-full h-full'
                    }`}
                    style={{ 
                      transform: `rotate(${activeOS.imageRotation}deg)`,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-350 text-base font-bold">
                    +
                  </div>
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Sem mock da imagem ainda</p>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Copie a arte no Corel/Illustrator (Ctrl+C) ou tire print, e dê <b>Ctrl + V</b> no formulário para anexar a foto aqui.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technical notes & floor handoff bottom section */}
        <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
          {/* Observations */}
          <div className="bg-amber-500/10 border-l-[4px] border-amber-500 p-2.5 rounded-r">
            <span className="block text-[8px] font-black text-amber-800 uppercase tracking-widest mb-0.5">
              ⚠️ INSTRUÇÕES ESPECIAIS & OBSERVAÇÕES PARA ACABAMENTO
            </span>
            <p className="text-[10.5px] font-bold text-slate-800 leading-normal whitespace-pre-wrap">
              {activeOS.observacoes || 'Sem especificações. Produzir seguindo as diretrizes tradicionais de qualidade do material indicado.'}
            </p>
          </div>

          <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono mt-0.5 pt-1.5 border-t border-slate-100">
            <span>Ficha de Trabalho do Operador - Fábrica</span>
            <span>Gabarito A4 100% Proporcional</span>
          </div>
        </div>
      </div>
    </div>
  );
}
