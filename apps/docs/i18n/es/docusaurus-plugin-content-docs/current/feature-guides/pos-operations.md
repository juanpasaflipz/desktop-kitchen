---
sidebar_position: 1
slug: /feature-guides/pos-operations
title: Operaciones del POS
---

# Operaciones del POS

La pantalla del POS es la interfaz principal para tomar pedidos y procesar pagos.

## Tomar Pedidos

### Navegar el Menu

La pantalla del POS muestra las categorias del menu como pestanas en la parte superior. Toca una categoria para ver sus articulos. Cada articulo muestra su nombre, precio y estado de disponibilidad.

### Agregar Articulos al Carrito

- **Toca un articulo** para agregar uno al carrito
- Si el articulo tiene **grupos de modificadores**, aparece un modal para personalizacion
- **Controles de cantidad** (+/-) en el carrito ajustan las cantidades
- **Notas**: Toca un articulo del carrito para agregar instrucciones especiales (ej., "extra picante", "sin cilantro")

### Modificadores

Cuando un articulo tiene grupos de modificadores asignados:

1. Los grupos obligatorios deben tener una seleccion antes de continuar
2. Los grupos opcionales se pueden omitir
3. Cada opcion de modificador puede tener un **ajuste de precio** (positivo o negativo)
4. Se pueden permitir multiples selecciones dependiendo de la configuracion del grupo

### Combos

Los combos aparecen en el menu junto a los articulos regulares:

1. Toca un combo para comenzar a armarlo
2. Llena cada **slot** (ej., elige un principal, un complemento, una bebida)
3. Cada slot restringe las opciones a categorias o articulos especificos
4. El combo tiene un precio fijo sin importar los precios individuales de los articulos

## Pagos

### Efectivo

1. Toca **Cobrar**
2. Selecciona **Efectivo**
3. Ingresa el monto recibido
4. El sistema muestra el cambio a devolver
5. Completa la transaccion

### Tarjeta (Stripe)

1. Toca **Cobrar**
2. Selecciona **Tarjeta**
3. Stripe procesa el PaymentIntent
4. Espera la confirmacion
5. La transaccion queda registrada

### Pagos Divididos

1. Toca **Cobrar**
2. Selecciona **Dividir**
3. Ingresa la porcion en efectivo
4. El monto restante se cobra a la tarjeta
5. Ambas transacciones se registran contra el pedido

## Gestion de Pedidos

### Estados de Pedido

| Estado | Significado |
|--------|------------|
| `pending` | Pedido creado, aun no confirmado |
| `confirmed` | Pago recibido, enviado a cocina |
| `preparing` | La cocina esta trabajando en el |
| `ready` | Listo para recoger/servir |
| `completed` | Entregado al cliente |
| `cancelled` | Pedido cancelado |

### Reembolsos

Los gerentes pueden emitir reembolsos en pedidos completados con tarjeta:
1. Encuentra el pedido en la lista de **Pedidos**
2. Toca **Reembolsar**
3. El reembolso se procesa a traves de Stripe
4. El estado del pedido se actualiza a `refunded`

## Modo Offline

El POS sigue funcionando cuando no hay internet disponible:

- Los datos del menu se almacenan localmente via IndexedDB
- Los **pedidos en efectivo** se pueden crear sin conexion con numeracion `OFF-NNN`
- Los pedidos se guardan en cola localmente y se **sincronizan automaticamente** cuando regresa la conectividad
- Los pagos con tarjeta requieren conexion a internet

:::caution
Los pedidos offline son solo en efectivo. Los pagos con tarjeta no se pueden procesar sin conexion a internet.
:::
