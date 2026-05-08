# Análise de UX - Redução de Confusão

Data: 08/05/2026

## Diagnóstico geral

O sistema já tem os módulos principais, mas a experiência ainda parece confusa porque o usuário precisa entender a estrutura antes de conseguir agir. Para validação comercial, o produto precisa parecer mais guiado: o adestrador deve entrar e saber qual é o próximo passo; o tutor deve abrir o portal e entender rapidamente o que precisa fazer em casa.

## Problemas que mais confundem

### 1. Login e demo bloqueiam o primeiro contato

No teste local, o login falhou por falta de `AUTH_SECRET`/secret do NextAuth, gerando `error=Configuration`. Para uma demo comercial, isso é crítico: o cliente acha que o sistema está quebrado antes de avaliar o produto.

Melhoria recomendada:
- Criar modo demo visual quando variáveis de ambiente estiverem ausentes.
- Mostrar botões rápidos: Entrar como Adestrador, Entrar como Tutor, Entrar como Admin.
- Melhorar a mensagem de erro de login para não expor erro técnico.

Prioridade: Alta.

### 2. Termos misturados

Ainda aparecem termos diferentes para a mesma coisa: tutor, cliente, cliente humano, cachorro, cão, pet. Isso cria ruído mental para adestrador e tutor.

Padrão recomendado:
- Para quem paga/contrata: `Tutor`.
- Para a ficha comercial: `Cliente` pode aparecer como contexto interno, mas o rótulo principal deve ser `Tutor`.
- Para o animal: usar sempre `Cão`.
- Evitar `cachorro` e `pet` nas telas principais.

Prioridade: Alta.

### 3. Menu do adestrador está longo demais

O menu atual mostra muitos módulos no mesmo nível: Dashboard, Clientes, Agenda, Treinos, Portal, IA, Plano, Tutorial, Configurações. Para um usuário novo, tudo parece igualmente importante.

Melhoria recomendada:
- Transformar a navegação em 4 grupos:
  - Hoje: Dashboard e Agenda.
  - Atendimentos: Tutores/Cães e Treinos.
  - Relacionamento: Portal do Tutor e IA.
  - Conta: Plano, Configurações e Tutorial.
- No mobile, mostrar primeiro as ações principais, não todos os módulos.

Prioridade: Alta.

### 4. O dashboard mostra dados, mas deveria guiar o trabalho

O dashboard tem próximos atendimentos, estatísticas e atalhos, mas ainda parece uma vitrine de módulos. O adestrador precisa de um roteiro operacional.

Melhoria recomendada:
- Criar um painel `Próxima ação` no topo:
  - Se não tem tutor: `Cadastre o primeiro tutor`.
  - Se tem tutor sem aula: `Agende a primeira aula`.
  - Se aula acabou: `Registrar treino`.
  - Se treino registrado: `Enviar portal ao tutor`.
- Mostrar apenas 1 ação principal por vez.

Prioridade: Alta.

### 5. Cadastro de tutor e cão ainda está em uma tela densa

A tela de Clientes tenta resolver lista, filtros, estatísticas, cadastro, foto e vínculo com cão no mesmo espaço. Isso é poderoso, mas para usuário novo parece muita coisa.

Melhoria recomendada:
- Criar fluxo em etapas:
  1. Dados do tutor.
  2. Dados do cão.
  3. Objetivo do treino.
  4. Primeiro agendamento opcional.
- Manter a lista de tutores separada do formulário de cadastro.

Prioridade: Alta.

### 6. Agenda e Treinos duplicam ações

Na Agenda existe `Iniciar`, `Registro` e WhatsApp; em Treinos também existe `Iniciar`, `Registro` e WhatsApp. O adestrador pode não saber onde começa de verdade.

Melhoria recomendada:
- Agenda deve responder: `quando e com quem é a aula`.
- Treinos deve responder: `o que aconteceu na aula`.
- Na Agenda, o botão principal deve ser só `Registrar aula`.
- Remover duplicação entre `Iniciar` e `Registro`, usando um único CTA.

Prioridade: Alta.

### 7. IA aparece como módulo separado, mas deveria estar dentro do treino

O Assistente IA é útil, mas separado do fluxo. Para o adestrador, a pergunta natural é: `terminei a aula, como gero resumo e próximo treino?`

Melhoria recomendada:
- Dentro do registro de treino, adicionar uma seção `Resumo e próxima aula`.
- A rota `/ia` pode continuar existindo, mas como apoio avançado.
- Botões simples: `Gerar resumo`, `Salvar lembrete`, `Sugerir próxima aula`.

Prioridade: Média.

### 8. Portal do tutor precisa ser mais simples que o painel do adestrador

O tutor não quer entender o sistema. Ele quer saber o que fazer em casa, quando será a próxima aula e como o cão evoluiu.

Melhoria recomendada para a primeira dobra do portal:
- Nome e foto do cão.
- Próxima aula.
- Tarefa de hoje.
- Botão `Marcar como feito`.
- Depois disso: galeria, avaliações, comentários e gamificação.

Prioridade: Alta.

### 9. Tutorial ajuda, mas não substitui orientação dentro das telas

A página de tutorial é útil, mas se o usuário precisa abrir tutorial para usar o sistema, a interface ainda está pesada.

Melhoria recomendada:
- Usar pequenos estados vazios em cada tela.
- Exemplo: em Treinos sem registros, mostrar `Cadastre um tutor e agende uma aula para começar` com botão direto.
- Criar mensagens contextuais curtas, não textos longos.

Prioridade: Média.

## Melhorias sugeridas por tela

### Login

- Adicionar botões de acesso demo.
- Explicar em uma linha o papel de cada perfil.
- Resolver `MissingSecret` para demos locais.

### Dashboard

- Trocar estatísticas como foco principal por `Próxima ação`.
- Reduzir atalhos visíveis.
- Criar uma linha do tempo do atendimento atual: Tutor cadastrado > Aula agendada > Treino registrado > Portal enviado.

### Clientes/Tutores

- Renomear para `Tutores e cães`.
- Separar lista e cadastro.
- Formulário em etapas.
- Botão principal: `Novo tutor`.
- Botão secundário: `Adicionar cão a tutor existente`.

### Agenda

- Foco em calendário e aula.
- Botão único em cada aula: `Registrar aula`.
- Status com nomes mais humanos: `Agendada`, `Em andamento`, `Concluída`, `Cancelada`.

### Treinos

- Mostrar histórico por cão.
- Registro de treino como fluxo guiado: resumo, avaliação, fotos, tarefa para casa, próximo passo.
- Integrar IA no fim do registro.

### Portal do Tutor

- Primeira tela focada em tarefa e próxima aula.
- Galeria depois da tarefa.
- Gamificação mais discreta e ligada às ações: tarefa feita, vídeo visto, avaliação enviada.

### Planos/Financeiro

- Separar `Meu Plano` do financeiro do tutor, se existir no futuro.
- Para este protótipo, manter simples: plano atual, pacote de aulas e pagamento.

### Tutorial

- Manter como apoio.
- Adicionar links diretos para cada tarefa.
- Idealmente abrir como `Ajuda rápida` dentro da tela atual.

## Plano de ação recomendado

### Fase 1 - Reduzir confusão sem refazer o sistema

1. Padronizar termos: Tutor e Cão.
2. Encurtar menu e agrupar módulos.
3. Criar `Próxima ação` no dashboard.
4. Simplificar CTAs duplicados de Agenda/Treinos.
5. Ajustar portal do tutor para começar por tarefa de casa.

### Fase 2 - Melhorar fluxo de cadastro e atendimento

1. Transformar cadastro de tutor/cão em etapas.
2. Criar roteiro do caso: cadastro > agenda > treino > portal.
3. Integrar IA dentro do registro de treino.

### Fase 3 - Melhorar onboarding e demo comercial

1. Botões de login demo.
2. Dados mockados mais consistentes para apresentação.
3. Tour guiado curto na primeira entrada.

## Conclusão

O problema principal não é falta de funcionalidade. É excesso de caminhos e pouca hierarquia. A melhor melhoria agora é transformar o sistema em um fluxo guiado de atendimento, com uma ação principal por momento. Isso vai fazer o adestrador sentir que o sistema conduz a rotina, e o tutor sentir que o portal mostra exatamente o que precisa fazer.