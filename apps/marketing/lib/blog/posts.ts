import { BlogPost } from "./types";

import { post as queEsGhostKitchen } from "./posts/que-es-ghost-kitchen";
import { post as guiaCompletaDesktopKitchen } from "./posts/guia-completa-desktop-kitchen";
import { post as comisionesRappiUberDidi } from "./posts/comisiones-rappi-uber-didi";
import { post as iaEnLaCocina } from "./posts/ia-en-la-cocina";
import { post as reducirMermaRestaurante } from "./posts/reducir-merma-restaurante";
import { post as marcasVirtualesDelivery } from "./posts/marcas-virtuales-delivery";
import { post as fidelizarClientesDelivery } from "./posts/fidelizar-clientes-delivery";
import { post as pantallaCocinaEficiente } from "./posts/pantalla-cocina-eficiente";
import { post as posTradicionalVsModerno } from "./posts/pos-tradicional-vs-moderno";
import { post as automatizarInventarioIa } from "./posts/automatizar-inventario-ia";
import { post as ingenieriaDeMenu } from "./posts/ingenieria-de-menu";
import { post as abrirRestauranteMexico } from "./posts/abrir-restaurante-mexico";
import { post as seguridadPosRestaurante } from "./posts/seguridad-pos-restaurante";
import { post as programasLealtadRestaurantes } from "./posts/programas-lealtad-restaurantes";
import { post as gestionarMultiplesSucursales } from "./posts/gestionar-multiples-sucursales";

import { post as queEsGhostKitchenEn } from "./posts-en/que-es-ghost-kitchen";
import { post as guiaCompletaDesktopKitchenEn } from "./posts-en/guia-completa-desktop-kitchen";
import { post as comisionesRappiUberDidiEn } from "./posts-en/comisiones-rappi-uber-didi";
import { post as iaEnLaCocinaEn } from "./posts-en/ia-en-la-cocina";
import { post as reducirMermaRestauranteEn } from "./posts-en/reducir-merma-restaurante";
import { post as marcasVirtualesDeliveryEn } from "./posts-en/marcas-virtuales-delivery";
import { post as fidelizarClientesDeliveryEn } from "./posts-en/fidelizar-clientes-delivery";
import { post as pantallaCocinaEficienteEn } from "./posts-en/pantalla-cocina-eficiente";
import { post as posTradicionalVsModernoEn } from "./posts-en/pos-tradicional-vs-moderno";
import { post as automatizarInventarioIaEn } from "./posts-en/automatizar-inventario-ia";
import { post as ingenieriaDeMenuEn } from "./posts-en/ingenieria-de-menu";
import { post as abrirRestauranteMexicoEn } from "./posts-en/abrir-restaurante-mexico";
import { post as seguridadPosRestauranteEn } from "./posts-en/seguridad-pos-restaurante";
import { post as programasLealtadRestaurantesEn } from "./posts-en/programas-lealtad-restaurantes";
import { post as gestionarMultiplesSucursalesEn } from "./posts-en/gestionar-multiples-sucursales";

export const postsEs: BlogPost[] = [
  queEsGhostKitchen,
  guiaCompletaDesktopKitchen,
  comisionesRappiUberDidi,
  iaEnLaCocina,
  reducirMermaRestaurante,
  marcasVirtualesDelivery,
  fidelizarClientesDelivery,
  pantallaCocinaEficiente,
  posTradicionalVsModerno,
  automatizarInventarioIa,
  ingenieriaDeMenu,
  abrirRestauranteMexico,
  seguridadPosRestaurante,
  programasLealtadRestaurantes,
  gestionarMultiplesSucursales,
];

export const postsEn: BlogPost[] = [
  queEsGhostKitchenEn,
  guiaCompletaDesktopKitchenEn,
  comisionesRappiUberDidiEn,
  iaEnLaCocinaEn,
  reducirMermaRestauranteEn,
  marcasVirtualesDeliveryEn,
  fidelizarClientesDeliveryEn,
  pantallaCocinaEficienteEn,
  posTradicionalVsModernoEn,
  automatizarInventarioIaEn,
  ingenieriaDeMenuEn,
  abrirRestauranteMexicoEn,
  seguridadPosRestauranteEn,
  programasLealtadRestaurantesEn,
  gestionarMultiplesSucursalesEn,
];

export function getPostsForLocale(locale: string): BlogPost[] {
  return locale === "es" ? postsEs : postsEn;
}

export const featuredSlug = "que-es-ghost-kitchen";
