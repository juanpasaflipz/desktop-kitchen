---
sidebar_position: 3
slug: /getting-started/onboarding
title: Guia de Configuracion Inicial
---

# Guia de Configuracion Inicial

Esta guia te lleva paso a paso por la configuracion de tu restaurante en la plataforma Desktop Kitchen desde cero.

## Paso 1: Registra Tu Restaurante

1. Visita la pagina de registro y crea tu cuenta de propietario
2. Elige tu plan (Trial, Starter o Pro)
3. Se crea tu tenant con un subdominio unico

## Paso 2: Configura Empleados

Navega a **Gestion de Empleados** y agrega a tu personal:

1. Toca **Agregar Empleado**
2. Ingresa su nombre y asigna un **PIN de 4 digitos**
3. Selecciona su **rol** (Cajero, Cocina, Bar, Gerente o Admin)
4. Guarda

:::tip Empleados Demo por Defecto
Los nuevos tenants vienen con empleados demo para pruebas:
- **Manager** — PIN `1234`
- **Maria** (Cajero) — PIN `5678`
- **Carlos** (Cocina) — PIN `9012`

Cambia o elimina estos antes de salir en vivo.
:::

## Paso 3: Construye Tu Menu

### Crear Categorias

1. Ve a **Gestion de Menu** > **Categorias**
2. Agrega categorias como "Tacos", "Burritos", "Bebidas", "Complementos"
3. Establece el orden de visualizacion para cada categoria

### Agregar Articulos al Menu

1. Selecciona una categoria y toca **Agregar Articulo**
2. Llena: nombre, descripcion, precio (MXN) e imagen opcional
3. Marca los articulos como activos/inactivos segun sea necesario

### Configurar Modificadores (Opcional)

Los modificadores manejan personalizaciones como queso extra, opciones de tamano o niveles de picante:

1. Ve a **Modificadores** y crea grupos de modificadores (ej., "Proteina", "Extras", "Tamano")
2. Agrega opciones a cada grupo con sus ajustes de precio
3. Asigna grupos de modificadores a los articulos de menu correspondientes

### Crear Combos (Opcional)

1. Ve a **Combos** y toca **Nuevo Combo**
2. Define los slots del combo (ej., "Principal", "Complemento", "Bebida")
3. Asigna que categorias o articulos especificos pueden llenar cada slot
4. Establece el precio del combo

## Paso 4: Configura Pagos

### Pagos en Efectivo
Los pagos en efectivo funcionan de inmediato — no se necesita configuracion.

### Pagos con Tarjeta (Stripe)
1. Ve a **Configuracion** > **Pagos**
2. Conecta tu cuenta de Stripe
3. Los pagos con tarjeta quedan habilitados para todas las terminales

## Paso 5: Configura Impresoras (Opcional)

1. Ve a **Configuracion** > **Impresoras**
2. Agrega la direccion de red de tu impresora de tickets
3. Imprime una pagina de prueba para verificar la conexion
4. Asigna impresoras a estaciones (POS, Cocina, Bar)

## Paso 6: Sal en Vivo

1. Revisa tu menu una ultima vez
2. Asegurate de que todos los empleados tengan sus PINs
3. Haz un pedido de prueba de principio a fin (ve [Tu Primera Orden](./first-order))
4. Elimina o actualiza las cuentas de empleados demo
5. Comienza a tomar pedidos reales!
