# Plano de Implementação — Autenticação Completa

## 1. Login (Autenticação)
- [x] Criar rota POST /auth/login
- [x] Validar e-mail e senha
- [x] Gerar e retornar JWT (com expiração)
- [x] Mensagens de erro i18n

## 2. Recuperação de Senha
- [ ] Rota POST /auth/forgot-password (envia e-mail com token)
- [ ] Rota POST /auth/reset-password (recebe token + nova senha)
- [ ] Token de recuperação com expiração
- [ ] Mensagens de sucesso/erro i18n

## 3. Verificação de E-mail
- [x] Enviar e-mail de verificação após cadastro
- [x] Rota POST /auth/verify-email (token no body)
- [x] Marcar usuário como verificado
- [x] Mensagens i18n

## 4. Logout
- [ ] (Opcional) Blacklist de tokens ou expiração no front-end

## 5. Proteção de Rotas
- [x] Middleware para validar JWT
- [x] Decorador/validação de roles (admin, employee, etc)
- [x] Mensagens i18n para acesso negado

## 6. Troca de Senha (Usuário Autenticado)
- [ ] Rota POST /auth/change-password
- [ ] Validar senha antiga e nova
- [ ] Mensagens i18n

## 7. Limite de Tentativas (Rate Limit/Brute Force)
- [ ] Implementar proteção contra brute force no login
- [ ] Mensagens i18n

## 8. Auditoria e Logs de Acesso
- [ ] Registrar tentativas de login, aceite de convite, etc.
- [ ] Logs de sucesso e falha

## 9. Internacionalização Completa
- [ ] Garantir todas as mensagens cobertas por i18n
- [ ] Revisar respostas de todas as rotas

## 10. Testes Automatizados
- [x] Testes unitários para todos os casos de uso principais
- [ ] Testes de integração para fluxos principais

---

**Observações:**
- Priorizar login, recuperação de senha e proteção de rotas.
- Validar flows com front-end.
- Atualizar documentação conforme implementação.
