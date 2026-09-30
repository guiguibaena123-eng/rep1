import { APP_NAME } from '../app';

import type { LegalDocs } from './types';

export const es: LegalDocs = {
  privacy: [
    {
      title: 'Qué datos recogemos',
      body: `Correo y contraseña (para tu cuenta), nombre o apodo, edad, objetivo, área de interés y cómo te sientes con las entrevistas. Si decides completar Mi perfil, también guardamos lo que añadas allí: foto y portada, titular, ciudad, bio, competencias, experiencia, formación, cursos, idiomas, disponibilidad y enlaces (LinkedIn, portafolio, Instagram). También guardamos tus respuestas de las prácticas, el texto o el PDF de LinkedIn que envíes, los informes generados, los consejos que leíste o guardaste, los días en que practicaste y el idioma elegido. Si usas Explorar, guardamos a quién sigues, a quién bloqueaste y las denuncias que hagas. No pedimos DNI, teléfono ni dirección.`,
    },
    {
      title: 'Para qué los usamos',
      body: `Solo para que ${APP_NAME} funcione: crear preguntas, dar feedback, generar informes, mostrar tu progreso y elegir consejos para ti. Tu perfil solo lo ves tú, a menos que actives "Aparecer en Explorar" (ver abajo). No vendemos tus datos y no usamos anuncios.`,
    },
    {
      title: 'Métricas de uso',
      body: `Para mejorar la app, registramos acciones simples, como "terminó una práctica" o "abrió la pantalla Premium", con fecha y hora. Estas métricas nunca incluyen lo que escribiste. No usamos herramientas de análisis ni de publicidad de otras empresas.`,
    },
    {
      title: 'Uso de inteligencia artificial',
      body: `Para crear preguntas, feedback, informes y sugerencias de bio, el texto necesario para cada petición se envía a un servicio de inteligencia artificial de terceros. Nunca enviamos tu correo ni tu contraseña. Tu nombre solo se envía cuando pides una sugerencia de bio (o si aparece en un texto o PDF que tú mismo envíes).`,
    },
    {
      title: 'Recordatorios',
      body: `Si activas el recordatorio diario, el aviso se programa en tu propio móvil. Puedes desactivarlo cuando quieras en Ajustes o en los ajustes del móvil.`,
    },
    {
      title: 'Explorar: lo que ven otras personas',
      body: `La opción "Aparecer en Explorar" (Mi perfil › Editar › Privacidad) viene desactivada. Si la activas, quien tenga cuenta en ${APP_NAME} puede encontrar tu perfil y ver: foto y portada, nombre, titular, ciudad, bio, habilidades, objetivo, área, disponibilidad, modalidad de trabajo, experiencia, formación y cursos, cuántos seguidores tienes, a cuántas personas sigues y tus logros (primera práctica, racha de días, LinkedIn analizado). Nunca mostramos tu correo, tu edad, tu plan, las notas o respuestas de tus prácticas, tus idiomas ni tus enlaces. Al desactivarla, tu perfil sale de Explorar al momento. Si bloqueas a alguien, dejáis de ver el perfil del otro, y esa persona no recibe ningún aviso. Las denuncias son anónimas para la persona denunciada: guardamos quién denunció, el motivo, el texto y una copia del perfil denunciado, solo para la moderación.`,
    },
    {
      title: 'Pago del Premium',
      body: `La suscripción se hace en la página de pago de Stripe (empresa de pagos), que cobra tu tarjeta cada mes. Para ello, Stripe recibe tu correo y los datos de la tarjeta, y puede tratarlos fuera de Brasil. Los datos de la tarjeta se quedan solo en Stripe: ${APP_NAME} no ve ni guarda datos de tarjeta ni bancarios. Solo guardamos el importe, la fecha, la forma (p. ej., "tarjeta de crédito") y el estado de cada cobro y de la suscripción, para activar y demostrar tu Premium.`,
    },
    {
      title: 'Cuánto tiempo los guardamos',
      body: `Tus datos se guardan mientras exista tu cuenta. El PDF de LinkedIn se borra justo después de generar el informe. Al eliminar tu cuenta, se borra todo, incluidas las fotos y las métricas de uso.`,
    },
    {
      title: 'Tus derechos',
      body: `Puedes ver y corregir tus datos, descargar una copia (Ajustes › Exportar mis datos) y eliminar tu cuenta (Ajustes › Eliminar mi cuenta) cuando quieras, como garantizan la Ley General de Protección de Datos de Brasil (LGPD), donde se gestiona ${APP_NAME}, y la ley de protección de datos de donde vives (como el RGPD en la Unión Europea). Si necesitas ayuda, escríbenos por el contacto de abajo.`,
    },
    {
      title: 'Contacto',
      body: `Usa "Ayuda y contacto" en Ajustes.`,
    },
  ],
  terms: [
    {
      title: 'Qué es la app',
      body: `${APP_NAME} es una herramienta de práctica y orientación para entrevistas de trabajo y perfil profesional. No garantiza un empleo y no sustituye el apoyo profesional.`,
    },
    {
      title: 'Quién puede usarla',
      body: `Personas de 16 años o más.`,
    },
    {
      title: 'Tu cuenta',
      body: `Eres responsable de mantener tu contraseña en secreto. Usa información real sobre ti en las prácticas.`,
    },
    {
      title: 'Contenido generado por IA',
      body: `El feedback y las sugerencias se generan automáticamente y pueden tener errores. Usa tu propio criterio antes de aplicar cualquier sugerencia.`,
    },
    {
      title: 'Planes',
      body: `El plan gratuito tiene límites de uso. El Premium es una suscripción mensual con Stripe que se renueva sola: el importe se cobra en tu tarjeta cada mes, hasta que canceles. El precio está fijado en reales brasileños (R$). La página de pago de Stripe puede mostrarlo en tu moneda: Stripe hace la conversión con una comisión de cambio de entre el 2 % y el 4 % ya incluida, y el importe en tu moneda puede variar un poco cada mes según el tipo de cambio. También puedes elegir pagar en reales; en ese caso, tu banco convierte el importe y puede cobrar comisiones. El Premium se activa en cuanto se aprueba el cobro. Puedes cancelar cuando quieras en la pantalla Perfil ("Cancelar suscripción"): no habrá nuevos cobros y el Premium sigue activo hasta el final del mes ya pagado.`,
    },
    {
      title: 'Desistimiento y reembolso',
      body: `Según el Código de Defensa del Consumidor de Brasil, puedes desistir de la suscripción Premium en los 7 días siguientes al primer cobro y recuperar el dinero. Si la ley de donde vives te da un plazo mayor, se aplica el plazo mayor. Para ello, cancela la suscripción en Perfil y escríbenos en "Ayuda y contacto". El reembolso lo hace Stripe, en la misma tarjeta. Aunque desistas, canceles o pidas el reembolso, tu Premium sigue activo hasta el final del mes de ese cobro.`,
    },
    {
      title: 'Uso justo',
      body: `Para que la app funcione para todos, hay límites técnicos de uso, incluso en el Premium. No está permitido intentar saltarse estos límites ni usar la app para enviar contenido ofensivo o ilegal. En Explorar, respeta a los demás: no se permiten perfiles falsos, acoso, insultos, estafas ni ofertas falsas. Los perfiles denunciados se revisan y pueden eliminarse.`,
    },
    {
      title: 'Cambios',
      body: `Estos términos pueden cambiar. Cuando pase, te avisaremos en la app.`,
    },
  ],
};
