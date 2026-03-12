---
sidebar_position: 5
slug: /feature-guides/delivery-setup
title: Configuracion de Delivery
---

# Configuracion de Delivery

Conecta plataformas de delivery, configura reglas de markup y administra marcas virtuales para maximizar los ingresos por delivery.

## Conectar Plataformas

El sistema soporta tres plataformas de delivery:
- **Uber Eats**
- **Rappi**
- **DiDi Food**

### Agregar una Plataforma
1. Ve a **Delivery** > **Plataformas**
2. Selecciona la plataforma a conectar
3. Ingresa tus credenciales/claves API de la plataforma
4. Habilita la conexion

Una vez conectado, los pedidos de la plataforma llegan a tu cola de cocina junto con los pedidos del POS. Cada pedido de delivery muestra su **origen** para que el personal sepa de donde viene.

## Reglas de Markup

Las plataformas de delivery cobran comisiones (tipicamente 15-30%). Las reglas de markup te permiten ajustar precios para delivery y proteger tus margenes.

### Crear Reglas de Markup
1. Ve a **Delivery** > **Reglas de Markup**
2. Selecciona una plataforma
3. Elige el alcance:
   - **Por articulo**: Ajusta articulos especificos del menu
   - **Por categoria**: Ajusta todos los articulos de una categoria
4. Establece el tipo de ajuste:
   - **Porcentaje**: ej., +25%
   - **Monto fijo**: ej., +$20 MXN
5. Guarda

### Ejemplo

Si un taco cuesta $45 MXN en tienda y Uber Eats cobra 25% de comision:
- Establece un markup de +30% para la categoria Tacos en Uber Eats
- Precio en delivery: $58.50 MXN
- Despues del 25% de comision: $43.88 MXN (cercano al margen en tienda)

## Marcas Virtuales

Una sola cocina puede operar multiples "marcas" en plataformas de delivery. Consulta [Configuracion Multi-Marca](../admin-guide/multi-brand) para detalles completos.

### Configuracion Rapida
1. Ve a **Delivery** > **Marcas Virtuales**
2. Crea una marca (ej., "Wing Factory")
3. Selecciona que articulos del menu aparecen bajo esta marca
4. Asigna la marca a plataformas especificas
5. Personaliza la marca (nombre, descripcion)

## Flujo de Pedidos

```
Plataforma de Delivery → API → Backend Desktop Kitchen → Pantalla de Cocina
                                    │
                                    ├── Banner de alerta en POS (en vivo)
                                    ├── Pedido etiquetado con origen
                                    ├── Reglas de markup aplicadas
                                    └── P&L rastreado por plataforma
```

Cuando llega un pedido de delivery, suceden dos cosas:

1. **Pantalla del POS**: Aparece un banner de alerta con color mostrando la plataforma, numero de pedido, nombre del cliente y un cronometro en vivo. El personal lo ve inmediatamente sin salir del POS. Consulta [Operaciones del POS — Banner de Alertas de Delivery](./pos-operations#banner-de-alertas-de-delivery) para mas detalles.
2. **Pantalla de cocina**: El pedido aparece en la cola de cocina con una insignia de plataforma para que el personal de cocina pueda prepararlo.
