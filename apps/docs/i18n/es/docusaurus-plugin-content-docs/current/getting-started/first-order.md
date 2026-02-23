---
sidebar_position: 4
slug: /getting-started/first-order
title: Tu Primera Orden
---

# Tu Primera Orden

Sigue esta guia paso a paso para realizar tu primer pedido de principio a fin.

## 1. Iniciar Sesion

1. Abre el POS en tu navegador
2. Ingresa tu PIN de empleado (ej., `1234` para el Manager demo)
3. Llegaras a la **Pantalla del POS**

## 2. Armar el Pedido

1. **Selecciona una categoria** de las pestanas superiores (ej., "Tacos")
2. **Toca un articulo** para agregarlo al carrito
3. Si el articulo tiene **modificadores**, aparecera un popup — selecciona tus opciones y confirma
4. Repite para articulos adicionales
5. Ajusta cantidades usando los botones **+/-** en el carrito

:::tip Acciones Rapidas
- Toca un articulo en el carrito para agregar una **nota** (ej., "sin cebolla")
- Desliza a la izquierda sobre un articulo del carrito para **eliminarlo**
:::

## 3. Revisar el Carrito

El carrito muestra:
- Cada articulo con modificadores y notas
- Subtotales por articulo
- **Subtotal** antes de impuestos
- **IVA (16%)**
- **Total** en MXN

## 4. Procesar Pago

1. Toca **Cobrar** para abrir el modal de pago
2. Elige tu metodo de pago:

### Pago en Efectivo
1. Selecciona **Efectivo**
2. Ingresa el monto recibido
3. El sistema calcula el cambio automaticamente
4. Toca **Completar Pago**

### Pago con Tarjeta
1. Selecciona **Tarjeta**
2. Stripe procesa el pago
3. Espera la confirmacion
4. Toca **Completar Pago**

### Pago Dividido
1. Selecciona **Dividir**
2. Ingresa la porcion en efectivo
3. El saldo restante va a tarjeta
4. Completa ambas transacciones

## 5. Imprimir Ticket (Opcional)

Despues del pago, aparece el modal del ticket:
- Toca **Imprimir** para enviar a tu impresora de tickets
- Toca **Listo** para cerrar

## 6. Vista de Cocina

1. El pedido aparece automaticamente en la **Pantalla de Cocina**
2. El personal de cocina ve el pedido con todos los articulos y modificadores
3. Marcan los articulos como **en preparacion** > **listo**
4. El estado del pedido se actualiza: `pending` → `confirmed` → `preparing` → `ready` → `completed`

## Resumen del Flujo de Pedido

```
Cliente ordena → Pantalla POS → Pago → Pantalla de Cocina → Listo → Completado
                                  │
                                  ├── Efectivo (instantaneo)
                                  ├── Tarjeta (Stripe)
                                  └── Dividido (Efectivo + Tarjeta)
```

Felicidades — completaste tu primer pedido! Dirígete a [Operaciones del POS](../feature-guides/pos-operations) para la guia completa.
