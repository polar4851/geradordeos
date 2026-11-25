<div align="center">

# Gerador de OS

**Organização de ordens de serviço para empresas de comunicação visual.**

![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

</div>

---

## Sobre o projeto

O Gerador de OS reúne em uma única tela as informações necessárias para encaminhar um trabalho da etapa de atendimento e arte-final para a produção. A ordem pode ser conferida em uma prévia A4, exportada em PDF ou impressa.

## Recursos

- Cadastro, edição, duplicação e exclusão de ordens de serviço.
- Histórico com pesquisa por cliente, número da O.S., vendedor e material.
- Indicadores de ordens cadastradas, rascunhos, produção, concluídas e prazos vencidos.
- Dados da empresa, cliente, contato, vendedor, arte-finalista e datas.
- Materiais e especificações de dimensões, quantidade, recorte, acabamento e aplicação.
- Inclusão de imagem por upload, arrastar e soltar ou colagem com **Ctrl + V**.
- Ajustes de rotação e enquadramento da imagem.
- Pré-visualização em folha A4.
- Exportação em PDF e impressão pelo navegador.
- Backup das ordens em arquivo JSON e restauração a partir desse arquivo.
- Salvamento automático no armazenamento local do navegador.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- jsPDF
- html-to-image
- Lucide React

## Executar localmente

Requisitos: Node.js e npm.

```bash
git clone https://github.com/polar4851/geradordeos.git
cd geradordeos
npm install
npm run dev
```

Abra o endereço exibido no terminal. O servidor de desenvolvimento utiliza a porta 3000 por padrão.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento. |
| `npm run build` | Gera a versão de produção em `dist`. |
| `npm run preview` | Executa uma prévia da versão de produção. |
| `npm run lint` | Verifica os tipos TypeScript. |

## Armazenamento e privacidade

As ordens são armazenadas no `localStorage` do navegador. Não existe sincronização automática entre computadores ou navegadores, nem banco de dados remoto nesta versão.

**Atenção:** limpar os dados do navegador, trocar de dispositivo ou usar outro perfil pode fazer as ordens deixarem de ficar disponíveis. Use regularmente a opção **Backup** para baixar um arquivo JSON e guarde-o em um local seguro. A opção **Restaurar** substitui os registros atuais pelos dados do backup selecionado.

As ordens podem conter dados de clientes. Proteja os arquivos de backup e evite armazenar informações desnecessárias.

## Fluxo recomendado

1. Crie uma nova O.S. e informe os dados da empresa e do cliente.
2. Preencha responsável, prazo, material, medidas e quantidade.
3. Anexe a imagem de referência do trabalho.
4. Confira as especificações e a prévia A4 antes de encaminhar à produção.
5. Gere o PDF ou imprima a ordem.
6. Faça backups periódicos dos registros.

---

## Criador

Desenvolvido por **Warleandro Nascimento**.

- Instagram: [@warleandro._](https://instagram.com/warleandro._)
- WhatsApp: [63 99931-8046](https://wa.me/5563999318046)

