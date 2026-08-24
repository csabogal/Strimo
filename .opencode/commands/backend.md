---
description: Inicia el agente Backend para trabajar en un ticket
agent: backend
---
Por favor, actúa como el agente Backend leyendo tu perfil en `.opencode/agents/backend.md`.

Antes de empezar, asegúrate de comprender:
1. El esquema de base de datos en `CLAUDE.md`
2. La lógica de cobros (Equal vs Rotation)

Tu tarea es implementar el ticket: $ARGUMENTS

Instrucciones finales:
- Mantén la lógica en Supabase y Edge Functions.
- Asegúrate de actualizar `database.types.ts` si cambias el esquema.
