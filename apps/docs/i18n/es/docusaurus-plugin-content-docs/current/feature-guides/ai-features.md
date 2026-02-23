---
sidebar_position: 8
slug: /feature-guides/ai-features
title: Funciones de IA
---

# Funciones de IA

La capa de inteligencia IA se ejecuta en segundo plano, analizando patrones de ventas y proporcionando sugerencias accionables.

## Como Funciona

Un programador en segundo plano ejecuta **6 trabajos recurrentes**:

| Trabajo | Frecuencia | Proposito |
|---------|-----------|-----------|
| Actualizacion de cache de sugerencias | Periodico | Pre-calcula sugerencias para recuperacion rapida |
| Snapshots por hora | Cada hora | Captura metricas de ventas para analisis de tendencias |
| Seguimiento de pares de articulos | Continuo | Rastrea que articulos se piden juntos |
| Velocidad de inventario | Continuo | Monitorea tasas de consumo de ingredientes |
| Limpieza de cache | Periodico | Elimina datos de sugerencias obsoletos |
| Deteccion de merma | Periodico | Senala discrepancias en el inventario |

## Tipos de Sugerencias

### Sugerencias de Venta Adicional

Basandose en el contenido actual del carrito, la IA sugiere articulos adicionales que el cliente podria querer.

**Como funciona**: El seguimiento de pares de articulos identifica cuales articulos se piden frecuentemente juntos. Cuando un cliente agrega un taco, el sistema podria sugerir agregar guacamole o una bebida.

### Empuje de Inventario

Cuando los ingredientes se acercan a su fecha de vencimiento o hay sobrestock, el sistema sugiere promocionar articulos del menu que usan esos ingredientes.

**Ejemplo**: Si hay sobrestock de aguacates, sugiere destacar el guacamole o ofrecer un descuento.

### Mejora a Combo

Cuando los articulos en el carrito de un cliente podrian reemplazarse con un combo mas barato, la IA sugiere la mejora.

**Ejemplo**: El carrito tiene una hamburguesa ($80), papas ($35) y refresco ($25) = $140. Existe un combo por $120. La IA sugiere cambiar al combo.

### Precios Dinamicos

Basandose en patrones de demanda, el sistema puede sugerir ajustes de precios:
- **Horas pico**: Ligeros incrementos de precio en articulos de alta demanda
- **Periodos lentos**: Descuentos para generar trafico
- **Basados en inventario**: Descuentos en articulos que usan ingredientes con sobrestock

## Heuristico vs Grok AI

El sistema opera en dos modos:

### Modo Heuristico (Siempre Activo)
- Sugerencias basadas en reglas usando datos de ventas y niveles de inventario
- Sin llamadas a APIs externas
- Rapido y confiable
- Cubre los cuatro tipos de sugerencias

### Modo Grok AI (Opcional)
- Sugerencias mejoradas usando el API de Grok (actualmente `grok-4-1-fast-reasoning`)
- Requiere la variable de entorno `XAI_API_KEY`
- Proporciona sugerencias mas matizadas en lenguaje natural
- Recurre al modo heuristico si el API no esta disponible
- El modelo es configurable via **Configuracion** > **Configuracion de IA** sin cambios de codigo

## Configuracion

1. Ve a **Configuracion** > **Configuracion de IA**
2. Activa/desactiva tipos de sugerencias
3. Establece umbrales de sensibilidad (ej., confianza minima para sugerencias de venta adicional)
4. Configura limites de precios dinamicos (porcentaje maximo de incremento/decremento)

:::tip
Comienza con el modo heuristico para entender los patrones de sugerencias antes de habilitar Grok AI. Las sugerencias heuristicas ya son altamente efectivas para la mayoria de los restaurantes.
:::
