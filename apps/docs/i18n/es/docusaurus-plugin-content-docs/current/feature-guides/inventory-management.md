---
sidebar_position: 4
slug: /feature-guides/inventory-management
title: Gestion de Inventario
---

# Gestion de Inventario

Rastrea ingredientes, administra niveles de stock, maneja ordenes de compra y monitorea relaciones con proveedores.

## Articulos de Inventario

### Agregar Articulos de Inventario
1. Ve a **Inventario** > **Articulos**
2. Toca **Agregar Articulo**
3. Llena:
   - **Nombre**: Nombre del ingrediente (ej., "Tortillas de Maiz")
   - **Unidad**: Unidad de medida (kg, litros, piezas, etc.)
   - **Stock actual**: Cantidad inicial
   - **Stock minimo**: Umbral de alerta
   - **Costo por unidad**: Costo de compra para seguimiento

### Alertas de Stock

Cuando un articulo cae por debajo de su nivel de **stock minimo**, aparece como advertencia en el tablero de inventario. Los gerentes reciben notificaciones para hacer reorden.

## Vincular Ingredientes a Articulos del Menu

Conecta articulos de inventario a articulos del menu para que el stock se descuente automaticamente cuando se realizan pedidos:

1. Abre un articulo del menu
2. Ve a la pestana de **Ingredientes**
3. Agrega cada ingrediente con la cantidad utilizada por porcion
4. Cuando se ordena este articulo, el stock del ingrediente disminuye automaticamente

## Ordenes de Compra

### Crear una Orden de Compra
1. Ve a **Inventario** > **Ordenes de Compra**
2. Toca **Nueva Orden**
3. Selecciona un **proveedor**
4. Agrega articulos y cantidades
5. Envia la orden

### Recibir Stock
1. Abre una orden de compra pendiente
2. Ingresa las cantidades realmente recibidas
3. Confirma la recepcion — los niveles de stock se actualizan automaticamente

## Proveedores

Administra tus proveedores:
1. Ve a **Inventario** > **Proveedores**
2. Agrega proveedores con informacion de contacto
3. Asocia proveedores con articulos de inventario
4. Rastrea el historial de compras por proveedor

## Insights Impulsados por IA

El sistema de inventario se integra con la [Capa de Inteligencia IA](./ai-features):
- **Seguimiento de velocidad**: Monitorea que tan rapido se consumen los ingredientes
- **Sugerencias de empuje de inventario**: Recomienda promocionar articulos que usan ingredientes proximos a vencer
- **Deteccion de merma**: Senala discrepancias inusuales en el inventario
- **Pronostico de preparacion**: Predice necesidades de ingredientes basandose en patrones historicos
