---
sidebar_position: 3
slug: /admin-guide/multi-brand
title: Configuracion Multi-Marca
---

# Configuracion Multi-Marca

Opera multiples marcas virtuales desde una sola cocina, cada una con su propia presentacion de menu en plataformas de delivery.

## Que Son las Marcas Virtuales?

Una marca virtual es una identidad de "restaurante" separada que comparte tu cocina fisica. Por ejemplo:

- **Desktop Kitchen** (tu marca principal) — menu completo en todas las plataformas
- **Wing Factory** — menu solo de alitas en Uber Eats
- **Burrito Express** — burritos y bowls en Rappi

Todos los pedidos de todas las marcas llegan a la **misma cola de cocina**, pero cada marca tiene su propio nombre, seleccion de menu y precios en las plataformas de delivery.

## Crear una Marca Virtual

1. Ve a **Delivery** > **Marcas Virtuales**
2. Toca **Nueva Marca**
3. Configura:
   - **Nombre de la marca**: El nombre que los clientes ven en las plataformas de delivery
   - **Descripcion**: Descripcion de la marca para los listados en plataformas
4. Guarda

## Asignar Articulos del Menu

1. Abre una marca virtual
2. Ve a la pestana de **Menu**
3. Selecciona que articulos de tu menu principal aparecen bajo esta marca
4. Opcionalmente establece precios especificos de la marca (diferentes a tu menu principal)
5. Guarda

### Estrategia de Seleccion de Articulos

| Estrategia | Ejemplo |
|-----------|---------|
| **Enfoque por categoria** | La marca de alitas solo muestra articulos de las categorias "Alitas" y "Complementos" |
| **Mas vendidos** | La marca presenta solo tus 10 mejores articulos para un menu enfocado |
| **Nivel de precio** | Marca premium con articulos de gama alta a precios premium |
| **Tipo de cocina** | Marcas separadas para tacos, hamburguesas y bowls |

## Asignacion de Plataformas

1. Abre una marca virtual
2. Ve a la pestana de **Plataformas**
3. Selecciona en que plataformas de delivery aparece esta marca
4. Cada plataforma puede tener diferentes marcas asignadas

### Ejemplo de Configuracion

| Plataforma | Marcas |
|-----------|--------|
| Uber Eats | Desktop Kitchen, Wing Factory |
| Rappi | Desktop Kitchen, Burrito Express |
| DiDi Food | Desktop Kitchen |

## Reglas de Markup por Marca

Cada marca virtual puede tener sus propias reglas de markup:
- Markups mas altos en marcas premium
- Markups mas bajos en marcas de valor para impulsar volumen
- Markups especificos por plataforma (ve [Configuracion de Delivery](../feature-guides/delivery-setup))

## Vista de Cocina

Desde la perspectiva de la cocina, nada cambia:
- Todos los pedidos aparecen en la misma cola
- Cada pedido muestra su **marca** y **plataforma** de origen
- La preparacion es identica sin importar desde que marca ordeno el cliente

## Analitica

Rastrea el rendimiento por marca en [Inteligencia de Delivery](../feature-guides/delivery-intelligence):
- Ingresos por marca
- Volumen de pedidos por marca
- Cuales marcas rinden mejor en cuales plataformas
- Impacto de comision por combinacion marca/plataforma

## Mejores Practicas

- Comienza con 1-2 marcas virtuales y expande basandote en el rendimiento
- Elige nombres de marca que comuniquen claramente el tipo de cocina
- Manten los menus de marcas virtuales enfocados (10-15 articulos maximo) — demasiados articulos diluyen la identidad de la marca
- Usa diferentes estrategias de precios por marca para probar que funciona
- Monitorea cuales marcas canibalizan tu marca principal vs las que traen clientes netos nuevos
