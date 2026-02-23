---
sidebar_position: 4
slug: /admin-guide/api-overview
title: Vista General del API
---

# Vista General del API

El POS de Desktop Kitchen expone un API REST para todas las operaciones. Esta vista general cubre la estructura del API para desarrolladores e integraciones.

## URL Base

```
https://pos.desktop.kitchen/api
```

Para acceso especifico de tenant, incluye el header `X-Tenant-ID` o usa el subdominio del tenant.

## Autenticacion

El API usa dos sistemas de autenticacion:

### Autenticacion por PIN de Empleado
Para operaciones del POS (pedidos, pagos, consultas de menu):
- Header: `x-employee-id: <employee_id>`
- Usado por el frontend del POS

### Autenticacion JWT de Propietario
Para gestion de tenant y facturacion:
- Header: `Authorization: Bearer <jwt_token>`
- Obtiene tokens via `POST /api/auth/login`

## Rutas del API

### Menu
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/menu/categories` | Listar todas las categorias |
| `GET` | `/api/menu/items` | Listar todos los articulos del menu |
| `POST` | `/api/menu/items` | Crear un articulo del menu |
| `PUT` | `/api/menu/items/:id` | Actualizar un articulo del menu |
| `DELETE` | `/api/menu/items/:id` | Eliminar un articulo del menu |

### Pedidos
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/orders` | Listar pedidos |
| `POST` | `/api/orders` | Crear un pedido |
| `PUT` | `/api/orders/:id/status` | Actualizar estado del pedido |
| `GET` | `/api/orders/:id` | Obtener detalles del pedido |

### Pagos
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `POST` | `/api/payments/create-intent` | Crear Stripe PaymentIntent |
| `POST` | `/api/payments/refund` | Reembolsar un pago |

### Inventario
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/inventory` | Listar articulos de inventario |
| `POST` | `/api/inventory` | Agregar articulo de inventario |
| `PUT` | `/api/inventory/:id` | Actualizar stock |

### Empleados
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/employees` | Listar empleados |
| `POST` | `/api/employees` | Crear empleado |
| `POST` | `/api/employees/login` | Inicio de sesion por PIN |

### Reportes
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/reports/sales` | Resumen de ventas |
| `GET` | `/api/reports/items` | Rendimiento de articulos |

### Delivery
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/delivery/platforms` | Listar plataformas |
| `GET` | `/api/delivery/markup-rules` | Listar reglas de markup |
| `GET` | `/api/delivery-intelligence/pnl` | Analitica de P&L |

### Lealtad
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/loyalty/customers` | Listar clientes |
| `GET` | `/api/loyalty/config` | Configuracion de lealtad |

### Marca
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/branding` | Obtener marca del tenant |
| `PUT` | `/api/branding` | Actualizar marca |

## Formato de Respuesta

Todos los endpoints devuelven JSON:

```json
// Exito
{
  "id": 1,
  "name": "Taco al Pastor",
  "price": 45.00
}

// Error
{
  "error": "Item not found"
}
```

## API de Admin (Super Admin)

Estos endpoints estan montados **antes** del middleware de tenant y protegidos por el header `ADMIN_SECRET`. Usan el pool de conexion admin (`neondb_owner`) que omite RLS.

:::info
Las rutas de admin no tienen alcance de tenant. Operan a traves de todos los tenants y requieren autenticacion por header `x-admin-secret` en lugar de PIN de empleado o JWT de propietario.
:::

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/admin/analytics/overview` | KPIs de toda la plataforma (tenants, MRR, churn) |
| `GET` | `/admin/analytics/signups` | Tendencias de registros en el tiempo |
| `GET` | `/admin/analytics/revenue` | Desglose de ingresos por plan |
| `GET` | `/admin/analytics/health` | Metricas de salud del sistema |
| `GET` | `/admin/tenants` | Listar todos los tenants |
| `POST` | `/admin/tenants` | Crear un nuevo tenant |
| `PATCH` | `/admin/tenants/:id` | Actualizar detalles del tenant |
| `DELETE` | `/admin/tenants/:id` | Eliminar tenant y todos sus datos |
| `POST` | `/admin/tenants/:id/seed` | Poblar tenant con datos demo |
| `POST` | `/admin/tenants/:id/reset-password` | Restablecer contrasena del propietario del tenant |
| `GET` | `/admin/tenants/:id/export` | Exportar todos los datos del tenant como JSON |
| `GET` | `/admin/tenants/:id/activity` | Actividad reciente del tenant |
| `GET` | `/admin/config` | Configuracion de la plataforma |
| `PUT` | `/admin/config` | Actualizar configuracion de la plataforma |
| `GET` | `/admin/audit-log` | Registro de auditoria de acciones admin |
| `POST` | `/admin/impersonate/:id` | Suplantar un tenant (depuracion) |

## Multi-Tenancy

Todos los tenants comparten una sola base de datos Neon Postgres, aislados por **Row Level Security (RLS)**. Cada tabla con alcance de tenant tiene una columna `tenant_id` con politicas RLS que filtran filas basandose en `current_setting('app.tenant_id')`.

La resolucion de tenant ocurre automaticamente via:
1. Header `X-Tenant-ID` (mayor prioridad)
2. Subdominio (ej., `turestaurante.desktop.kitchen`)
3. Variable de entorno `DEFAULT_TENANT_ID`
4. Fallback predeterminado

El backend mantiene dos pools de conexion:
- **`adminSql`** (`neondb_owner`) — omite RLS, usado para rutas de autenticacion, API admin y trabajos en segundo plano de IA
- **`tenantSql`** (`app_user`) — aplica RLS, usado para todas las rutas `/api/*` con alcance de tenant

## Impuestos

Todos los precios estan en **MXN**. El impuesto (16% IVA) se calcula al crear el pedido, no se almacena en los articulos.

:::note
La documentacion completa de referencia del API con esquemas de solicitud/respuesta estara disponible en una actualizacion futura. Esta vista general cubre los endpoints principales.
:::
