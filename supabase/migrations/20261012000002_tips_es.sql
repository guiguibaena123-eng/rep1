-- Dicas em espanhol (es). Mesmos slugs das dicas gerais em português, com fontes da Espanha.
-- Dicas só do Brasil NÃO entram aqui. No lugar delas: contrato-formacion-alternancia e contrato-practica-profesional.
-- Plano grátis: 7 de 21 (33%). Fontes conferidas em 30/09/2026.

insert into public.tracks (language, slug, title, description, sort_order) values
  ('es', 'entrevista-sem-medo', 'Entrevistas sin miedo', 'De los nervios a la última pregunta, paso a paso.', 1),
  ('es', 'curriculo-do-zero', 'Currículum desde cero', 'Prepara tu currículum y tu LinkedIn aunque no tengas experiencia.', 2),
  ('es', 'primeiro-emprego', 'Primer empleo', 'Lo que conviene saber antes de empezar a trabajar.', 3);

insert into public.tips (language, slug, title, category, read_minutes, is_premium, track_id, track_order, goals, areas, for_nervous, body) values

-- ===== Trilha: Entrevistas sin miedo =====
(
  'es', 'nervosismo-antes-da-entrevista',
  '¿Nervios? Cómo prepararte para el día',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'es' and slug = 'entrevista-sem-medo'), 1,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"Ponerse nervioso antes de una entrevista es normal. El objetivo no es que los nervios desaparezcan, sino llegar bien preparado."},
    {"type":"h","text":"El día antes"},
    {"type":"list","items":["Vuelve a leer la oferta e infórmate sobre la empresa.","Haz una entrevista de práctica con un amigo o alguien de tu familia (o aquí en la app).","Prepara la ropa, comprueba la dirección o el enlace y duerme bien."]},
    {"type":"h","text":"En el momento"},
    {"type":"list","items":["Llega unos 10 minutos antes. Si es online, prueba antes la cámara y el sonido.","Antes de entrar, respira hondo. Habla sin prisa y haz pequeñas pausas.","Si te quedas en blanco, di “déjame pensarlo un momento”. Pedir un poco de tiempo está bien."]},
    {"type":"example","title":"Ejemplo","text":"“Perdona, estoy un poco nervioso. ¿Puedo empezar de nuevo?” Quien entrevista lo entiende. Ser sincero transmite confianza."},
    {"type":"p","text":"Si la ansiedad te afecta mucho en el día a día, conviene pedir ayuda a un profesional de la salud."},
    {"type":"sources","items":[
      {"title":"Universidad de Sevilla: La entrevista de trabajo, antes, durante y después","url":"https://portalvirtualempleo.us.es/la-entrevista-de-trabajo-antes-durante-y-despues/"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'como-responder-fale-sobre-voce',
  'Cómo responder a “háblame de ti”',
  'entrevista', 2, false,
  (select id from public.tracks where language = 'es' and slug = 'entrevista-sem-medo'), 2,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"Casi siempre es la primera pregunta. Quien entrevista quiere saber quién eres y por qué encajas en el puesto."},
    {"type":"p","text":"No es momento de contar toda tu vida. Con una respuesta de un minuto basta."},
    {"type":"h","text":"Usa este orden"},
    {"type":"list","ordered":true,"items":["**Quién eres:** tu nombre y qué estudias o a qué te dedicas.","**Un ejemplo:** algo que hayas hecho y que tenga relación con el puesto.","**Qué buscas:** por qué quieres esta oportunidad."]},
    {"type":"example","title":"Ejemplo","text":"“Soy Lucía, tengo 19 años y estudio un grado medio de Gestión Administrativa. En la feria del instituto me encargué de atender a los visitantes y me gustó mucho. Por eso quiero empezar en atención al cliente.”"},
    {"type":"warning","text":"No repitas el currículum punto por punto. Ya lo han leído. Cuenta lo que no está en el papel."},
    {"type":"p","text":"Practica en voz alta dos o tres veces. El día de la entrevista saldrá más natural."},
    {"type":"sources","items":[
      {"title":"Universidad de Sevilla: La entrevista de trabajo, antes, durante y después","url":"https://portalvirtualempleo.us.es/la-entrevista-de-trabajo-antes-durante-y-despues/"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'conte-uma-historia',
  'Cuenta una historia: el método STAR',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'es' and slug = 'entrevista-sem-medo'), 3,
  '{primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Preguntas como “cuéntame una vez en la que resolviste un problema” piden una historia real. Una forma sencilla de ordenar la respuesta es el método STAR, que usan los servicios de empleo de las universidades."},
    {"type":"list","ordered":true,"items":["**Situación:** dónde estabas y qué pasaba. Sin demasiados detalles.","**Tarea:** cuál era tu papel u objetivo.","**Acción:** lo que hiciste TÚ. Es la parte más larga de la respuesta: di “yo”, no “nosotros”.","**Resultado:** qué cambió y qué aprendiste. Si puedes, da un número."]},
    {"type":"example","title":"Ejemplo","text":"“En un trabajo en grupo del instituto, dos compañeros dejaron de responder (situación) y yo era responsable de la entrega (tarea). Repartí de nuevo las tareas y creé un grupo con plazos (acción). Entregamos a tiempo y sacamos un 8 (resultado).”"},
    {"type":"p","text":"¿No tienes experiencia laboral? Los ejemplos de clase, proyectos, deporte o voluntariado valen igual."},
    {"type":"warning","text":"No inventes historias. Suelen preguntar por los detalles, y la respuesta puede no coincidir con tu currículum."},
    {"type":"sources","items":[
      {"title":"MIT Career Advising: Using the STAR method (en inglés)","url":"https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'pontos-fortes-e-fracos',
  'Puntos fuertes y débiles sin tópicos',
  'entrevista', 3, true,
  (select id from public.tracks where language = 'es' and slug = 'entrevista-sem-medo'), 4,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"“¿Cuál es tu mayor defecto?” asusta, pero es una oportunidad para mostrar que te conoces y que estás mejorando."},
    {"type":"h","text":"Punto fuerte"},
    {"type":"p","text":"Elige uno que tenga que ver con el puesto y demuéstralo con un ejemplo corto. “Soy organizada” pesa más con “yo hacía el calendario de limpieza de mi clase”."},
    {"type":"h","text":"Punto débil"},
    {"type":"list","ordered":true,"items":["Di uno real que no sea imprescindible para el puesto.","Cuenta qué estás haciendo para mejorar.","Termina mostrando tu avance."]},
    {"type":"example","title":"Ejemplo","text":"“Me daba vergüenza hablar en público. Empecé a ofrecerme para presentar los trabajos de clase y ahora me siento mucho más cómodo.”"},
    {"type":"warning","text":"Evita “soy perfeccionista” o “trabajo demasiado”. Lo han oído muchas veces y pueden pensar que esquivas la pregunta."},
    {"type":"sources","items":[
      {"title":"Universidad de Sevilla: La entrevista de trabajo, antes, durante y después","url":"https://portalvirtualempleo.us.es/la-entrevista-de-trabajo-antes-durante-y-despues/"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'perguntas-para-fazer-no-fim',
  'Preguntas para hacer al final de la entrevista',
  'entrevista', 2, true,
  (select id from public.tracks where language = 'es' and slug = 'entrevista-sem-medo'), 5,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Al final casi siempre preguntan: “¿Tienes alguna duda?”. Responder “no” desaprovecha una buena ocasión para mostrar interés."},
    {"type":"h","text":"Buenas preguntas"},
    {"type":"list","items":["¿Cómo es un día normal en este puesto?","¿Qué debería aprender primero la persona que entre?","¿Cómo acompañáis a quien está empezando?","¿Cuáles son los siguientes pasos del proceso?"]},
    {"type":"example","title":"Consejo","text":"Lleva 2 preguntas apuntadas. Si una ya se ha respondido durante la conversación, usa la otra."},
    {"type":"warning","text":"Deja las preguntas sobre sueldo y condiciones para cuando la empresa saque el tema o para la última fase, si nadie lo ha mencionado."},
    {"type":"sources","items":[
      {"title":"Universidad de Sevilla: La entrevista de trabajo, antes, durante y después","url":"https://portalvirtualempleo.us.es/la-entrevista-de-trabajo-antes-durante-y-despues/"},
      {"title":"MIT Career Advising: Questions to ask an interviewer (en inglés)","url":"https://capd.mit.edu/resources/questions-to-ask-interviewer/"}
    ]}
  ]$j$::jsonb
),

-- ===== Trilha: Currículum desde cero =====
(
  'es', 'curriculo-sem-experiencia',
  'Currículum sin experiencia: qué poner',
  'curriculo', 3, false,
  (select id from public.tracks where language = 'es' and slug = 'curriculo-do-zero'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Todo el mundo empieza sin experiencia. El currículum del primer empleo muestra lo que ya sabes hacer y tus ganas de aprender."},
    {"type":"h","text":"Qué incluir"},
    {"type":"list","items":["**Formación:** estudios, curso o año de finalización y ciclos de FP.","**Otros cursos:** los cursos online y gratuitos también cuentan. Pon el nombre y las horas.","**Actividades:** voluntariado, proyectos de clase, deporte, trabajos puntuales.","**Habilidades:** informática, idiomas (con tu nivel real), atención al público, organización."]},
    {"type":"example","title":"Ejemplo","text":"“Voluntaria en la recogida de alimentos del instituto (2025): organicé las donaciones y atendí a las familias.”"},
    {"type":"warning","text":"No subas tu nivel de inglés o de informática. Algunas empresas lo comprueban en la entrevista."},
    {"type":"sources","items":[
      {"title":"Europass (Unión Europea): Crear tu CV Europass","url":"https://europass.europa.eu/es/create-europass-cv"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'curriculo-de-uma-pagina',
  'Un currículum claro: qué poner y en qué orden',
  'curriculo', 3, true,
  (select id from public.tracks where language = 'es' and slug = 'curriculo-do-zero'), 2,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Quien selecciona suele mirar un currículum solo unos segundos. Si está bien ordenado, encuentra rápido lo importante. Al empezar, una página suele bastar."},
    {"type":"h","text":"En este orden"},
    {"type":"list","ordered":true,"items":["**Nombre y contacto:** teléfono, correo y ciudad. No hace falta la dirección completa.","**Objetivo:** una línea con el puesto que buscas.","**Formación y cursos.**","**Experiencia y actividades:** de la más reciente a la más antigua.","**Habilidades e idiomas.**"]},
    {"type":"warning","text":"Usa un correo sencillo, con tu nombre. Los apodos o bromas en el correo dan mala impresión."},
    {"type":"p","text":"En España es habitual poner una foto profesional, pero no es obligatorio. Guarda el archivo en PDF para que el formato no cambie."},
    {"type":"sources","items":[
      {"title":"Europass (Unión Europea): Crear tu CV Europass","url":"https://europass.europa.eu/es/create-europass-cv"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'titulo-do-linkedin',
  'Un titular de LinkedIn que te ayude a que te encuentren',
  'linkedin', 2, false,
  (select id from public.tracks where language = 'es' and slug = 'curriculo-do-zero'), 3,
  '{estagio,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"El titular es la frase que aparece debajo de tu nombre y en los resultados de búsqueda. Los reclutadores buscan por palabras, y el titular es uno de los sitios donde más pesan."},
    {"type":"h","text":"Una fórmula sencilla"},
    {"type":"p","text":"**Lo que buscas + lo que estudias o sabes hacer.**"},
    {"type":"example","title":"Ejemplos","text":"“Buscando mi primer empleo en Atención al Cliente | Técnico en Gestión Administrativa”\n“Estudiante de Logística | Excel y control de almacén”"},
    {"type":"warning","text":"Evita poner solo “Estudiante” o “Desempleado”. Di a qué te quieres dedicar."},
    {"type":"sources","items":[
      {"title":"Ayuda de LinkedIn: editar el titular del perfil","url":"https://www.linkedin.com/help/linkedin/answer/a542926?lang=es"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'foto-de-perfil-no-linkedin',
  'Foto de perfil en LinkedIn: lo básico',
  'linkedin', 2, true,
  (select id from public.tracks where language = 'es' and slug = 'curriculo-do-zero'), 4,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Los perfiles con foto suelen recibir más visitas. No hace falta un fotógrafo: con el móvil basta."},
    {"type":"list","items":["La cara bien visible, mirando a la cámara.","Luz de frente (cerca de una ventana funciona).","Un fondo sencillo y ordenado.","Ropa parecida a la que llevarías en el puesto."]},
    {"type":"warning","text":"Evita fotos de fiesta, con otras personas recortadas, con gafas de sol o con filtros."},
    {"type":"sources","items":[
      {"title":"LinkedIn Talent Blog: 10 tips for a professional profile photo (en inglés)","url":"https://www.linkedin.com/business/talent/blog/product-tips/tips-for-taking-professional-linkedin-profile-pictures"}
    ]}
  ]$j$::jsonb
),

-- ===== Trilha: Primer empleo =====
(
  'es', 'sem-experiencia-comece-por-aqui',
  '¿Sin experiencia? Empieza por aquí',
  'primeiro_emprego', 4, false,
  (select id from public.tracks where language = 'es' and slug = 'primeiro-emprego'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Buscar el primer empleo puede parecer difícil, pero puedes organizar la búsqueda en pasos pequeños."},
    {"type":"list","ordered":true,"items":["**Elige 1 o 2 áreas** en las que centrarte (por ejemplo, atención al cliente y comercio).","**Prepara el currículum** y tu perfil de LinkedIn.","**Busca ofertas** en portales de empleo, en LinkedIn, en programas de prácticas y contratos formativos, y en tiendas y empresas de tu barrio.","**Practica la entrevista** antes de que te llamen.","**Apunta** dónde te has presentado, para hacer seguimiento."]},
    {"type":"example","title":"Consejo","text":"Presentarte a pocas ofertas con cuidado suele funcionar mejor que mandar el mismo currículum a cientos."},
    {"type":"warning","text":"Si una empresa te pide dinero con cualquier excusa, casi seguro que es un fraude. Desconfía también de ofertas con mucho sueldo sin experiencia, correos de Gmail o contrataciones sin entrevista (aviso del INCIBE)."},
    {"type":"sources","items":[
      {"title":"INCIBE: Falsas ofertas de empleo","url":"https://www.incibe.es/ciudadania/falsas-ofertas-empleo"},
      {"title":"SEPE: Contrato para la formación en alternancia","url":"https://www.sepe.es/HomeSepe/formacion-trabajo/iniciativas-formacion-trabajo/contrato-formacion-alternancia.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'contrato-formacion-alternancia',
  'Contrato de formación en alternancia: trabajar y estudiar',
  'direitos', 3, true,
  (select id from public.tracks where language = 'es' and slug = 'primeiro-emprego'), 2,
  '{jovem_aprendiz}', '{}', false,
  $j$[
    {"type":"p","text":"En España, el contrato de formación en alternancia combina un trabajo con sueldo y unos estudios: FP, universidad o cursos del catálogo del Sistema Nacional de Empleo."},
    {"type":"h","text":"Cómo funciona, según el SEPE"},
    {"type":"list","items":["**Edad:** en general, de 16 a 30 años. El límite no se aplica en estudios universitarios, FP de grado superior o certificados de nivel 3.","**Duración:** de 3 meses a 2 años.","**Plan formativo:** cada persona tiene un plan individual, con un tutor en el centro de estudios y otro en la empresa.","**Sueldo:** es un trabajo retribuido. La cantidad depende del convenio colectivo."]},
    {"type":"h","text":"Dónde buscar"},
    {"type":"p","text":"Pregunta en tu centro de FP o en tu universidad: muchos tienen acuerdos con empresas. Los servicios públicos de empleo de tu comunidad también publican ofertas."},
    {"type":"warning","text":"Las reglas las marca la ley y pueden cambiar. Consulta la información actual en la web del SEPE o con la empresa antes de decidir."},
    {"type":"sources","items":[
      {"title":"SEPE: Contrato para la formación en alternancia","url":"https://www.sepe.es/HomeSepe/formacion-trabajo/iniciativas-formacion-trabajo/contrato-formacion-alternancia.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'falar-de-salario',
  'Cómo hablar de sueldo sin miedo',
  'salario', 3, true,
  (select id from public.tracks where language = 'es' and slug = 'primeiro-emprego'), 3,
  '{primeiro_emprego,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Hablar de dinero da vergüenza a mucha gente, pero es una parte normal del proceso. Con preparación resulta más fácil."},
    {"type":"h","text":"Antes de la entrevista"},
    {"type":"list","items":["Mira si la oferta ya indica el sueldo.","Infórmate de cuánto se suele pagar por el mismo puesto en tu zona. La **Encuesta de Estructura Salarial del INE** muestra la ganancia media por tipo de ocupación, y el convenio colectivo del sector fija los mínimos.","Suma los gastos que te generará el trabajo, como transporte y comida."]},
    {"type":"h","text":"Si te preguntan cuánto quieres ganar"},
    {"type":"p","text":"Responde con una horquilla basada en tu investigación, no con una sola cifra. Si es pronto en el proceso, puedes decir que antes quieres conocer mejor el puesto."},
    {"type":"example","title":"Ejemplo","text":"“He visto que para este puesto se suele pagar entre [cantidad] y [cantidad]. Estoy abierto a hablarlo, sobre todo porque es mi primer empleo.”"},
    {"type":"p","text":"Pregunta también por el horario, las vacaciones y la formación. Todo eso cuenta."},
    {"type":"warning","text":"Los sueldos cambian según la zona, la empresa y el momento. Usa tu búsqueda como referencia, no como regla."},
    {"type":"sources","items":[
      {"title":"INE: Encuesta Anual de Estructura Salarial","url":"https://www.ine.es/dyngs/Prensa/EAES2024.htm"},
      {"title":"George Mason University Career Services: Salary Negotiation (en inglés)","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'contrato-practica-profesional',
  'Contrato para la práctica profesional: tu primer empleo con título',
  'direitos', 3, true,
  (select id from public.tracks where language = 'es' and slug = 'primeiro-emprego'), 4,
  '{estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Si ya tienes un título de FP o universitario, el contrato formativo para la obtención de la práctica profesional sirve para ganar experiencia en tu campo."},
    {"type":"h","text":"Lo básico, según el SEPE"},
    {"type":"list","items":["**Cuándo:** dentro de los 3 años siguientes a terminar los estudios (5 años para personas con discapacidad).","**Duración:** entre 6 meses y 1 año.","**Periodo de prueba:** como máximo, 1 mes.","**Sueldo:** lo fija el convenio colectivo. Pregunta cuánto será antes de firmar.","**Plan formativo:** la empresa debe asignarte un tutor y un plan de lo que vas a aprender."]},
    {"type":"example","title":"Pregunta antes de firmar","text":"“¿Qué tipo de contrato es? ¿Cuánto dura y cuál es el sueldo? ¿Quién será mi tutor?”"},
    {"type":"warning","text":"Hay excepciones y los convenios cambian. Consulta la web del SEPE o pregunta en el servicio de empleo de tu comunidad."},
    {"type":"sources","items":[
      {"title":"SEPE: Contrato formativo para la obtención de la práctica profesional","url":"https://www.sepe.es/HomeSepe/formacion-trabajo/iniciativas-formacion-trabajo/contrato-formativo-obtencion-practica-profesional.html"}
    ]}
  ]$j$::jsonb
),

-- ===== Sem trilha =====
(
  'es', 'por-que-quer-mudar-de-emprego',
  'Cómo explicar por qué quieres cambiar de trabajo',
  'entrevista', 2, false, null, null,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Si ya trabajas, casi siempre te preguntarán: “¿Por qué quieres dejar tu trabajo actual?”. Quieren saber si buscas algo o si solo huyes de algo."},
    {"type":"list","ordered":true,"items":["**Habla del futuro:** qué quieres aprender o hacer más.","**Relaciónalo con el puesto:** muestra qué tiene esta oportunidad que encaja con eso.","**Sé sincero**, sin entrar en detalles personales."]},
    {"type":"example","title":"Ejemplo","text":"“He aprendido mucho atendiendo en la tienda, pero quiero crecer hacia la parte administrativa. Este puesto reúne las dos cosas.”"},
    {"type":"warning","text":"No hables mal de tu jefe ni de tu empresa actual, aunque tengas motivos. Suele jugar en tu contra."},
    {"type":"sources","items":[
      {"title":"Robert Half: how to answer “what are your reasons for leaving a job?” (en inglés)","url":"https://www.roberthalf.com/us/en/insights/landing-job/how-to-answer-what-is-your-reason-for-leaving-a-job"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-atendimento',
  'Atención al cliente: demuestra que sabes escuchar',
  'entrevista', 2, true, null, null,
  '{}', '{atendimento}', false,
  $j$[
    {"type":"p","text":"En atención al cliente, la empresa busca a alguien que trate bien a la gente, también en los momentos difíciles. En la entrevista, tu forma de hablar ya es una prueba."},
    {"type":"h","text":"Lo que suele contar"},
    {"type":"list","items":["**Escuchar antes de responder:** dejar que la persona se explique sin interrumpir.","**Amabilidad:** saludar, llamar a la persona por su nombre, decir “por favor”.","**Sinceridad:** si no lo sabes, di que lo vas a consultar en vez de inventar.","**Calma con un cliente enfadado.**"]},
    {"type":"example","title":"Pregunta habitual","text":"“¿Cómo tratarías a un cliente enfadado?” Responde paso a paso: escuchar, disculparte por las molestias, entender el problema y decir qué vas a hacer."},
    {"type":"sources","items":[
      {"title":"TodoFP (Ministerio de Educación): Título Profesional Básico en Servicios Comerciales","url":"https://todofp.es/que-estudiar/familias-profesionales/comercio-marketing/servicios-comerciales.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-vendas',
  'Ventas: escuchar vende más que hablar',
  'entrevista', 2, true, null, null,
  '{}', '{vendas}', false,
  $j$[
    {"type":"p","text":"Mucha gente cree que un buen vendedor es el que habla mucho. En realidad, lo que más ayuda es entender qué necesita el cliente."},
    {"type":"h","text":"Demuéstralo en la entrevista"},
    {"type":"list","items":["**Escucha:** haz preguntas antes de ofrecer algo.","**Empatía:** ponte en el lugar del cliente.","**Conocer el producto:** infórmate de lo que vende la tienda o la empresa antes de ir.","**Un ejemplo real:** una rifa del instituto, vender en un mercadillo, ayudar en el negocio familiar."]},
    {"type":"example","title":"Pregunta habitual","text":"“Véndeme este bolígrafo.” En vez de enumerar sus ventajas, pregunta primero: “¿Para qué usas el bolígrafo en tu día a día?”. Luego ofrécelo como solución."},
    {"type":"sources","items":[
      {"title":"TodoFP (Ministerio de Educación): Técnico en Actividades Comerciales","url":"https://www.todofp.es/que-estudiar/familias-profesionales/comercio-marketing/actividades-comerciales.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-administrativo',
  'Puesto administrativo: la organización es tu carta de presentación',
  'entrevista', 2, true, null, null,
  '{}', '{administrativo}', false,
  $j$[
    {"type":"p","text":"El personal administrativo da apoyo a muchas áreas de la empresa: personas, contabilidad, compras, atención al cliente. Por eso la organización y la comunicación clara pesan mucho."},
    {"type":"h","text":"Lo que puedes mostrar"},
    {"type":"list","items":["**Organización:** cómo controlas plazos, tareas o documentos (agenda, lista, hoja de cálculo).","**Herramientas:** di lo que sabes de verdad de Excel, Word y correo electrónico.","**Atención al detalle:** un ejemplo en el que revisaste algo y evitaste un error.","**Trato con compañeros y clientes.**"]},
    {"type":"example","title":"Ejemplo","text":"“En el viaje de fin de curso, yo llevaba en una hoja de cálculo el dinero recaudado e hice el resumen final.”"},
    {"type":"warning","text":"Si te piden una prueba de Excel, está bien decir lo que todavía no sabes. Inventar se nota enseguida."},
    {"type":"sources","items":[
      {"title":"TodoFP (Ministerio de Educación): Técnico en Gestión Administrativa","url":"https://todofp.es/que-estudiar/familias-profesionales/administracion-gestion/gestion-administrativa.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-tecnologia',
  'Primer empleo en tecnología: enseña tus proyectos',
  'entrevista', 3, true, null, null,
  '{}', '{tecnologia}', false,
  $j$[
    {"type":"p","text":"En tecnología, los proyectos dicen más que el título. Incluso proyectos pequeños, de clase o personales, muestran lo que sabes hacer."},
    {"type":"h","text":"Monta tu escaparate en GitHub"},
    {"type":"list","ordered":true,"items":["**Escribe un README de perfil:** quién eres, qué estudias y qué tecnologías conoces.","**Fija de 3 a 5 proyectos** en tu perfil, los que más encajen con el puesto.","**Explica cada proyecto:** qué hace, cómo se ejecuta y, si puedes, un enlace para probarlo."]},
    {"type":"example","title":"En la entrevista","text":"Elige un proyecto y practica cómo contarlo: el problema, lo que construiste, una dificultad y cómo la resolviste."},
    {"type":"warning","text":"Si copiaste parte de un tutorial, dilo. Te preguntarán cómo funciona el código."},
    {"type":"sources","items":[
      {"title":"GitHub Docs: usar tu perfil de GitHub para mejorar tu currículum","url":"https://docs.github.com/es/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-marketing',
  'Marketing: un portfolio aunque no tengas experiencia',
  'entrevista', 3, true, null, null,
  '{}', '{marketing}', false,
  $j$[
    {"type":"p","text":"En marketing, quien selecciona quiere ver lo que ya has creado. Puedes montar un portfolio antes de tu primer empleo."},
    {"type":"h","text":"Qué incluir"},
    {"type":"list","items":["Trabajos de clase o de cursos.","Redes sociales que hayas llevado (de un proyecto, una asociación, el negocio de alguien de tu familia).","Voluntariado.","**Resultados en números**, si los tienes: seguidores, “me gusta”, ventas."]},
    {"type":"h","text":"Cómo organizarlo"},
    {"type":"list","items":["Empieza por tus 2 mejores trabajos.","Añade un “Sobre mí” corto.","Pon tus datos de contacto donde se vean."]},
    {"type":"warning","text":"Usa solo números que puedas demostrar. Si no tienes números, cuenta qué hiciste y qué aprendiste."},
    {"type":"sources","items":[
      {"title":"TodoFP (Ministerio de Educación): Técnico Superior en Marketing y Publicidad","url":"https://www.todofp.es/que-estudiar/familias-profesionales/comercio-marketing/marketing-publicidad.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-logistica',
  'Logística y almacén: atención, rutina y seguridad',
  'entrevista', 2, true, null, null,
  '{}', '{logistica}', false,
  $j$[
    {"type":"p","text":"Quien empieza en logística suele ayudar a recibir, almacenar, preparar y enviar mercancías. Es un trabajo de rutina en el que un error pequeño puede convertirse en un problema grande."},
    {"type":"h","text":"Qué mostrar"},
    {"type":"list","items":["**Atención al detalle:** comprobar cantidades, códigos y direcciones.","**Organización:** saber dónde está cada cosa.","**Seguridad:** cumplir las normas y usar los equipos de protección.","**Ganas de aprender** programas y aplicaciones de control de almacén."]},
    {"type":"example","title":"Ejemplo","text":"“Ayudé en la recogida de alimentos del instituto: separé los productos por tipo, apunté las cantidades y preparé los lotes.”"},
    {"type":"sources","items":[
      {"title":"TodoFP (Ministerio de Educación): Técnico Superior en Transporte y Logística","url":"https://www.todofp.es/que-estudiar/familias-profesionales/comercio-marketing/transporte-logistica.html"}
    ]}
  ]$j$::jsonb
),
(
  'es', 'entrevista-para-saude',
  'Sanidad: cuidado, ética y secreto profesional',
  'entrevista', 3, true, null, null,
  '{}', '{saude}', false,
  $j$[
    {"type":"p","text":"En sanidad, además de los conocimientos técnicos, cuenta mucho cómo tratas al paciente y su información."},
    {"type":"h","text":"Lo que suele contar"},
    {"type":"list","items":["**Respeto y dignidad:** tratar a cada paciente con cuidado y sin juzgar.","**Secreto profesional:** lo que sabes por tu trabajo no sale de allí.","**Sinceridad:** decir con claridad lo que ya sabes hacer y lo que aún estás aprendiendo.","**Conocer el centro:** infórmate de los valores del hospital o de la clínica."]},
    {"type":"example","title":"Consejo","text":"Si el puesto es de enfermería, lee el Código Ético y Deontológico de la Enfermería Española. Puede salir en preguntas sobre situaciones difíciles."},
    {"type":"sources","items":[
      {"title":"Consejo General de Enfermería: Código Ético y Deontológico de la Enfermería Española","url":"https://www.consejogeneralenfermeria.org/images/Codigo_deontologico_CGE_2026.pdf"}
    ]}
  ]$j$::jsonb
);
