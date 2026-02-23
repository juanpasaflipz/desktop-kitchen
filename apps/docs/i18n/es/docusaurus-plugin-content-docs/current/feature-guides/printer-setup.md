---
sidebar_position: 9
slug: /feature-guides/printer-setup
title: Configuracion de Impresoras
---

# Configuracion de Impresoras

Configura impresoras de tickets para terminales POS, estaciones de cocina y estaciones de bar.

## Impresoras Soportadas

- Impresoras termicas de tickets compatibles con **ESC/POS**
- Conexion: Red (recomendado) o USB
- Anchos de papel: 58mm y 80mm

## Agregar una Impresora

1. Ve a **Configuracion** > **Impresoras**
2. Toca **Agregar Impresora**
3. Ingresa:
   - **Nombre**: Nombre descriptivo (ej., "Impresora Cocina", "Impresora Bar")
   - **Direccion IP**: La direccion de red de la impresora
   - **Puerto**: El predeterminado es 9100 para la mayoria de impresoras de red
   - **Ancho de papel**: 58mm o 80mm
4. Toca **Imprimir Prueba** para verificar la conexion
5. Guarda

## Asignacion de Estaciones

Asigna impresoras a estaciones especificas:

| Estacion | Imprime |
|----------|---------|
| **POS** | Tickets para el cliente |
| **Cocina** | Comandas de pedido (articulos de comida) |
| **Bar** | Comandas de pedido (articulos de bebida) |

Un pedido puede activar impresiones en multiples estaciones — los articulos de comida van a la impresora de cocina, los articulos de bebida van a la impresora de bar, y el cliente recibe un ticket.

## Solucion de Problemas

### La Impresora No Responde
1. Verifica que la impresora este encendida y conectada a la red
2. Revisa que la direccion IP sea correcta
3. Asegurate de que el puerto 9100 no este bloqueado por el firewall de tu red
4. Intenta imprimir una pagina de prueba desde los controles integrados de la impresora

### Problemas de Corte o Alineacion
- Verifica que la configuracion de ancho de papel coincida con tu rollo de papel real
- Asegurate de que el papel este cargado correctamente y no este atascado
- Limpia el cabezal de impresion si la salida esta desvanecida

### Consejos de Red
- Asigna una **IP estatica** a tu impresora para evitar cambios de direccion
- Manten las impresoras en la misma subred de red que tus dispositivos POS
- Las conexiones por cable son mas confiables que Wi-Fi para impresion de alto volumen
