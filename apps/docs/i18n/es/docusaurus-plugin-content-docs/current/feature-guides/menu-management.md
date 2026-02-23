---
sidebar_position: 3
slug: /feature-guides/menu-management
title: Gestion del Menu
---

# Gestion del Menu

Administra las categorias, articulos, modificadores, combos y marcas virtuales de tu restaurante desde la pantalla de Gestion de Menu.

## Categorias

Las categorias organizan tu menu (ej., Tacos, Burritos, Bebidas, Postres).

### Crear una Categoria
1. Ve a **Menu** > **Categorias**
2. Toca **Agregar Categoria**
3. Ingresa el nombre de la categoria
4. Establece el orden de visualizacion (numeros mas bajos aparecen primero)
5. Guarda

### Administrar Categorias
- **Reordenar**: Cambia el numero de orden de visualizacion
- **Ocultar**: Activa/desactiva para ocultar temporalmente del POS
- **Eliminar**: Elimina categorias vacias (las categorias con articulos deben vaciarse primero)

## Articulos del Menu

### Crear un Articulo
1. Selecciona una categoria
2. Toca **Agregar Articulo**
3. Llena:
   - **Nombre**: Nombre de visualizacion del articulo
   - **Descripcion**: Descripcion opcional
   - **Precio**: Precio en MXN
   - **Imagen**: Foto opcional
   - **Activo**: Activa/desactiva disponibilidad
4. Guarda

### Propiedades del Articulo
- **Precio**: Siempre en MXN, el impuesto (16% IVA) se calcula al momento del cobro
- **Activo/Inactivo**: Los articulos inactivos no aparecen en el POS ni en los tableros de menu
- **Categoria**: Cada articulo pertenece a una categoria

## Modificadores

Los modificadores manejan personalizaciones de articulos — extras, tamanos, opciones de proteina, etc.

### Grupos de Modificadores

Un grupo de modificadores es una coleccion de opciones (ej., "Proteina" con Pollo, Res, Pastor).

| Configuracion | Descripcion |
|--------------|-------------|
| **Nombre** | Nombre del grupo mostrado al cajero |
| **Obligatorio** | Debe seleccionar al menos una opcion |
| **Selecciones Min/Max** | Cuantas opciones se pueden elegir |

### Opciones de Modificador

Cada opcion dentro de un grupo puede tener:
- **Nombre**: Etiqueta de la opcion (ej., "Queso Extra")
- **Ajuste de precio**: Costo adicional (ej., +$15.00 MXN) o descuento

### Asignar a Articulos

1. Abre un articulo del menu
2. Ve a la pestana de **Modificadores**
3. Asigna uno o mas grupos de modificadores
4. Cuando este articulo se agrega al carrito, el cajero ve la seleccion de modificadores

## Combos

Los combos agrupan multiples articulos a un precio fijo.

### Crear un Combo
1. Ve a **Menu** > **Combos**
2. Toca **Nuevo Combo**
3. Establece el nombre y precio del combo
4. Define los **slots** (ej., "Principal", "Complemento", "Bebida")
5. Para cada slot, elige que categorias o articulos especificos se permiten
6. Guarda

### Como Funcionan los Combos en el POS
1. El cajero toca un combo en el menu
2. Un modal lo guia a traves de la seleccion de cada slot
3. El combo aparece en el carrito como un solo articulo al precio del combo
4. Cada componente se rastrea para la preparacion en cocina

## Marcas Virtuales

Las marcas virtuales te permiten presentar diferentes menus en diferentes plataformas de delivery desde la misma cocina.

Consulta [Configuracion Multi-Marca](../admin-guide/multi-brand) para detalles de configuracion.
