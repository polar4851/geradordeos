import React, { useState, useEffect, useRef } from 'react';
import { ServiceOrder, MaterialType } from './types';
import OSForm from './components/OSForm';
import OSPreview from './components/OSPreview';
import OSHistory from './components/OSHistory';
import { 
  FileText, 
  Printer, 
  Download, 
  Clipboard, 
  Sparkles, 
  RotateCw, 
  FileSpreadsheet,
  AlertTriangle,
  HelpCircle,
  Copy,
  FolderOpen,
  Info, Save, Upload, Instagram, MessageCircle, Layers, CheckCircle2, Clock3
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

// Default initial visual blueprint image SVG
const VECTOR_BLUEPRINT_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'><rect width='400' height='250' fill='%23fafafa'/><rect x='20' y='20' width='360' height='210' rx='10' fill='none' stroke='%233b82f6' stroke-width='2' stroke-dasharray='6'/><circle cx='200' cy='125' r='55' fill='%23eff6ff' stroke='%232563eb' stroke-width='3'/><text x='200' y='120' font-family='sans-serif' font-size='15' font-weight='bold' fill='%231e3a8a' text-anchor='middle'>SUL SINALIZAÇÃO</text><text x='200' y='140' font-family='sans-serif' font-size='10' font-weight='800' fill='%232563eb' text-anchor='middle'>✔ CORTE ELETRÔNICO</text><rect x='110' y='170' width='180' height='22' rx='4' fill='%231e293b'/><text x='200' y='184' font-family='monospace' font-size='9' fill='%23f1f5f9' text-anchor='middle'>AD_CORTE_FRENTE.AI</text></svg>";

const DEFAULT_ORDERS: ServiceOrder[] = [
  {
    id: 'os-default-1',
    osNumber: 'OS-1001',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataEntrega: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clienteNome: '',
    clienteContato: '',
    vendedor: '',
    designer: '',
    material: 'Adesivo',
    largura: 1.00,
    altura: 1.00,
    quantidade: 1,
    detalhes: {
      recorte: 'Sem Recorte',
      acabamento: 'Sem Acabamento',
      aplicacao: 'Vidro / Vitrine',
    },
    observacoes: '',
    pastedImage: null,
    imageFit: 'contain',
    imageRotation: 0,
    companyName: 'Sua empresa',
    companyPhone: '',
    status: 'producao'
  }
];

const SHOW_LOCK_SCREEN = false;

export default function App() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [activeOSId, setActiveOSId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [storageError, setStorageError] = useState(false);

  // 1. Load data from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('visual_comm_os_list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ServiceOrder[];
        if (parsed.length > 0) {
          setOrders(parsed);
          setActiveOSId(parsed[0].id);
        } else {
          setOrders(DEFAULT_ORDERS);
          setActiveOSId(DEFAULT_ORDERS[0].id);
        }
      } catch (e) {
        console.error('Falha ao restaurar do localStorage', e);
        setOrders(DEFAULT_ORDERS);
        setActiveOSId(DEFAULT_ORDERS[0].id);
      }
    } else {
      setOrders(DEFAULT_ORDERS);
      setActiveOSId(DEFAULT_ORDERS[0].id);
    }
  }, []);

  // 2. Sync to localStorage when orders change
  useEffect(() => {
    if (orders.length > 0) {
      try { localStorage.setItem('visual_comm_os_list', JSON.stringify(orders)); setStorageError(false); } catch (error) { console.error('Falha ao salvar', error); setStorageError(true); }
    }
  }, [orders]);

  // 3. LISTEN TO GLOBAL PASTE (CTRL+V) EVENT
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing custom notes or fields, unless they copy-paste a file!
      const activeEl = document.activeElement;
      const isInputText = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA'
      );

      const items = e.clipboardData?.items;
      if (!items) return;

      let imageFound = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            imageFound = true;
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                // Update active O.S. with pasted image
                setOrders((prev) => 
                  prev.map((ord) => 
                    ord.id === activeOSId 
                      ? { ...ord, pastedImage: event.target.result as string } 
                      : ord
                  )
                );
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }

      // If user pasted an image file, block standard paste to prevent rendering text junk in input fields
      if (imageFound) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [activeOSId, orders]);


  const handleExportBackup = () => {
    const payload = { app: 'Gerador de OS', version: 1, exportedAt: new Date().toISOString(), orders };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-gerador-de-os-' + new Date().toISOString().slice(0, 10) + '.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const imported = Array.isArray(parsed) ? parsed : parsed.orders;
        if (!Array.isArray(imported) || imported.some((item: any) => !item || typeof item.id !== 'string' || typeof item.osNumber !== 'string' || typeof item.clienteNome !== 'string' || typeof item.material !== 'string')) throw new Error('Formato inválido');
        if (!window.confirm('Importar ' + imported.length + ' ordem(ns)? Os dados atuais deste navegador serão substituídos.')) return;
        setOrders(imported); setActiveOSId(imported[0]?.id || '');
        localStorage.setItem('visual_comm_os_list', JSON.stringify(imported)); setStorageError(false);
        alert('Backup importado com sucesso.');
      } catch (error) { alert('Não foi possível importar. Selecione um backup JSON válido deste sistema.'); }
      finally { event.target.value = ''; }
    };
    reader.readAsText(file);
  };
  const counts = {
    total: orders.length,
    draft: orders.filter((order) => order.status === 'rascunho').length,
    production: orders.filter((order) => order.status === 'producao').length,
    completed: orders.filter((order) => order.status === 'concluido').length,
    overdue: orders.filter((order) => order.status !== 'concluido' && order.dataEntrega && new Date(order.dataEntrega + 'T23:59:59') < new Date()).length
  };

  // Find active Service Order payload
  const activeOS = orders.find((ord) => ord.id === activeOSId) || orders[0];

  // Helper updating the active O.S. details
  const handleOSChange = (updated: ServiceOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Create a brand new blank Service Order
  const handleCreateNew = () => {
    const timestamp = Date.now();
    const nextNum = orders.length > 0 
      ? `OS-${1000 + orders.length + 1}`
      : 'OS-1001';

    // Copy branding details from active one if exists
    const currentCompany = activeOS?.companyName || 'Sua empresa';
    const currentPhone = activeOS?.companyPhone || '';

    const newOS: ServiceOrder = {
      id: `os-${timestamp}`,
      osNumber: nextNum,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataEntrega: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      clienteNome: '',
      clienteContato: '',
      vendedor: activeOS?.vendedor || '',
      designer: activeOS?.designer || '',
      material: 'Adesivo',
      largura: 1.0,
      altura: 1.0,
      quantidade: 1,
      detalhes: {
        recorte: 'Sem Recorte',
        acabamento: 'Sem Acabamento',
        aplicacao: 'Vidro / Vitrine',
      },
      observacoes: '',
      pastedImage: null,
      imageFit: 'contain',
      imageRotation: 0,
      companyName: currentCompany,
      companyPhone: currentPhone,
      status: 'rascunho'
    };

    setOrders((prev) => [newOS, ...prev]);
    setActiveOSId(newOS.id);
  };

  // Delete Service Order from local state
  const handleDeleteOS = (id: string) => {
    if (orders.length <= 1) {
      alert('Você deve manter no mínimo 1 Ordem de Serviço cadastrada.');
      return;
    }
    const confirmDelete = window.confirm('Tem certeza que deseja apagar permanentemente esta Ordem de Serviço?');
    if (confirmDelete) {
      const remaining = orders.filter((o) => o.id !== id);
      setOrders(remaining);
      setActiveOSId(remaining[0].id);
    }
  };

  // Duplicate Service Order to quick draft matching specifications/client
  const handleDuplicateOS = (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) return;

    const duplicated: ServiceOrder = {
      ...target,
      id: `os-dup-${Date.now()}`,
      osNumber: `${target.osNumber}-CÓPIA`,
      clienteNome: `${target.clienteNome} (Cópia)`,
      status: 'rascunho'
    };

    setOrders((prev) => [duplicated, ...prev]);
    setActiveOSId(duplicated.id);
  };

  // EXPORT TO HIGH-DENSITY A4 PDF
  const handleExportPDF = async () => {
    if (!activeOS) return;
    setIsGenerating(true);
    
    try {
      const element = document.getElementById('a4-job-ticket');
      if (!element) {
        throw new Error('Elemento de preview A4 não encontrado.');
      }

      // Converte o elemento HTML diretamente para PNG em alta resolução
      // O html-to-image captura o elemento em seu tamanho real (794x1123px), sem distorções ou esmagamentos!
      const imgData = await toPng(element, {
        pixelRatio: 3, // Resolução 3x ultra-nítida de nível profissional para impressão industrial
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = 297; // Proporção perfeita A4 (210mm x 297mm)

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileNameStr = (activeOS.clienteNome || 'sem_nome').trim().replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`${activeOS.osNumber}_${fileNameStr}_producao.pdf`);
    } catch (err) {
      console.error('Falha ao exportar PDF:', err);
      alert('Houve um erro ao renderizar o PDF. Dica: você também pode usar o botão "IMPRIMIR DIRETO" (Ctrl+P) escolhendo "Salvar como PDF" no navegador.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Browser Printing (Triggers optimized A4 native print sheet)
  const handleDirectPrint = () => {
    window.print();
  };

  if (SHOW_LOCK_SCREEN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-slate-900/95 p-8 text-center shadow-2xl shadow-black/40">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso bloqueado</h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            Sua empresa foi banida do uso da aplicação. Por favor, contatar o administrador Warleandro Nascimento.
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.3em] text-red-400">
            Bloqueio ativo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* NAVIGATION HEADER BAR */}
      <header className="no-print flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-inner italic">
            V
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              VisualPro <span className="text-indigo-600">OS</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Módulo de Produção v4.2
            </p>
          </div>
        </div>

        {/* Core App Actions */}
        {activeOS && (
          <div className="flex items-center gap-3">

            <div className="hidden xl:flex items-center gap-2 mr-2">
              <button type="button" onClick={handleExportBackup} className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Backup</button>
              <button type="button" onClick={() => importInputRef.current?.click()} className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Restaurar</button>
              <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportBackup} />
            </div>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="px-3.5 py-2 hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold tracking-tight transition"
            >
              Ajuda / Tutorial Ctrl+V
            </button>

            <button
              type="button"
              onClick={handleDirectPrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition active:scale-95"
            >
              Imprimir Direto
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleExportPDF}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Gerar PDF (A4)
                </>
              )}
            </button>
          </div>
        )}
      </header>

      {/* QUICK INSTRUCTIONS BANNER */}
      {showHelp && (
        <div className="no-print bg-indigo-50/75 border-b border-indigo-100 px-6 py-4 animate-fadeIn transition-all">
          <div className="max-w-[1400px] mx-auto flex items-start gap-3 text-indigo-955 text-xs">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm text-indigo-900">💡 Como funciona o fluxo de trabalho do Arte-Finalista para a Produção?</p>
              <p className="leading-relaxed text-indigo-800">
                1. <b>Design Concluído</b>: Quando você terminar a criação no <i>CorelDRAW, Illustrator, Photoshop ou Figma</i>, selecione a imagem do layout e copie-a <b>(Ctrl+C)</b> ou tire um print screen.<br />
                2. <b>Cole no Sistema</b>: Aperte <b>Ctrl + V</b> em qualquer ponto da página. A imagem aparecerá no centro da folha A4 em tempo real!<br />
                3. <b>Especificações do Material</b>: Escolha o material (adesivo, lona, etc.) e preencha as dimensões exatas de largura e altura. O metro quadrado (m²) e acabamentos serão marcados no painel.<br />
                4. <b>Imprima ou Baixe o PDF</b>: Clique em <b>"Gerar PDF (A4)"</b> para salvar ou clique em <b>"Imprimir Direto"</b> para imprimir fisicamente e entregar pronto à equipe de fábrica.
              </p>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="ml-auto text-indigo-600 hover:text-indigo-850 font-bold px-2 py-1 text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* DETAILED SERVICE WORKSPACE BOARD */}

      <main className="flex-1 max-w-[1640px] w-full mx-auto p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        <section className="no-print grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Ordens cadastradas', value: counts.total, icon: FileText, tone: 'text-indigo-600 bg-indigo-50' },
            { label: 'Em rascunho', value: counts.draft, icon: Clipboard, tone: 'text-slate-600 bg-slate-100' },
            { label: 'Na produção', value: counts.production, icon: Layers, tone: 'text-amber-600 bg-amber-50' },
            { label: 'Concluídas', value: counts.completed, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
            { label: 'Prazo vencido', value: counts.overdue, icon: Clock3, tone: counts.overdue ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-100' }
          ].map((item) => { const Icon = item.icon; return <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3"><div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + item.tone}><Icon className="w-4 h-4" /></div><div><div className="text-xl font-black text-slate-900 leading-none">{item.value}</div><div className="text-[10px] text-slate-500 font-semibold mt-1">{item.label}</div></div></div>; })}
        </section>
        {storageError && <div className="no-print rounded-lg border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-xs font-semibold">O navegador não conseguiu salvar as alterações. Exporte um backup e libere espaço antes de continuar.</div>}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        
        {/* SIDEBAR Column 1: DB History & Actions (col-span-3) */}
        <section className="no-print lg:col-span-3 space-y-4 h-full">
          {orders.length > 0 && (
            <OSHistory
              orders={orders}
              activeId={activeOSId}
              onSelect={(id) => setActiveOSId(id)}
              onCreateNew={handleCreateNew}
              onDelete={handleDeleteOS}
              onDuplicate={handleDuplicateOS}
            />
          )}

          {/* Quick instructions widget card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
              Agilidade na Fábrica
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Gerar a folha A4 com a <b>foto da arte</b> e <b>caixas marcadas</b> economiza erros de produção de comunicação visual em até 80%! Evite que colaboradores façam cortes com as medidas trocadas.
            </p>
            <div className="bg-indigo-50/50 p-2.5 rounded-lg text-[10px] text-indigo-950 flex items-center gap-2 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>O.S. Pronta para fixar no material físico!</span>
            </div>
          </div>
        </section>

        {/* Column 2: O.S Dynamic Inputs Editor (col-span-5) */}
        <section className="no-print lg:col-span-5 space-y-4">
          {activeOS ? (
            <OSForm 
              activeOS={activeOS} 
              onChange={handleOSChange} 
            />
          ) : (
            <div className="bg-white p-8 text-center rounded-2xl border text-slate-400">
              Carregando dados do sistema...
            </div>
          )}
        </section>

        {/* Column 3: Live Printable A4 Simulation Preview Panel (col-span-4) */}
        <section className="lg:col-span-4 bg-slate-200/50 p-2 md:p-4 rounded-xl border border-slate-200 w-full overflow-hidden flex flex-col items-center">
          <div className="no-print mb-2.5 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-200 px-2 py-1 rounded">
              📃 GABARITO IMPRESSÃO A4 (100%)
            </span>
          </div>
          {activeOS ? (
            <div className="w-full overflow-x-auto pb-4 scrollbar-thin flex justify-center">
              <div className="min-w-[794px] w-[794px]">
                {/* Printable Area component */}
                <OSPreview activeOS={activeOS} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-2xl border text-slate-400">
              Nenhuma O.S. ativa.
            </div>
          )}
        </section>

      </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="no-print px-6 py-2.5 bg-slate-900 text-slate-400 flex justify-between items-center text-[10px] font-medium border-t border-slate-950 mt-auto">
        <div className="flex gap-4">
          <span>SISTEMA: ONLINE</span>
          <span>PILOTO COPIADO (CTRL+V): MONITORANDO</span>
          <span>ARMAZENAMENTO: NESTE NAVEGADOR</span>
        </div>
        <div className="flex gap-2 items-center font-semibold text-slate-300">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          SALVAMENTO LOCAL ATIVO
        </div>
      </footer>

      <footer className="no-print bg-white border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="text-center sm:text-left"><p className="font-semibold text-slate-700">Desenvolvido por <span className="text-indigo-600">Warleandro Nascimento</span></p><p className="text-[11px] mt-0.5">Gerador de OS · Ferramenta independente para comunicação visual</p></div>
        <div className="flex items-center gap-4"><a href="https://instagram.com/warleandro._" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-indigo-600 transition"><Instagram className="w-4 h-4" /> @warleandro._</a><a href="https://wa.me/5563999318046" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition"><MessageCircle className="w-4 h-4" /> WhatsApp</a></div>
      </footer>
    </div>
  );
}
