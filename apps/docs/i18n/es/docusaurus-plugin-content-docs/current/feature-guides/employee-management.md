---
sidebar_position: 10
slug: /feature-guides/employee-management
title: Gestion de Empleados
---

# Gestion de Empleados

Administra cuentas de personal, PINs, roles y permisos.

## Agregar Empleados

1. Ve a **Empleados** > **Agregar Empleado**
2. Ingresa:
   - **Nombre**: Nombre de visualizacion del empleado
   - **PIN**: PIN unico de 4 digitos para iniciar sesion
   - **Rol**: Nivel de acceso (ver abajo)
3. Guarda

## Roles y Permisos

| Rol | POS | Cocina | Bar | Reportes | Inventario | Empleados | Configuracion |
|-----|-----|--------|-----|----------|------------|-----------|---------------|
| Cajero | Si | - | - | - | - | - | - |
| Cocina | - | Si | - | - | - | - | - |
| Bar | - | - | Si | - | - | - | - |
| Gerente | Si | Si | Si | Si | Si | Si | - |
| Admin | Si | Si | Si | Si | Si | Si | Si |

### Detalles de Roles

- **Cajero**: Acceso solo a la pantalla del POS. Puede tomar pedidos y procesar pagos.
- **Cocina**: Acceso a la pantalla de cocina. Puede ver y actualizar el estado de pedidos de comida.
- **Bar**: Acceso a la pantalla de bar. Puede ver y actualizar el estado de pedidos de bebidas.
- **Gerente**: Acceso operativo completo incluyendo reportes, inventario y gestion de empleados.
- **Admin**: Todo lo que puede hacer un Gerente, mas configuracion del sistema y ajustes.

## Gestion de PINs

- Cada empleado tiene un PIN unico de 4 digitos
- Los PINs se usan para iniciar sesion en cualquier terminal POS
- Los gerentes pueden restablecer PINs desde la pantalla de gestion de empleados
- Los PINs deben cambiarse periodicamente por seguridad

:::caution
Elimina o cambia los PINs demo predeterminados (1234, 5678, 9012) antes de salir en vivo con clientes reales.
:::

## Mejores Practicas

- Crea cuentas individuales para cada miembro del personal (no compartas PINs)
- Usa el rol mas restrictivo que cubra las necesidades de cada empleado
- Revisa la lista de empleados regularmente y desactiva al personal que ya no trabaje
- Los gerentes deben tener sus propios PINs — no compartas el PIN de Gerente
