## **Estado Atual de Segurança & Middlewares**

**Situação: 🔴 CRÍTICO — Rotas desprotegidas**

---

### **✅ O que está implementado**

**1. Middlewares de Autenticação**
- authenticate.ts — valida JWT token, extrai `user.id`, `user.role`, `user.tenantId`
- requireRole.ts — verifica se o role do usuário está permitido (ex: `super_admin`, `admin`, `employee`, `donator`)
- UnauthorizedError — retorna 401 para token inválido

**2. Exemplo Correto de Proteção**
```typescript
// ✅ Está protegido
POST /tenants - usa: preHandler: [authenticate, requireRole("super_admin")]
```

**3. Configuração JWT**
- Secret definido em env.ts (com default hardcoded — problema!)
- TTL: 1 dia

**4. CORS Registrado**
```typescript
app.register(fastifyCors, {
  origin: true,  // ⚠️ Muito permissivo!
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});
```

---

### **❌ Problemas Críticos**

| Rota | Status | Risco |
|------|--------|-------|
| `POST /raw-milk` | 🔓 Aberto | Qualquer um cria coleta de leite |
| `PATCH /raw-milk/:id/approve` | 🔓 Aberto | Qualquer um aprova leite |
| `POST /pasteurization-batches` | 🔓 Aberto | Qualquer um cria lote |
| `PATCH /pasteurization-batches/:id/approve` | 🔓 Aberto | Qualquer um aprova lote |
| `POST /pasteurized-milk` | 🔓 Aberto | Qualquer um cria unidade |
| `PATCH /pasteurized-milk/:id/distribute` | 🔓 Aberto | Qualquer um distribui leite |
| `POST /donators` | 🔓 Aberto | Qualquer um cria doador |
| `PATCH /donators/:id` | 🔓 Aberto | Qualquer um edita doador |
| `DELETE /donators/:id` | 🔓 Aberto | Qualquer um deleta doador |

**Implicação**: Ninguém precisa fazer login — todos os endpoints estão públicos!

---

### **🔧 Proteções Faltando**

| Item | Status | Impacto |
|------|--------|---------|
| Autenticação em rotas donation | ❌ Não | CRÍTICO |
| Autenticação em rotas donators | ❌ Não | CRÍTICO |
| CORS whitelist | ❌ Não | ALTO (aceita qualquer origem) |
| Helmet.js | ❌ Não | MÉDIO (sem headers de segurança) |
| Rate limiting | ❌ Não | MÉDIO (sem proteção contra brute force) |
| JWT_SECRET obrigatório | ❌ Não | CRÍTICO (tem default hardcoded no código) |
| Middleware `authorize.ts` | 🔨 Vazio | MÉDIO (criado mas não implementado) |

---

### **✨ Recomendações (Ordem de Prioridade)**

**P0 — HOJE (Critical)**
```bash
1. Proteger todas rotas de donation:
   - POST /raw-milk → authenticate + requireRole(["admin", "employee"])
   - PATCH /raw-milk/:id/approve → authenticate + requireRole(["admin", "employee"])
   - POST /pasteurization-batches → authenticate + requireRole(["admin", "employee"])
   - PATCH /pasteurization-batches/:id/approve → authenticate + requireRole(["admin", "employee"])
   - POST /pasteurized-milk → authenticate + requireRole(["admin", "employee"])
   - PATCH /pasteurized-milk/:id/distribute → authenticate + requireRole(["admin", "employee"])

2. Proteger rotas de donators:
   - POST /donators → authenticate + requireRole(["admin", "employee", "super_admin"])
   - PATCH /donators/:id → authenticate + requireRole(["admin", "employee", "super_admin"])
   - DELETE /donators/:id → authenticate + requireRole(["admin", "super_admin"])

3. Forçar JWT_SECRET obrigatório (remover default)
```

**P1 — Próxima Sprint (Important)**
```bash
1. Instalar helmet: pnpm add @fastify/helmet
   - Adicionar headers de segurança (X-Frame-Options, etc)

2. Instalar rate-limit: pnpm add @fastify/rate-limit
   - Limitar tentativas de login (ex: 5/min)

3. Mudar CORS para whitelist:
   origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"]
```

**P2 — Nice-to-have (Audit & Compliance)**
```bash
1. Implementar authorize.ts com regras granulares
2. Adicionar audit log (quem, quê, quando)
3. Refresh tokens (split access + refresh)
```

---

Quer que eu **aplique as proteções P0 agora**? Posso proteger as rotas do módulo donation e donators com autenticação + autorização usando o padrão que já existe em `/tenants`.