---
sidebar_position: 2
slug: /feature-guides/kitchen-display
title: Pantalla de Cocina
---

# Pantalla de Cocina

El Sistema de Pantalla de Cocina (KDS) muestra los pedidos entrantes en tiempo real para el personal de cocina y bar.

## Configuracion

1. Abre el POS en una tablet o monitor dedicado a la cocina
2. Inicia sesion con un PIN de rol **Cocina** o **Bar**
3. La pantalla muestra automaticamente la cola de pedidos correspondiente

## Como Funciona

### Flujo de Pedidos

Cuando un cajero del POS confirma un pedido:

1. El pedido aparece en la pantalla de cocina al instante
2. Cada articulo se muestra con sus modificadores y notas especiales
3. El personal de cocina toca un articulo cuando comienza a **prepararlo**
4. Cuando todos los articulos estan listos, el pedido pasa a estado **listo**

### Tarjetas de Pedido

Cada tarjeta de pedido muestra:
- **Numero de pedido** (ej., #0042)
- **Origen del pedido** (POS, Uber Eats, Rappi, DiDi Food)
- **Tiempo transcurrido** desde que se realizo el pedido
- **Articulos** con modificadores y notas
- **Indicadores de prioridad** para pedidos urgentes

### Progresion de Estados

```
Nuevo Pedido → En Preparacion → Listo → Completado
```

Toca una tarjeta de pedido para avanzar su estado. La codificacion de colores ayuda a identificar la urgencia:
- **Blanco**: Recien llegado
- **Amarillo**: Acercandose al tiempo objetivo
- **Rojo**: Atrasado

## Pantalla de Bar

El personal que inicia sesion con el rol **Bar** ve unicamente los articulos de bebidas de los pedidos. Esto permite que la preparacion de bebidas ocurra en paralelo con la preparacion de comida.

## Consejos

- Monta la pantalla a la altura de los ojos del personal de cocina
- Usa una pantalla lo suficientemente grande para mostrar 4-6 pedidos simultaneamente
- Considera una tablet dedicada que se mantenga con sesion iniciada en el rol de Cocina
