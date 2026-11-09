# Meedas Admin

Dashboard administrativo Next.js para operação do Meedas, acessível somente a usuários ADMIN definidos no banco. Consome a API versionada do **meedas-app** no servidor, sem acesso privilegiado direto ao banco.

Veja [configuração, concessão de ADMIN e escopo](docs/SETUP.md).

```sh
npm ci
npm run dev
```

Configure `.env.local` conforme `.env.example`. Não há dados fictícios ou bypass de acesso na aplicação. Fixtures existem somente nos testes locais.

### Desempenho

O proxy usa validação de claims para renovação da sessão e não processa imagens/fontes. O cliente Supabase é deduplicado apenas dentro da renderização atual. A autorização ADMIN continua sendo resolvida pelo backend em todas as requisições, sem cache compartilhado de sessão ou dados privados. A tela de coletas usa uma rota própria para separar seu JavaScript das listagens administrativas.
