-- Dicas em inglês (en). Mesmos slugs das dicas gerais em português, com fontes dos EUA e do Reino Unido.
-- Dicas só do Brasil (jovem-aprendiz-como-funciona, estagio-como-funciona) NÃO entram aqui.
-- No lugar delas: apprenticeships-how-they-work e internships-paid-or-unpaid.
-- Plano grátis: 7 de 21 (33%). Fontes conferidas em 30/09/2026.

insert into public.tracks (language, slug, title, description, sort_order) values
  ('en', 'entrevista-sem-medo', 'Interviews without fear', 'From nerves to the last question, step by step.', 1),
  ('en', 'curriculo-do-zero', 'Resume from scratch', 'Build your resume and LinkedIn even with no experience.', 2),
  ('en', 'primeiro-emprego', 'First job', 'What to know before you start working.', 3);

insert into public.tips (language, slug, title, category, read_minutes, is_premium, track_id, track_order, goals, areas, for_nervous, body) values

-- ===== Track: Interviews without fear =====
(
  'en', 'nervosismo-antes-da-entrevista',
  'Nervous? How to prepare on the day',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'en' and slug = 'entrevista-sem-medo'), 1,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"It's normal to feel nervous before an interview. The goal isn't to make the nerves disappear, it's to arrive prepared."},
    {"type":"h","text":"The day before"},
    {"type":"list","items":["Read the job ad again and look up the company.","Do a practice interview with a friend or family member (or here in the app). Say your answers out loud.","Choose your clothes, check the address or the video link, and get some sleep."]},
    {"type":"h","text":"On the day"},
    {"type":"list","items":["Arrive 5 to 10 minutes early. For online interviews, test your camera and sound first.","Take a few slow breaths before you start, and one before each answer: it gives you time to think.","If your mind goes blank, say “Let me think for a second.” Asking for a moment is fine."]},
    {"type":"example","title":"Example","text":"“Sorry, I'm a little nervous. Can I start that answer again?” Interviewers understand. Being honest comes across as confident."},
    {"type":"p","text":"If anxiety is getting in the way of your daily life, it's worth talking to a health professional."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Interview advice","url":"https://nationalcareers.service.gov.uk/careers-advice/interview-advice"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'como-responder-fale-sobre-voce',
  'How to answer “Tell me about yourself”',
  'entrevista', 2, false,
  (select id from public.tracks where language = 'en' and slug = 'entrevista-sem-medo'), 2,
  '{}', '{}', true,
  $j$[
    {"type":"p","text":"It's almost always the first question. The interviewer wants to know who you are and why you fit the job."},
    {"type":"p","text":"This isn't the time for your life story. About one minute is enough."},
    {"type":"h","text":"Use this order"},
    {"type":"list","ordered":true,"items":["**Who you are:** your name and what you study or do.","**One example:** something you did that connects to the job.","**What you're looking for:** why you want this opportunity."]},
    {"type":"example","title":"Example","text":"“I'm Alex, I'm 19 and I'm finishing a business course. At our school fair I looked after the visitors and really enjoyed it. That's why I want to start in customer service.”"},
    {"type":"warning","text":"Don't repeat your resume line by line. They've already read it. Tell them what isn't on paper."},
    {"type":"p","text":"Practice out loud two or three times. On the day, it will sound more natural."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Interview advice","url":"https://nationalcareers.service.gov.uk/careers-advice/interview-advice"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'conte-uma-historia',
  'Tell a story: the STAR method',
  'entrevista', 3, false,
  (select id from public.tracks where language = 'en' and slug = 'entrevista-sem-medo'), 3,
  '{primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Questions like “Tell me about a time you solved a problem” ask for a real story. A simple way to organize your answer is the STAR method, used by university career centers."},
    {"type":"list","ordered":true,"items":["**Situation:** where you were and what was happening. Keep it short.","**Task:** what your role or goal was.","**Action:** what YOU did. This is the biggest part of the answer: say “I”, not “we”.","**Result:** what changed and what you learned. Use a number if you can."]},
    {"type":"example","title":"Example","text":"“In a school group project, two people stopped replying (situation) and I was in charge of handing it in (task). I split the work again and set up a group chat with deadlines (action). We delivered on time and got a B+ (result).”"},
    {"type":"p","text":"No work experience? Examples from school, projects, sports and volunteering count just as much."},
    {"type":"warning","text":"Don't make stories up. Interviewers often ask about the details, and your answer may not match your resume."},
    {"type":"sources","items":[
      {"title":"MIT Career Advising: Using the STAR method","url":"https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/"},
      {"title":"National Careers Service (UK): Interview advice","url":"https://nationalcareers.service.gov.uk/careers-advice/interview-advice"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'pontos-fortes-e-fracos',
  'Strengths and weaknesses without clichés',
  'entrevista', 3, true,
  (select id from public.tracks where language = 'en' and slug = 'entrevista-sem-medo'), 4,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"“What's your biggest weakness?” sounds scary, but it's a chance to show that you know yourself and are improving."},
    {"type":"h","text":"Strength"},
    {"type":"p","text":"Pick one that matters for the job and prove it with a short example. “I'm organized” is stronger with “I made the cleaning rota for my class.”"},
    {"type":"h","text":"Weakness"},
    {"type":"list","ordered":true,"items":["Name a real one that isn't essential for the job.","Say what you're already doing to improve.","Finish by showing your progress."]},
    {"type":"example","title":"Example","text":"“I used to be shy about speaking in public. I started volunteering to present our school projects, and now I'm much more comfortable.”"},
    {"type":"warning","text":"Avoid “I'm a perfectionist” or “I work too hard”. Interviewers have heard it many times and may think you're dodging the question."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Interview advice","url":"https://nationalcareers.service.gov.uk/careers-advice/interview-advice"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'perguntas-para-fazer-no-fim',
  'Questions to ask at the end of the interview',
  'entrevista', 2, true,
  (select id from public.tracks where language = 'en' and slug = 'entrevista-sem-medo'), 5,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"At the end, you'll almost always hear: “Do you have any questions for us?” Saying “no” misses a good chance to show interest."},
    {"type":"h","text":"Good questions"},
    {"type":"list","items":["What does a normal day look like in this role?","What should the new person learn first?","How do you support people who are just starting?","What are the next steps in the process?"]},
    {"type":"example","title":"Tip","text":"Bring 2 questions written down. If one gets answered during the conversation, use the other."},
    {"type":"warning","text":"Leave questions about pay and benefits for when the company brings it up, or for the final stage if nobody has mentioned it."},
    {"type":"sources","items":[
      {"title":"MIT Career Advising: Questions to ask an interviewer","url":"https://capd.mit.edu/resources/questions-to-ask-interviewer/"},
      {"title":"George Mason University Career Services: Salary Negotiation","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
    ]}
  ]$j$::jsonb
),

-- ===== Track: Resume from scratch =====
(
  'en', 'curriculo-sem-experiencia',
  'Resume with no experience: what to include',
  'curriculo', 3, false,
  (select id from public.tracks where language = 'en' and slug = 'curriculo-do-zero'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Everyone starts with no experience. A first-job resume shows what you can already do and that you want to learn."},
    {"type":"h","text":"What goes in"},
    {"type":"list","items":["**A short introduction:** a few lines about who you are and what you want to do.","**Education:** school, grades or year of completion, and any vocational courses.","**Other courses:** free online courses count too.","**Activities:** volunteering, school projects, clubs, sports, casual or part-time work.","**Skills:** computer skills, languages (at your real level), customer service, organization."]},
    {"type":"example","title":"Example","text":"“Volunteer, school food drive (2025): organized donations and helped families at the pick-up point.”"},
    {"type":"warning","text":"Don't overstate your language or computer skills. Some employers test them on the spot."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): How to write a CV","url":"https://nationalcareers.service.gov.uk/careers-advice/cv-sections"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'curriculo-de-uma-pagina',
  'A one-page resume: what to include',
  'curriculo', 3, true,
  (select id from public.tracks where language = 'en' and slug = 'curriculo-do-zero'), 2,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Recruiters often look at a resume for just a few seconds. A well-organized page helps them find what matters. At the start of your career, one page is usually enough."},
    {"type":"h","text":"In this order"},
    {"type":"list","ordered":true,"items":["**Name and contact details:** phone, email, city and a LinkedIn link. No need for your full address.","**Introduction:** one or two lines about the job you want.","**Education and courses.**","**Experience and activities:** most recent first.","**Skills.**"]},
    {"type":"warning","text":"In the US and the UK, leave out your photo, age, date of birth, marital status and nationality. Employers don't need them to decide."},
    {"type":"p","text":"Use a simple email with your name, and save the file as PDF so the layout doesn't change on the other person's computer."},
    {"type":"sources","items":[
      {"title":"Harvard Career Services: Create a strong resume","url":"https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/"},
      {"title":"National Careers Service (UK): How to write a CV","url":"https://nationalcareers.service.gov.uk/careers-advice/cv-sections"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'titulo-do-linkedin',
  'A LinkedIn headline that helps people find you',
  'linkedin', 2, false,
  (select id from public.tracks where language = 'en' and slug = 'curriculo-do-zero'), 3,
  '{estagio,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"The headline is the line under your name, and it shows up in search results. Recruiters search by keywords, and the headline is one of the places where they count most."},
    {"type":"h","text":"A simple formula"},
    {"type":"p","text":"**What you're looking for + what you study or can do.**"},
    {"type":"example","title":"Examples","text":"“Looking for my first job in Customer Service | Business Studies student”\n“Logistics student | Excel and stock control”"},
    {"type":"warning","text":"Avoid just “Student” or “Unemployed”. Say what you want to do."},
    {"type":"sources","items":[
      {"title":"LinkedIn Help: Edit your profile headline","url":"https://www.linkedin.com/help/linkedin/answer/a542926?lang=en"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'foto-de-perfil-no-linkedin',
  'LinkedIn profile photo: the basics',
  'linkedin', 2, true,
  (select id from public.tracks where language = 'en' and slug = 'curriculo-do-zero'), 4,
  '{}', '{}', false,
  $j$[
    {"type":"p","text":"Profiles with a photo usually get more visits. You don't need a photographer: a phone is enough."},
    {"type":"list","items":["Your face clearly visible, looking at the camera.","Light in front of you (near a window works).","A plain, tidy background.","Clothes similar to what you'd wear in the job."]},
    {"type":"warning","text":"Avoid party photos, other people cropped out, sunglasses or filters."},
    {"type":"sources","items":[
      {"title":"LinkedIn Talent Blog: 10 tips for a professional profile photo","url":"https://www.linkedin.com/business/talent/blog/product-tips/tips-for-taking-professional-linkedin-profile-pictures"}
    ]}
  ]$j$::jsonb
),

-- ===== Track: First job =====
(
  'en', 'sem-experiencia-comece-por-aqui',
  'No experience? Start here',
  'primeiro_emprego', 4, false,
  (select id from public.tracks where language = 'en' and slug = 'primeiro-emprego'), 1,
  '{jovem_aprendiz,estagio,primeiro_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Looking for your first job can feel hard, but you can break the search into small steps."},
    {"type":"list","ordered":true,"items":["**Pick 1 or 2 areas** to focus on (e.g. customer service and retail).","**Write your resume** and set up your LinkedIn profile.","**Look for openings** on job sites, on LinkedIn, in internship and apprenticeship programs, and in shops and businesses near you.","**Practice interviews** before you get the call.","**Keep a list** of where you applied, so you can follow up."]},
    {"type":"example","title":"Tip","text":"Applying carefully to a few jobs usually works better than sending the same resume to hundreds."},
    {"type":"warning","text":"Honest employers never ask you to pay to get a job, whether for training, equipment or “certification”. Never deposit a check and send part of the money back. That's a scam (FTC warning)."},
    {"type":"sources","items":[
      {"title":"FTC Consumer Advice: Job scams","url":"https://consumer.ftc.gov/articles/job-scams"},
      {"title":"Apprenticeship.gov: Career seekers","url":"https://www.apprenticeship.gov/career-seekers"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'apprenticeships-how-they-work',
  'Apprenticeships: earn while you learn',
  'direitos', 3, true,
  (select id from public.tracks where language = 'en' and slug = 'primeiro-emprego'), 2,
  '{jovem_aprendiz}', '{}', false,
  $j$[
    {"type":"p","text":"An apprenticeship is a real job with training built in: you work, you're paid, and you study for a recognized qualification at the same time."},
    {"type":"h","text":"In the United States"},
    {"type":"list","items":["**Registered Apprenticeships** are approved by the Department of Labor or a state agency.","**Paid work** with a mentor, and your pay goes up as your skills grow.","**Classroom learning** alongside the job.","**A nationally recognized credential** at the end.","**Where to look:** the Apprenticeship Job Finder on apprenticeship.gov, or an American Job Center near you."]},
    {"type":"h","text":"In England"},
    {"type":"list","items":["Open to anyone **16 or over** who isn't in full-time education.","You're an **employee**: you earn a wage and get holiday pay.","At least **20% of your working hours** go to training.","Levels go from intermediate (level 2) to degree (level 6 or 7), taking **1 to 5 years**.","**Where to look:** apprenticeships.gov.uk."]},
    {"type":"warning","text":"Rules change by country and, in the US, by state. Check the official site or ask the employer before you decide."},
    {"type":"sources","items":[
      {"title":"Apprenticeship.gov (US Department of Labor): Career seekers","url":"https://www.apprenticeship.gov/career-seekers"},
      {"title":"GOV.UK: Become an apprentice","url":"https://www.apprenticeships.gov.uk/apprentices/"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'falar-de-salario',
  'How to talk about pay without fear',
  'salario', 3, true,
  (select id from public.tracks where language = 'en' and slug = 'primeiro-emprego'), 3,
  '{primeiro_emprego,novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"Talking about money makes many people uncomfortable, but it's a normal part of the process. Preparing makes it easier."},
    {"type":"h","text":"Before the interview"},
    {"type":"list","items":["Check whether the job ad already shows the pay.","Research typical pay for the same role where you live. In the US, the **Occupational Outlook Handbook** (BLS) is free and shows median pay by occupation. In the UK, each job profile on the National Careers Service shows typical salaries.","Add up the costs the job will bring, like travel and meals."]},
    {"type":"h","text":"If they ask what you expect to earn"},
    {"type":"p","text":"Give a range based on your research, not a single number. If it's early in the process, it's fine to say you'd like to understand the role better first."},
    {"type":"example","title":"Example","text":"“From what I've researched, this role usually pays between [amount] and [amount]. I'm open to talking about it, especially since this is my first job.”"},
    {"type":"p","text":"Ask about benefits too, like paid time off, health insurance or travel support. They make a real difference."},
    {"type":"warning","text":"Pay varies by region, company and time. Use your research as a guide, not a rule."},
    {"type":"sources","items":[
      {"title":"U.S. Bureau of Labor Statistics: Occupational Outlook Handbook","url":"https://www.bls.gov/ooh/"},
      {"title":"George Mason University Career Services: Salary Negotiation","url":"https://careers.gmu.edu/undergraduate-students/salary-negotiation"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'internships-paid-or-unpaid',
  'Internships in the US: paid or unpaid?',
  'direitos', 3, true,
  (select id from public.tracks where language = 'en' and slug = 'primeiro-emprego'), 4,
  '{estagio}', '{}', false,
  $j$[
    {"type":"p","text":"In the US, many internships are paid, but some aren't. For companies that make a profit, the law uses a test to decide whether an intern is really an employee."},
    {"type":"h","text":"The “primary beneficiary” test"},
    {"type":"p","text":"The question is who benefits most from the internship: you or the company. Courts look at things like:"},
    {"type":"list","items":["Whether both sides clearly agreed there would be no pay.","Whether the training is similar to what you'd get in school.","Whether it's connected to your studies (for example, academic credit).","Whether your work adds to the team's work instead of replacing paid staff.","Whether it lasts only as long as you're really learning."]},
    {"type":"p","text":"If you're actually working like an employee, you're entitled to **minimum wage and overtime pay**."},
    {"type":"example","title":"Ask before you accept","text":"“Is this internship paid? What will I learn, and who will supervise me? Does it count for credit at my school?”"},
    {"type":"warning","text":"This is US federal law for for-profit companies. States and other countries (like the UK) have their own rules. Check before you decide."},
    {"type":"sources","items":[
      {"title":"U.S. Department of Labor: Fact Sheet #71, Internship Programs","url":"https://www.dol.gov/agencies/whd/fact-sheets/71-flsa-internships"}
    ]}
  ]$j$::jsonb
),

-- ===== Sem trilha =====
(
  'en', 'por-que-quer-mudar-de-emprego',
  'How to explain why you want to change jobs',
  'entrevista', 2, false, null, null,
  '{novo_emprego}', '{}', false,
  $j$[
    {"type":"p","text":"If you already work, you'll almost always hear: “Why do you want to leave your current job?” They want to know whether you're moving toward something or just running away from something."},
    {"type":"list","ordered":true,"items":["**Talk about the future:** what you want to learn or do more of.","**Connect it to the job:** show what this opportunity offers that fits.","**Be honest**, without going into personal details."]},
    {"type":"example","title":"Example","text":"“I've learned a lot working in the store, but I want to grow into an office role. This job brings both together.”"},
    {"type":"warning","text":"Don't criticize your current boss or company, even if you have a reason. It usually counts against you."},
    {"type":"sources","items":[
      {"title":"Robert Half: How to answer “What are your reasons for leaving a job?”","url":"https://www.roberthalf.com/us/en/insights/landing-job/how-to-answer-what-is-your-reason-for-leaving-a-job"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-atendimento',
  'Customer service jobs: show that you listen',
  'entrevista', 2, true, null, null,
  '{}', '{atendimento}', false,
  $j$[
    {"type":"p","text":"In customer service, the company wants someone who treats people well, even in difficult moments. In the interview, the way you talk is already a test."},
    {"type":"h","text":"What usually counts"},
    {"type":"list","items":["**Active listening:** letting the person explain everything without interrupting.","**Courtesy:** greeting people, using their name, saying “please”.","**Honesty:** if you don't know, say you'll find out instead of guessing.","**Staying calm under pressure**, even with an upset customer."]},
    {"type":"example","title":"Common question","text":"“How would you deal with an angry customer?” Answer step by step: listen, apologize for the trouble, understand the problem and say what you'll do next."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Customer service assistant","url":"https://nationalcareers.service.gov.uk/job-profiles/customer-service-assistant"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-vendas',
  'Sales jobs: listening sells more than talking',
  'entrevista', 2, true, null, null,
  '{}', '{vendas}', false,
  $j$[
    {"type":"p","text":"Many people think a good salesperson is someone who talks a lot. In fact, what helps most is understanding what the customer needs."},
    {"type":"h","text":"Show it in the interview"},
    {"type":"list","items":["**Listening:** ask questions before offering something.","**Patience:** stay calm and friendly when it gets busy.","**Product knowledge:** research what the store or company sells before the interview.","**A real example:** a school fundraiser, selling at a market, helping in a family business."]},
    {"type":"example","title":"Common question","text":"“Sell me this pen.” Instead of listing its features, ask first: “What do you use a pen for day to day?” Then offer the pen as the solution."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Sales assistant","url":"https://nationalcareers.service.gov.uk/job-profiles/sales-assistant"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-administrativo',
  'Admin jobs: organization is your business card',
  'entrevista', 2, true, null, null,
  '{}', '{administrativo}', false,
  $j$[
    {"type":"p","text":"Admin staff support many parts of a company: people, finance, purchasing, customers. That's why organization and clear communication matter so much."},
    {"type":"h","text":"What you can show"},
    {"type":"list","items":["**Organization:** how you keep track of deadlines, tasks or documents (calendar, list, spreadsheet).","**Prioritizing:** how you decide what to do first when everything is urgent. Interviewers often test this.","**Tools:** say what you really know in Excel, Word and email.","**Attention to detail:** an example where you checked something and avoided a mistake."]},
    {"type":"example","title":"Example","text":"“In the student council, I tracked the money from the school fair in a spreadsheet and wrote the report at the end.”"},
    {"type":"warning","text":"If they give you an Excel test, it's fine to say what you don't know yet. Making things up shows right away."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Admin assistant","url":"https://nationalcareers.service.gov.uk/job-profiles/admin-assistant"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-tecnologia',
  'First tech job: show your projects',
  'entrevista', 3, true, null, null,
  '{}', '{tecnologia}', false,
  $j$[
    {"type":"p","text":"In tech, projects speak louder than diplomas. Even small projects, from a course or your own, show what you can do."},
    {"type":"h","text":"Build your showcase on GitHub"},
    {"type":"list","ordered":true,"items":["**Write a profile README:** who you are, what you're studying and the technologies you know.","**Pin 3 to 5 projects** on your profile, the ones that best fit the job.","**Explain each project:** what it does, how to run it and, if possible, a link to try it."]},
    {"type":"example","title":"In the interview","text":"Pick one project and practice telling its story: the problem, what you built, one difficulty and how you solved it."},
    {"type":"warning","text":"If part of it came from a tutorial, say so. They'll ask how the code works."},
    {"type":"sources","items":[
      {"title":"GitHub Docs: Using your GitHub profile to enhance your resume","url":"https://docs.github.com/en/account-and-profile/tutorials/using-your-github-profile-to-enhance-your-resume"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-marketing',
  'Marketing: a portfolio even with no experience',
  'entrevista', 3, true, null, null,
  '{}', '{marketing}', false,
  $j$[
    {"type":"p","text":"In marketing, recruiters want to see what you've already created. You can build a portfolio before your first job."},
    {"type":"h","text":"What to include"},
    {"type":"list","items":["School or course work.","Social media you've run (for a project, a club, a family business).","Volunteering, for example posts and communication for a charity.","A blog, podcast or simple website of your own.","**Results in numbers** when you have them: followers, likes, sales."]},
    {"type":"h","text":"How to organize it"},
    {"type":"list","items":["Start with your 2 best pieces.","Add a short “About me”.","Make your contact details easy to find."]},
    {"type":"warning","text":"Only use numbers you can prove. If you don't have numbers, explain what you did and what you learned."},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Marketing executive","url":"https://nationalcareers.service.gov.uk/job-profiles/marketing-executive"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-logistica',
  'Warehouse and logistics: care, routine and safety',
  'entrevista', 2, true, null, null,
  '{}', '{logistica}', false,
  $j$[
    {"type":"p","text":"Entry-level logistics jobs usually involve receiving, storing, picking and shipping goods. It's routine work where a small mistake can become a big problem."},
    {"type":"h","text":"What to show"},
    {"type":"list","items":["**Attention to detail:** checking quantities, codes and addresses.","**Organization:** knowing where everything is and managing your time.","**Safety:** following the rules and using protective equipment.","**Willingness to learn** stock systems and handheld scanners."]},
    {"type":"example","title":"Example","text":"“I helped with the school food drive: I sorted items by type, recorded the quantities and packed the boxes.”"},
    {"type":"sources","items":[
      {"title":"National Careers Service (UK): Warehouse worker","url":"https://nationalcareers.service.gov.uk/job-profiles/warehouse-worker"}
    ]}
  ]$j$::jsonb
),
(
  'en', 'entrevista-para-saude',
  'Health care: care, ethics and confidentiality',
  'entrevista', 3, true, null, null,
  '{}', '{saude}', false,
  $j$[
    {"type":"p","text":"In health care, besides technical knowledge, the way you treat patients and their information matters a lot."},
    {"type":"h","text":"What usually counts"},
    {"type":"list","items":["**Respect and dignity:** treating every patient with care and without judgment.","**Confidentiality:** what you learn at work stays at work.","**Honesty:** saying clearly what you can already do and what you're still learning.","**Knowing the place:** research the hospital's or clinic's values."]},
    {"type":"example","title":"Tip","text":"If the job is in nursing, read your professional code of conduct. In the UK, that's the NMC Code. It may come up in questions about difficult situations."},
    {"type":"sources","items":[
      {"title":"Nursing and Midwifery Council (UK): The Code","url":"https://www.nmc.org.uk/standards/code/"}
    ]}
  ]$j$::jsonb
);
