---
sidebar_position: 7
slug: /feature-guides/loyalty-crm
title: Lealtad y CRM
---

# Lealtad y CRM

Construye relaciones con tus clientes mediante tarjetas de sellos, mensajeria SMS y programas de referidos.

## Vision General del Programa de Lealtad

El sistema de lealtad rastrea clientes, sus compras y los recompensa por visitas recurrentes.

### Registro de Clientes

Los clientes se crean cuando:
1. Un cajero ingresa su numero de telefono al momento del cobro
2. Aceptan recibir comunicaciones por SMS
3. El sistema crea o encuentra el registro del cliente

Los numeros telefonicos se formatean automaticamente al **formato mexicano E.164** (`+521XXXXXXXXXX`).

## Tarjetas de Sellos

Las tarjetas de sellos digitales reemplazan las tarjetas fisicas de estampas.

### Configuracion

1. Ve a **Lealtad** > **Configuracion**
2. Establece:
   - **Sellos requeridos**: Cuantas compras para una recompensa (ej., 10)
   - **Recompensa**: Que obtienen (ej., articulo gratis, descuento)
   - **Monto minimo**: Valor minimo del pedido para ganar un sello

### Como Funciona

1. El cliente realiza una compra que califica
2. Se registra un **evento de sello** en su tarjeta
3. Cuando los sellos alcanzan el objetivo, se desbloquea la recompensa
4. El cajero aplica la recompensa en la siguiente visita
5. Una nueva tarjeta de sellos comienza automaticamente

## Mensajeria SMS

Envia mensajes dirigidos a clientes de lealtad via Twilio.

### Tipos de Mensaje

- **Mensaje de bienvenida**: Se envia cuando un cliente se registra por primera vez
- **Actualizaciones de sellos**: "Ganaste un sello! Te faltan 3 mas"
- **Notificaciones de recompensa**: "Tu taco gratis esta listo para reclamar!"
- **Ofertas de recaptura**: Dirigidas a clientes solo de delivery (ve [Inteligencia de Delivery](./delivery-intelligence))
- **Campanas personalizadas**: Mensajes promocionales

### Configuracion de SMS

Requiere credenciales de Twilio en tu entorno:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

:::note
El opt-in de SMS se rastrea por cliente. Solo los clientes que han aceptado reciben mensajes. La bandera `sms_opt_in` se establece durante la creacion del cliente.
:::

## Programa de Referidos

Incentiva a los clientes a traer amigos:

1. Cada cliente de lealtad obtiene un codigo de referido unico
2. Cuando un nuevo cliente se registra con un codigo de referido, ambos ganan sellos extra
3. Rastrea las cadenas de referidos en el tablero de lealtad

## Tablero de CRM

El tablero de lealtad muestra:
- **Total de clientes**: Miembros activos de lealtad
- **Tarjetas de sellos activas**: Tarjetas en progreso
- **Recompensas canjeadas**: Total de recompensas reclamadas
- **Mejores clientes**: Mayor frecuencia de visitas y gasto
- **Rendimiento de campanas SMS**: Tasas de entrega y engagement
