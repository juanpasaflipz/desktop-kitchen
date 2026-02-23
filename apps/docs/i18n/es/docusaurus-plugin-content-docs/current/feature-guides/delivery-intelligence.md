---
sidebar_position: 6
slug: /feature-guides/delivery-intelligence
title: Inteligencia de Delivery
---

# Inteligencia de Delivery

La Inteligencia de Delivery te da visibilidad sobre la rentabilidad por plataforma y herramientas para recapturar clientes que solo piden por delivery.

## Analitica de P&L

### Desglose por Plataforma

El tablero de inteligencia de delivery muestra:
- **Ingresos** por plataforma (Uber Eats, Rappi, DiDi Food)
- **Costos de comision** por plataforma
- **Ganancia neta** despues de comisiones
- Comparacion **POS vs Delivery** — ve que porcentaje de ingresos proviene de cada canal

### Leyendo el Tablero

| Metrica | Que significa |
|---------|--------------|
| Ingresos Brutos | Ventas totales de delivery antes de comisiones |
| % de Comision | La parte de la plataforma (varia por plataforma) |
| Ingresos Netos | Lo que realmente recibes |
| Valor Promedio de Pedido | Tamano promedio del ticket por plataforma |
| Volumen de Pedidos | Numero de pedidos por plataforma |

Usa estos datos para decidir que plataformas valen la comision y donde necesitas ajustar las reglas de markup.

## Recaptura de Clientes

Identifica clientes que solo piden a traves de plataformas de delivery y traeelos directo.

### Como Funciona

1. El sistema identifica clientes que **solo** han pedido via delivery (nunca en persona)
2. Puedes crear **campanas de recaptura** dirigidas a estos clientes
3. Las campanas envian ofertas por SMS via Twilio (ej., "10% de descuento en tu proxima visita en tienda")
4. Rastrea las tasas de conversion para medir la efectividad de la campana

### Crear una Campana de Recaptura

1. Ve a **Delivery** > **Recaptura**
2. Selecciona la audiencia objetivo (clientes solo de delivery)
3. Escribe tu mensaje de oferta
4. Establece el descuento o incentivo
5. Lanza la campana

:::info Requisitos de SMS
Las campanas de recaptura requieren la configuracion de SMS con Twilio. Los numeros telefonicos se formatean automaticamente al formato mexicano E.164 (+521...).
:::

## Mejores Practicas

- Revisa el P&L semanalmente para detectar erosion de margenes temprano
- Ajusta las reglas de markup por temporada cuando cambien las tasas de comision de las plataformas
- Ejecuta campanas de recaptura mensualmente para mejores resultados
- Compara los valores promedio de pedido entre plataformas — las plataformas con mayor ticket promedio pueden valer comisiones mas altas
