---
sidebar_position: 4
slug: /admin-guide/tenant-management
title: Gestion de Tenants
---

# Gestion de Tenants

El tablero de Super Admin proporciona control total sobre el onboarding, configuracion y offboarding de tenants desde una sola interfaz.

## Acceder al Tablero

Navega a:

```
https://pos.desktop.kitchen/#/super-admin
```

Se te pedira el **Admin Secret** — este es la variable de entorno `ADMIN_SECRET` configurada en el servidor. El secreto se almacena en `sessionStorage` durante la sesion de tu navegador.

:::caution Autenticacion separada
El acceso de Super Admin es independiente tanto del sistema de PIN de empleados como del sistema JWT de propietario. Usa un secreto compartido especificamente para operaciones a nivel de plataforma.
:::

## Pestanas del Tablero

### Vista General

KPIs de toda la plataforma de un vistazo:

- Total de tenants, tenants activos y tasa de churn
- Ingresos recurrentes mensuales (MRR) y distribucion por plan
- Registros recientes y linea de tiempo de actividad de tenants

### Tenants

Lista completa de tenants con busqueda, filtro por plan y acciones en linea:

- **Crear** — registrar un nuevo tenant
- **Editar** — actualizar nombre, subdominio, plan, marca
- **Restablecer Contrasena** — generar una nueva contrasena de propietario
- **Exportar** — descargar todos los datos del tenant como JSON
- **Eliminar** — eliminar permanentemente un tenant y todos sus datos

### Ingresos

Analitica de ingresos:

- Tendencias de MRR en el tiempo
- Desglose de ingresos por plan (trial, starter, pro)
- Vista general del estado de suscripciones en Stripe

### Salud

Monitoreo de salud del sistema:

- Estado del pool de conexiones a base de datos
- Historial de ejecucion de trabajos en segundo plano
- Tasas de error y fallas recientes

## Ciclo de Vida del Tenant

### Crear un Tenant

1. Haz clic en **Crear Tenant** en la pestana de Tenants
2. Llena los campos requeridos: nombre del tenant, subdominio, email del propietario
3. Selecciona un plan (trial, starter o pro)
4. Haz clic en **Crear** — esto crea el registro del tenant y configura el contexto de RLS
5. Haz clic en **Poblar** en la fila del nuevo tenant para llenar datos demo (categorias, articulos del menu, empleados, inventario)

Despues de poblar, se crea un empleado admin predeterminado con un PIN generado. Si `RESEND_API_KEY` esta configurado, el PIN se envia por email al propietario.

### Editar un Tenant

Haz clic en el boton **Editar** en cualquier fila de tenant para actualizar:

- Nombre y subdominio del tenant
- Nivel de plan
- Marca (color primario, URL del logo)
- IDs de cliente y suscripcion de Stripe

### Restablecer Contrasena del Propietario

Haz clic en **Restablecer Contrasena** para generar una nueva contrasena de propietario. La nueva contrasena se muestra una sola vez — copiala inmediatamente o se perdera.

### Exportar Datos del Tenant

Haz clic en **Exportar** para descargar un archivo JSON con todos los datos del tenant a traves de cada tabla. Esto es util para:

- Respaldo antes de migracion
- Solicitudes de cumplimiento / portabilidad de datos
- Depuracion de problemas especificos del tenant

### Eliminar un Tenant

La eliminacion es permanente e irreversible. El flujo de eliminacion:

1. Haz clic en **Eliminar** en la fila del tenant
2. Aparece un modal de confirmacion que requiere que escribas el ID del tenant
3. Confirma la eliminacion
4. El sistema ejecuta una eliminacion en cascada a traves de las 46 tablas con alcance de tenant en una sola transaccion
5. El registro del tenant se elimina al final

:::danger
La eliminacion de un tenant no se puede deshacer. Siempre exporta los datos del tenant antes de eliminar. La operacion de eliminacion remueve datos de todas las tablas incluyendo pedidos, pagos, inventario, clientes de lealtad, datos de IA y configuracion.
:::

## Endpoints del API

Todos los endpoints de super admin estan documentados en la [Vista General del API](/admin-guide/api-overview#admin-super-admin-api). Requieren el header `x-admin-secret` y operan fuera del middleware de tenant.
