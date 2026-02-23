---
sidebar_position: 2
slug: /admin-guide/branding
title: Personalizacion de Marca
---

# Personalizacion de Marca

Personaliza el POS con la marca de tu restaurante — colores, logo e identidad.

## Como Funciona la Marca

El sistema de marca usa **variables CSS** para aplicar el tema a toda la aplicacion. Cada referencia de color en el POS usa clases `brand-*` respaldadas por variables CSS. Cuando estableces tu color de marca, el sistema genera una paleta de colores completa (tonos del 50 al 900) a partir de un solo valor hexadecimal.

## Establecer Tu Color de Marca

1. Ve a **Configuracion** > **Marca**
2. Elige tu color principal de marca usando el selector de color
3. Previsualiza el color en toda la interfaz
4. Guarda

El sistema genera automaticamente:
- Una paleta completa del tono 50 (mas claro) al 900 (mas oscuro)
- Contraste apropiado para texto y botones
- Variantes de modo oscuro

### Colores Predeterminados

Si no se configura una marca personalizada, el POS usa por defecto un esquema de color **teal** (colores de la marca Desktop Kitchen). Tu personalizacion reemplaza completamente estos valores predeterminados.

## Que Se Personaliza

- **Barra de navegacion** y encabezado
- **Botones** (estados primario, secundario)
- **Colores de acento** en toda la interfaz
- **Estados activos** y resaltados
- **Graficas y graficos** en reportes

## Marca por Tenant

En una configuracion multi-tenant, cada tenant tiene marca independiente:
- El Tenant A puede ser azul
- El Tenant B puede ser verde
- Los usuarios de cada tenant solo ven los colores de su marca

La marca se almacena en el registro del tenant en la base de datos maestra y se carga a traves del `BrandingContext` cuando la aplicacion se inicializa.

## Logo

Sube el logo de tu restaurante para reemplazar el predeterminado:
1. Ve a **Configuracion** > **Marca**
2. Sube tu logo (recomendado: SVG o PNG con fondo transparente)
3. El logo aparece en la barra de navegacion y en los tickets

## Consejos

- Elige un color que tenga buen contraste para legibilidad
- Prueba tu color de marca en modo claro y modo oscuro
- Usa el logo real de tu restaurante, no un placeholder
- Previsualiza en una tablet — ahi es donde la mayoria del personal lo vera
