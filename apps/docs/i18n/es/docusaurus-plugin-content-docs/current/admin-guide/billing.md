---
sidebar_position: 1
slug: /admin-guide/billing
title: Facturacion y Suscripciones
---

# Facturacion y Suscripciones

Administra tu plan de suscripcion, metodo de pago e historial de facturacion a traves del portal de facturacion de Stripe.

## Planes

| Funcion | Trial | Starter | Pro |
|---------|-------|---------|-----|
| POS y pedidos | Si | Si | Si |
| Gestion de menu | Si | Si | Si |
| Pantalla de cocina | Si | Si | Si |
| Inventario | - | Si | Si |
| Reportes | Basico | Completo | Completo |
| Integraciones de delivery | - | - | Si |
| Inteligencia de delivery | - | - | Si |
| Sugerencias de IA | - | - | Si |
| Marcas virtuales | - | - | Si |
| Lealtad y CRM | - | Si | Si |
| Marca personalizada | - | - | Si |

## Administrar Tu Suscripcion

### Mejorar Plan
1. Ve a **Configuracion** > **Facturacion**
2. Selecciona el plan al que deseas subir
3. Seras redirigido a Stripe Checkout
4. Completa el pago
5. Tu plan se actualiza inmediatamente

### Bajar de Plan
1. Ve a **Configuracion** > **Facturacion** > **Administrar Suscripcion**
2. Esto abre el Portal de Cliente de Stripe
3. Selecciona un plan inferior
4. El cambio toma efecto al final de tu periodo de facturacion actual

### Cancelar
1. Abre el Portal de Cliente de Stripe desde **Configuracion** > **Facturacion**
2. Cancela tu suscripcion
3. El acceso continua hasta el final del periodo pagado

## Metodos de Pago

Administra metodos de pago a traves del Portal de Cliente de Stripe:
- Agrega o elimina tarjetas de credito/debito
- Establece un metodo de pago predeterminado
- Ve facturas proximas

## Eventos de Facturacion

El sistema maneja estos eventos de facturacion automaticamente:

| Evento | Accion |
|--------|--------|
| Checkout completado | Plan activado, tenant actualizado |
| Suscripcion actualizada | Nivel de plan cambiado |
| Suscripcion eliminada | Revertido a trial |
| Pago fallido | Notificacion enviada, periodo de gracia inicia |

## Facturas

Accede a tu historial completo de facturacion y descarga facturas desde el Portal de Cliente de Stripe.

## Stripe Webhook

El sistema de facturacion depende de un webhook de Stripe para mantenerse sincronizado con cambios en la suscripcion.

**URL del Webhook:** `https://pos.desktop.kitchen/api/billing/webhook`

### Eventos Manejados

| Evento | Accion |
|--------|--------|
| `checkout.session.completed` | Activa el plan, vincula el cliente de Stripe al tenant |
| `customer.subscription.updated` | Actualiza el nivel de plan (starter/pro) |
| `customer.subscription.deleted` | Revierte el tenant al plan trial |
| `invoice.payment_failed` | Registra la falla, inicia periodo de gracia |

### Configuracion

1. En el [Dashboard de Stripe](https://dashboard.stripe.com/webhooks), crea un endpoint apuntando a `https://pos.desktop.kitchen/api/billing/webhook`
2. Selecciona los cuatro eventos listados arriba
3. Copia el signing secret y establecelo como la variable de entorno `STRIPE_WEBHOOK_SECRET`

:::caution Se requiere body crudo
La ruta del webhook esta montada **antes** del middleware `express.json()` para que Stripe pueda verificar la firma del body crudo de la solicitud. Si agregas middleware de parseo de body global, asegurate de que la ruta del webhook quede excluida.
:::
