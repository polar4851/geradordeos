# VisualPro OS

Sistema para criação e organização de ordens de serviço voltado à rotina de produção de comunicação visual.

O VisualPro OS reúne as informações do pedido, as especificações dos materiais e a referência visual da arte em uma folha de produção pronta para impressão.

## Recursos

- Cadastro e edição de ordens de serviço.
- Histórico de ordens, com opções para criar, duplicar e excluir registros.
- Informações do cliente, prazos, responsáveis e dados da empresa.
- Especificação de materiais, dimensões, quantidade, recorte, acabamento e aplicação.
- Inclusão de imagem da arte por seleção ou usando **Ctrl + V**.
- Pré-visualização da ordem em formato A4.
- Exportação da ordem de serviço em PDF.
- Impressão direta pelo navegador.
- Salvamento dos registros no armazenamento local do navegador.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- jsPDF
- html-to-image
- Lucide React

## Executar localmente

**Requisitos:** Node.js e npm.

1. Clone o repositório:

   ```bash
   git clone https://github.com/polar4851/geradordeos.git
   ```

2. Entre na pasta do projeto:

   ```bash
   cd geradordeos
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse o endereço exibido no terminal. Por padrão, o Vite utiliza a porta **3000**.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Gera a versão de produção na pasta `dist`. |
| `npm run preview` | Executa uma prévia da versão de produção. |
| `npm run lint` | Verifica os tipos TypeScript. |

## Armazenamento dos dados

As ordens são armazenadas no `localStorage` do navegador. Isso significa que os registros ficam vinculados ao navegador e ao dispositivo utilizados. Limpar os dados do navegador pode apagar essas informações.

**Atenção:** o armazenamento local não substitui um sistema de backup ou banco de dados centralizado. Para preservar os registros, evite limpar os dados do site sem antes manter uma cópia das informações importantes.

## Fluxo de utilização

1. Crie uma nova ordem de serviço.
2. Preencha os dados do cliente e as informações de produção.
3. Adicione a imagem da arte. Também é possível copiar a imagem e colá-la na página com **Ctrl + V**.
4. Confira a pré-visualização da folha A4.
5. Gere o PDF ou envie a ordem diretamente para impressão.

---

Desenvolvido para facilitar a comunicação entre atendimento, arte-final e produção.
