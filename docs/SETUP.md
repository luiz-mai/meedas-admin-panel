# Implantação do painel administrativo

O checkout existente é `meedas-admin-panel` (o dashboard mencionado no planejamento).
Requer Node >=22. O painel é um cliente do backend; nenhuma chave administrativa do Supabase, Stripe ou crawler deve ser configurada neste projeto.

## Ordem de ativação

1. No **meedas-app**, aplicar a migration `20261108145527_admin_dashboard.sql` depois das migrations anteriores. O `schema.sql` completo já a contém para instalações novas; não reaplicar o schema destrutivo em um banco existente.
2. Publicar o backend do meedas-app com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SECRET_KEY`. O endpoint `/api/admin/v1/session` deve responder 401 quando chamado sem token.
3. Cadastrar os administradores via SQL confiável (abaixo).
4. Importar este repositório na Vercel como aplicação Next.js. Configurar as três variáveis de `.env.example` com o mesmo projeto Supabase do app e a origem HTTPS do backend.
5. Configurar o template de e-mail Supabase para conter `{{ .Token }}`. O painel usa o código digitado, sem cadastro e sem callback por link. O usuário precisa ter uma conta Meedas existente.
6. Publicar o painel e verificar login ADMIN, rejeição de usuário comum, edição de loja, auditoria e revogação.

O painel faz as chamadas ao backend **no servidor**, usando o access token do usuário. Cookies não são compartilhados entre os dois sites. Não é necessário CORS nem colocar tokens no armazenamento JavaScript do dashboard. O backend valida o token com Supabase Auth e lê a permissão atual no banco em cada chamada.

## Conceder e revogar ADMIN

Execute no SQL Editor do Supabase como proprietário do projeto. Troque somente o e-mail:

```sql
insert into public.admin_accounts (user_id, role)
select id, 'ADMIN' from auth.users where lower(email) = lower('seu-email@dominio.com')
on conflict (user_id) do update set role = excluded.role;

-- Confirmar a concessão (zero linhas inseridas significa conta inexistente).
select u.id, u.email, a.role
from public.admin_accounts a join auth.users u on u.id = a.user_id;
```

Revogação:

```sql
delete from public.admin_accounts
where user_id in (select id from auth.users where lower(email) = lower('seu-email@dominio.com'));
```

A revogação bloqueia a próxima chamada ao backend, mesmo com JWT ainda válido. `user_metadata`, nomes e alegações enviadas pelo navegador não concedem acesso. A tabela não é acessível por `anon`/`authenticated`; não há API de concessão de ADMIN.

## Desenvolvimento e validação

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

Testes de navegador requerem o checkout `../meedas-app` com dependências instaladas. O Playwright inicia dois Next.js e um Supabase simulado local com Postgres/PGlite e fixtures de teste. Ele chama o backend real do app, suas validações e a RPC SQL real; não acessa produção ou serviços pagos.

```sh
# Chromium instalado em /usr/bin/chromium; sobrescreva CHROMIUM_PATH se necessário.
npm run test:e2e
```

Testes verificam login OTP local, usuário comum rejeitado mesmo com metadata ADMIN, paginação, busca, edição persistida, auditoria, todas as seções, revogação de acesso e largura mobile. A simulação não substitui teste do envio de OTP e dos relacionamentos PostgREST no projeto de destino.

## Escopo da primeira versão

- Consulta paginada de lojas, programas, observações/evidências, coletas, contas, alertas, entregas, assinaturas, riscos e auditoria.
- Busca de contas por UUID; busca textual nas seções em que o campo é indicado.
- Resumo de contagens atuais e última publicação por programa, com cobertura separada do sucesso.
- Edição de nome e ativação/desativação de lojas/programas, com justificativa e controle de concorrência.
- As demais seções são de consulta. Não há concessão manual de Plus, correção de valores de pontuação, reenvio de e-mails, disparo de crawler ou resolução financeira por esta interface.
- O log registra as alterações efetuadas por esta API; operações externas no SQL Editor, Supabase, Stripe e GitHub não são capturadas por ele.
- As datas usam America/Sao_Paulo. Dados de teste/produção de assinaturas são identificados separadamente.
- Estados de plano são os persistidos; não se presume acesso efetivo ou receita a partir de uma linha de assinatura. Não há métricas de receita inventadas.
- A interface apresenta a cobertura persistida no banco. Motivos detalhados de lojas ignoradas que existam apenas em artefatos do GitHub ainda exigem consulta ao crawler.
