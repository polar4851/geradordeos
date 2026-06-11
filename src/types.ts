export type MaterialType = 'Adesivo' | 'Adesivo Perfurado' | 'Lona' | 'PVC' | 'Acrílico' | 'MDF' | 'Banner';

export interface OSDetails {
  recorte?: string;       // ex: Sem Recorte, Recorte de Contorno, Recorte Eletrônico, Recorte Manual
  acabamento?: string;    // ex: Brilho, Fosco, Bainha e Ilhós, Bastão e Cordão, Verniz, Sem Acabamento, Cantos Arredondados
  aplicacao?: string;     // ex: Vidro, Parede, Placa/Chapa, Veículo, Vitrine, Outro
  espessura?: string;     // ex: 1mm, 2mm, 3mm, 5mm, 10mm, Outra 
  tipoCorte?: string;     // ex: Retor/Linear, Router CNC, Corte Laser, Especial/Faca
  observacaoAplicacao?: string; // nota adicional sobre aplicação
}

export interface ServiceOrder {
  id: string;             // UUID ou identificador único
  osNumber: string;       // ID amigável de exibição (ex: OS-1001)
  dataEmissao: string;    // Data de geração
  dataEntrega: string;    // Prazo limite
  clienteNome: string;    // Nome do cliente / Empresa
  clienteContato: string; // Telefone, Email, etc.
  vendedor: string;       // Quem vendeu
  designer: string;       // Arte-finalista responsável
  
  // Especificação do Material
  material: MaterialType;
  largura: number;        // em metros (ex: 1.20)
  altura: number;         // em metros (ex: 0.80)
  quantidade: number;     // unidades a produzir
  
  // Customizações detalhadas conforme o tipo
  detalhes: OSDetails;
  
  // Observações Técnicas Gerais
  observacoes: string;
  
  // Upload ou Print colado (Ctrl+V)
  pastedImage: string | null; // URL base64 da imagem
  imageFit: 'contain' | 'cover';
  imageRotation: number;    // rotação em graus: 0, 90, 180, 270
  
  // Marca / Customização da Empresa de Comunicação Visual
  companyName: string;
  companyPhone?: string;
  status: 'rascunho' | 'producao' | 'concluido';
}
