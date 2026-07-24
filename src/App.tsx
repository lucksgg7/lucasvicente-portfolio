import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  ChevronDown,
  Download,
  Github,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Send,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = "0x4AAAAAACosHZqdoFP4G353";

type Locale = "es" | "en";

type Project = {
  title: string;
  tag: string;
  type: string;
  context: string;
  decision: string;
  result: string;
  metrics?: string[];
  stack: string;
  repo?: string;
  live?: string;
  nda?: boolean;
  diagram?: string;
  screenshots?: string[];
};

type ScreenshotModal = {
  src: string;
  title: string;
  index: number;
};

const LINKS = {
  githubProfile: "https://github.com/lucasvicentec",
  githubPortfolio: "https://github.com/lucasvicentec/lucasvicente-portfolio",
  githubStackWatch: "https://github.com/lucasvicentec/stackwatch",
  linkedinProfile: "https://www.linkedin.com/in/lucas-esteban-vicente-cerri-3073a8330/",
  email: "contacto@lucasvicente.es",
  calendly: "https://calendly.com/lucasvicentecerri6/30min",
  statusPage: "https://status.lucasvicente.es/",
} as const;

// Casos que se muestran sin desplegar; el resto va tras el boton "ver mas".
const VISIBLE_CASES = 3;

const projectsByLocale: Record<Locale, Project[]> = {
  es: [
    {
      title: "RiftPanel",
      tag: "Vendido",
      type: "Panel SaaS para hosting de juegos",
      context:
        "Los proveedores de hosting necesitan Pterodactyl + WHMCS + portal de cliente. Tres herramientas separadas, alto coste y complejidad.",
      decision:
        "Backend en Go (Fiber) en lugar de PHP por rendimiento. Integración directa con Wings para compatibilidad total con nodos existentes.",
      result:
        "Plataforma todo-en-uno con facturación integrada (Stripe/Paddle), 40+ plantillas, 31 módulos, sistema de licencias propio. Salió a producción en 2 semanas vs 3-4 meses estimados a desarrollo tradicional. El producto y el código fueron vendidos a un tercero.",
      metrics: ["De 0 a producción en 2 semanas", "29 servidores · 7 clientes de pago", "Producto y código vendidos"],
      stack: "Go 1.25, Fiber, React 18, TypeScript, Tailwind, PostgreSQL, Docker, Stripe, Paddle, WebSocket",
      live: "https://riftpanel.net",
      screenshots: [
        "/images/riftpanel_1.webp",
        "/images/riftpanel_2.webp",
        "/images/riftpanel_3.webp",
        "/images/riftpanel_4.webp",
      ],
    },
    {
      title: "Farmacenter",
      tag: "Producción",
      type: "Agentes IA · Atención multicanal",
      context:
        "Una farmacia en Colombia necesitaba atención automatizada 24/7 y digitalizar pedidos, consultas y cotizaciones a proveedores sin ampliar plantilla.",
      decision:
        "Un único 'cerebro' (agente con tool-calling sobre LLM) compartido por WhatsApp, Messenger, Telegram y voz. Tools con acceso real a catálogo y pedidos, guardrails sanitarios y derivación a humano. Voz por telefonía con Vapi + gpt-4o-mini (pipeline STT→LLM→TTS); también con experiencia en Gemini Live (speech-to-speech) para baja latencia. LLM elegido por caso de uso: gpt-4o-mini para el agente de texto y de voz por coste/latencia, y Claude como copiloto de construcción.",
      result:
        "Agente en producción que busca productos, crea pedidos y deriva a un operador cuando hace falta. Panel con RBAC, vault de claves cifradas (AES-256-GCM) y configuración en caliente. Pedidos por voz creados end-to-end.",
      metrics: [
        "Agente con 13 tools",
        "4 canales: WhatsApp, Messenger, Telegram, voz",
        "Voz por telefonía (Vapi + gpt-4o-mini)",
        "Desplegado en Docker Swarm",
      ],
      stack: "Fastify, Node.js, TypeScript, OpenAI (gpt-4o-mini), Vapi, Gemini Live, Supabase, PostgreSQL, Docker Swarm, WhatsApp Cloud API, Twilio",
      diagram: "/images/farmacenter-arquitectura.webp",
      nda: true,
    },
    {
      title: "Informo",
      tag: "Producción",
      type: "SaaS · Canal de denuncias",
      context:
        "Las empresas con +50 empleados están obligadas por la Ley 2/2023 a tener un canal de denuncias.",
      decision:
        "Cifrado AES-256-GCM extremo a extremo sobre Supabase para garantizar anonimato real sin sacrificar velocidad de desarrollo.",
      result:
        "SaaS en producción con denuncias cifradas, panel de gestión, seguimiento anónimo, exportación Libro-Registro AIPI y verificación QR. Producto cerrado y listo, pendiente de campaña GTM.",
      metrics: ["Cumplimiento Ley 2/2023", "AES-256-GCM e2e", "Listo para producción"],
      stack: "Next.js 15, React 19, TypeScript, Tailwind, Supabase, AES-256, Docker, Zod",
      live: "https://informo.es",
      screenshots: [
        "/images/informo_1.webp",
        "/images/informo_2.webp",
        "/images/informo_3.webp",
        "/images/informo_4.webp",
      ],
    },
    {
      title: "VarynHost",
      tag: "Vendido",
      type: "Hosting · Infra y automatización",
      context:
        "Servicio de hosting con paneles custom, automatización y operación diaria para clientes reales.",
      decision:
        "Pterodactyl + WHMCS + APIs propias para balancear velocidad de entrega y operación mantenible.",
      result:
        "Infra gestionada sobre VPS/dedicados (EU), provisión automatizada y soporte continuo. El servicio fue vendido a otra empresa, que lo opera actualmente.",
      metrics: ["+60 clientes activos", "Provisión automatizada", "Vendido a otra empresa"],
      stack: "Pterodactyl, WHMCS, APIs REST, Linux, Docker, Nginx",
      screenshots: [
        "/images/varynhost_1.webp",
        "/images/varynhost_2.webp",
        "/images/varynhost_3.webp",
        "/images/varynhost_4.webp",
      ],
    },
    {
      title: "StackWatch",
      tag: "Open source",
      type: "Monitorización autoalojable",
      context:
        "Falta una solución de monitorización ligera, autoalojada y simple para VPS/dedicados sin la sobrecarga de Datadog/Grafana.",
      decision:
        "PostgreSQL + worker interno (vs cron externo) para mantener histórico consistente y controlar reintentos en un solo punto. Open source para que cualquiera lo despliegue.",
      result:
        "Sistema autoalojable que cualquier persona puede usar para sus VPS o dedicados. Checks cada 60s, histórico, gestión de incidentes y status page configurable.",
      metrics: ["Open source", "Checks cada 60s", "VPS y dedicados"],
      stack: "Next.js 16, TypeScript, PostgreSQL, Docker Swarm, REST API",
      repo: LINKS.githubStackWatch,
      screenshots: ["/images/stackwatch_1.webp", "/images/stackwatch_2.webp"],
    },
    {
      title: "Finesse",
      tag: "Producción",
      type: "PWA · Finanzas compartidas",
      context:
        "Alternativa a Splitwise para gestionar gastos personales y grupales con proyecciones y reparto inteligente.",
      decision:
        "Supabase (Auth + RLS + Realtime) sobre backend propio para acelerar el MVP sin sacrificar seguridad.",
      result:
        "App PWA con OAuth, modo offline, importación CSV/Splitwise, categorías custom y asistente financiero (Fina).",
      metrics: ["216 usuarios activos", "500+ gastos registrados", "248 grupos creados"],
      stack: "Next.js 16, React 19, TypeScript, Tailwind, Supabase, Framer Motion, PWA",
      live: "https://finesseapp.es",
      screenshots: ["/images/finesse_1.webp", "/images/finesse_2.webp", "/images/finesse_3.webp"],
    },
    {
      title: "Hytalia Web",
      tag: "Producción",
      type: "Plataforma de comunidad",
      context:
        "Frontend principal para usuarios de comunidad con login, panel y módulos de producto.",
      decision:
        "Arquitectura transicional para migrar legacy sin frenar entregas semanales.",
      result:
        "Producto en producción con despliegue continuo y módulos reutilizables.",
      metrics: ["+5.000 usuarios totales", "+3.000 registrados", "Récord de concurrencia"],
      stack: "Next.js 14, React 18, TypeScript, Tailwind, NextAuth, Docker Swarm",
      screenshots: ["/images/hytalia_1.webp", "/images/hytalia_2.webp", "/images/hytalia_3.webp"],
    },
  ],
  en: [
    {
      title: "RiftPanel",
      tag: "Acquired",
      type: "Game hosting SaaS panel",
      context:
        "Hosting providers need Pterodactyl + WHMCS + a customer portal. Three separate tools with high cost and complexity.",
      decision:
        "Go backend (Fiber) instead of PHP for performance. Direct Wings integration for full compatibility with existing nodes.",
      result:
        "All-in-one platform with built-in billing (Stripe/Paddle), 40+ templates, 31 modules, custom license system. Shipped to production in 2 weeks vs 3-4 months estimated for traditional development. The product and codebase were later sold to a third party.",
      metrics: ["0 to production in 2 weeks", "29 servers · 7 paying customers", "Product and codebase sold"],
      stack: "Go 1.25, Fiber, React 18, TypeScript, Tailwind, PostgreSQL, Docker, Stripe, Paddle, WebSocket",
      live: "https://riftpanel.net",
      screenshots: [
        "/images/riftpanel_1.webp",
        "/images/riftpanel_2.webp",
        "/images/riftpanel_3.webp",
        "/images/riftpanel_4.webp",
      ],
    },
    {
      title: "Farmacenter",
      tag: "Production",
      type: "AI agents · Multichannel support",
      context:
        "A pharmacy in Colombia needed 24/7 automated support and to digitize orders, queries, and supplier quotes without growing headcount.",
      decision:
        "A single 'brain' (LLM agent with tool-calling) shared across WhatsApp, Messenger, Telegram, and voice. Tools with real catalog and order access, healthcare guardrails, and human handoff. Telephony voice with Vapi + gpt-4o-mini (STT→LLM→TTS pipeline); also experienced with Gemini Live (speech-to-speech) for low latency. LLM chosen per use case: gpt-4o-mini for the text and voice agent for cost/latency, and Claude as the build copilot.",
      result:
        "Production agent that searches products, creates orders, and hands off to an operator when needed. Admin panel with RBAC, an encrypted secrets vault (AES-256-GCM), and hot config. Voice orders created end-to-end.",
      metrics: [
        "Agent with 13 tools",
        "4 channels: WhatsApp, Messenger, Telegram, voice",
        "Telephony voice (Vapi + gpt-4o-mini)",
        "Deployed on Docker Swarm",
      ],
      stack: "Fastify, Node.js, TypeScript, OpenAI (gpt-4o-mini), Vapi, Gemini Live, Supabase, PostgreSQL, Docker Swarm, WhatsApp Cloud API, Twilio",
      diagram: "/images/farmacenter-arquitectura.webp",
      nda: true,
    },
    {
      title: "Informo",
      tag: "Production",
      type: "Whistleblowing channel SaaS",
      context:
        "Spanish companies with 50+ employees are legally required to have a whistleblowing channel (Law 2/2023).",
      decision:
        "End-to-end AES-256-GCM encryption on top of Supabase to guarantee real reporter anonymity without sacrificing development speed.",
      result:
        "Production SaaS with encrypted reports, management dashboard, anonymous tracking, AIPI-compliant export, and QR verification. Product complete and production-ready, GTM campaign pending.",
      metrics: ["Law 2/2023 compliant", "AES-256-GCM e2e", "Production ready"],
      stack: "Next.js 15, React 19, TypeScript, Tailwind, Supabase, AES-256, Docker, Zod",
      live: "https://informo.es",
      screenshots: [
        "/images/informo_1.webp",
        "/images/informo_2.webp",
        "/images/informo_3.webp",
        "/images/informo_4.webp",
      ],
    },
    {
      title: "VarynHost",
      tag: "Acquired",
      type: "Hosting · Infra and automation",
      context:
        "Hosting service with custom panels, automation, and day-to-day operations for real clients.",
      decision:
        "Pterodactyl + WHMCS + custom APIs to balance delivery speed with maintainable operations.",
      result:
        "Infrastructure on EU VPS/dedicated nodes with automated provisioning and continuous support. The service was sold to another company, which runs it today.",
      metrics: ["60+ active clients", "Automated provisioning", "Sold to another company"],
      stack: "Pterodactyl, WHMCS, REST APIs, Linux, Docker, Nginx",
      screenshots: [
        "/images/varynhost_1.webp",
        "/images/varynhost_2.webp",
        "/images/varynhost_3.webp",
        "/images/varynhost_4.webp",
      ],
    },
    {
      title: "StackWatch",
      tag: "Open source",
      type: "Self-hosted monitoring",
      context:
        "Lightweight, self-hosted monitoring for VPS/dedicated servers without the overhead of Datadog/Grafana was missing.",
      decision:
        "PostgreSQL + an internal worker (vs external cron) to keep history consistent and retry logic centralized. Open source so anyone can self-host.",
      result:
        "Self-hostable system anyone can run on their VPS or dedicated servers. 60s checks, history, incident management, and a configurable status page.",
      metrics: ["Open source", "60s checks", "VPS & dedicated"],
      stack: "Next.js 16, TypeScript, PostgreSQL, Docker Swarm, REST API",
      repo: LINKS.githubStackWatch,
      screenshots: ["/images/stackwatch_1.webp", "/images/stackwatch_2.webp"],
    },
    {
      title: "Finesse",
      tag: "Production",
      type: "Shared finance PWA",
      context:
        "Splitwise alternative for personal and group expense tracking with projections and smart splitting.",
      decision:
        "Supabase (Auth + RLS + Realtime) over a custom backend to ship the MVP faster without sacrificing security.",
      result:
        "PWA with OAuth, offline mode, CSV/Splitwise import, custom categories, and a financial assistant (Fina).",
      metrics: ["216 active users", "500+ expenses tracked", "248 groups"],
      stack: "Next.js 16, React 19, TypeScript, Tailwind, Supabase, Framer Motion, PWA",
      live: "https://finesseapp.es",
      screenshots: ["/images/finesse_1.webp", "/images/finesse_2.webp", "/images/finesse_3.webp"],
    },
    {
      title: "Hytalia Web",
      tag: "Production",
      type: "Community platform",
      context:
        "Main frontend for community users with login, admin panel, and product modules.",
      decision:
        "Transitional architecture to migrate legacy paths without blocking weekly delivery.",
      result:
        "Production app with continuous deploys and reusable modules.",
      metrics: ["5,000+ total users", "3,000+ registered", "Peak concurrency record"],
      stack: "Next.js 14, React 18, TypeScript, Tailwind, NextAuth, Docker Swarm",
      screenshots: ["/images/hytalia_1.webp", "/images/hytalia_2.webp", "/images/hytalia_3.webp"],
    },
  ],
};

const stackGroups = [
  { label: "IA / Agentes", items: "LLMs · Tool-calling · RAG · Voice AI · Prompt Engineering" },
  { label: "Frontend", items: "React · Next.js · TypeScript · Tailwind" },
  { label: "Backend", items: "Go · Node · Fastify · PostgreSQL · Supabase · Redis" },
  { label: "Infra", items: "Docker · Docker Swarm · Linux · Nginx · Cloudflare" },
];

const stats = {
  es: [
    { value: "2", label: "productos construidos y vendidos" },
    { value: "7", label: "productos lanzados" },
    { value: "60+", label: "clientes gestionados en VarynHost" },
    { value: "5K+", label: "usuarios en productos lanzados" },
  ],
  en: [
    { value: "2", label: "products built and sold" },
    { value: "7", label: "products shipped" },
    { value: "60+", label: "clients managed at VarynHost" },
    { value: "5K+", label: "users across shipped products" },
  ],
} as const;

type Certification = {
  name: string;
  issuer: string;
  year: string;
  verify?: string;
};

const certifications: Certification[] = [
  {
    name: "EF SET English Certificate — C2 Proficient (74/100)",
    issuer: "EF Standard English Test",
    year: "2026",
    verify: "https://cert.efset.org/en/NyH1tG",
  },
  {
    name: "Claude Code in Action",
    issuer: "Anthropic",
    year: "2026",
    verify: "http://verify.skilljar.com/c/8qrsg8pwzoce",
  },
  {
    name: "Claude 101",
    issuer: "Anthropic",
    year: "2026",
    verify: "http://verify.skilljar.com/c/ro59rxgrzzy4",
  },
  {
    name: "Prompt Engineering for Everyone",
    issuer: "Cognitive Class (IBM)",
    year: "2026",
    verify: "https://courses.cognitiveclass.ai/certificates/a9d3b7c95cb94194a154caeae6840704",
  },
  {
    name: "Docker Essentials: A Developer Introduction",
    issuer: "Cognitive Class (IBM)",
    year: "2026",
    verify: "https://courses.cognitiveclass.ai/certificates/86aea31fd8ca4d629393b249b4a41df1",
  },
  {
    name: "Ask Questions to Make Data-Driven Decisions",
    issuer: "Google",
    year: "2026",
    verify: "https://coursera.org/verify/YHNZJC3PK7SK",
  },
  {
    name: "Foundations: Data, Data, Everywhere",
    issuer: "Google",
    year: "2025",
    verify: "https://coursera.org/verify/WWMBN4FX5SCP",
  },
];

const trustedBy = [
  { name: "Hytalia Network", note: "Partner & Director" },
  { name: "Peyleth & Mood Studios", note: "Joint Venture · USA" },
  { name: "Madrid Digital", note: "Cliente vía Ayesa" },
  { name: "VarynHost", note: "Co-fundador · vendido" },
];

const copy = {
  es: {
    navProjects: "Casos",
    navAi: "IA",
    navProcess: "Cómo trabajo",
    navHiring: "Contratación",
    contactCta: "Contactar",
    available: "Disponible · 15 días de aviso",
    locationPill: "Madrid · Full-time · Remoto desde Madrid",
    heroEyebrow: "AI Solutions Builder",
    showMoreCases: "Ver más casos",
    showLessCases: "Ver menos casos",
    heroTitle: "Diseño, monto y mantengo producto en producción — con IA de por medio.",
    heroIntro:
      "Construyo agentes de IA con tool-calling, voz en tiempo real y automatización conversacional multicanal, además de paneles, billing, compliance e infraestructura. Producto end-to-end bajo el mismo techo cuando hace falta.",
    heroPrimary: "Ver casos",
    heroSecondary: "Hablemos",
    heroDownloadCv: "Descargar CV",
    heroBookCall: "Reservar 30 min",
    trustedByLabel: "He trabajado con",
    sectionCasesEyebrow: "Casos",
    sectionCasesTitle: "Trabajo seleccionado",
    sectionCasesIntro:
      "Cada proyecto incluye contexto real, una decisión técnica concreta y resultados medibles.",
    challenge: "Contexto",
    decision: "Decisión",
    result: "Resultado",
    stackLabel: "Stack",
    viewLive: "Ver online",
    viewRepo: "Repositorio",
    ndaLabel:
      "Bajo NDA · arquitectura y decisiones compartibles, datos sensibles no públicos.",
    sectionProcessEyebrow: "Cómo trabajo",
    sectionProcessTitle: "Honesto sobre mi proceso",
    processItems: [
      {
        title: "Velocidad real, con datos",
        body:
          "RiftPanel salió a producción en 2 semanas. Estimación de desarrollo tradicional con equipo: 3-4 meses. 8x más rápido sin sacrificar arquitectura, billing ni infra.",
      },
      {
        title: "Workflow AI-Augmented",
        body:
          "Cada proyecto empieza con un prompt inicial y un script que genera la arquitectura. Después escribo los .md de contexto que mis agentes necesitan para entender el producto. Iteración constante.",
      },
      {
        title: "Ownership end-to-end",
        body:
          "Diseño, despliego, monitorizo y mantengo. He gestionado +60 servidores, billing real con Stripe/Paddle y cumplimiento regulatorio (AES-256, AIPI, Ley 2/2023).",
      },
      {
        title: "Idiomas y comunicación",
        body:
          "Nativo en español. Comprensión de inglés certificada C2 (EF SET 74/100, jul 2026): leo documentación, specs y código técnico sin fricción, y sigo contenido y reuniones en inglés. Expresión escrita funcional; la hablada, en progreso. Encaje directo en equipos españoles y en entornos con documentación en inglés.",
      },
    ],
    sectionAiEyebrow: "Agentes IA",
    sectionAiTitle: "Lo que construyo con IA",
    sectionAiIntro:
      "No solo uso IA para programar más rápido: diseño y despliego agentes que trabajan en producción.",
    aiCapabilities: [
      {
        title: "Agentes con tool-calling",
        body:
          "Agentes LLM con acceso real al negocio (catálogo, pedidos, derivación a humano), guardrails y un único 'cerebro' compartido entre canales.",
      },
      {
        title: "Voz en tiempo real",
        body:
          "Voz por telefonía con Vapi + gpt-4o-mini (pipeline STT→LLM→TTS) que conduce el flujo, crea pedidos y responde con baja latencia; también con experiencia en Gemini Live (speech-to-speech).",
      },
      {
        title: "Automatización conversacional",
        body:
          "Bots multicanal en WhatsApp, Messenger y Telegram con FSM determinista para el checkout y auto-derivación a un operador humano.",
      },
      {
        title: "RAG y contexto estructurado",
        body:
          "Documentación .md de contexto, prompts estructurados y recuperación de información para que el agente entienda el producto y responda con datos reales.",
      },
    ],
    sectionStackEyebrow: "Stack",
    sectionStackTitle: "Tecnologías que uso en producción",
    sectionHiringEyebrow: "Contratación",
    sectionHiringTitle: "Si tu equipo necesita ejecutar rápido sin perder calidad",
    sectionHiringText:
      "Abierto a roles de AI Solutions Builder, automatización con IA, implementación e integración de soluciones, arquitectura de producto SaaS o Customer Success técnico, y perfiles híbridos entre tecnología, producto y negocio. Madrid presencial, híbrido o remoto desde Madrid. Full-time, 15 días de aviso.",
    sectionHiringPoints: [
      "AI Solutions Builder",
      "Automatización con IA",
      "Arquitecto de Soluciones",
      "Product Owner",
    ],
    contactFormTitle: "Hablemos",
    contactFormSubtitle: "Cuéntame qué buscas. Respondo en menos de 24h.",
    contactFormName: "Nombre",
    contactFormEmail: "Email",
    contactFormSubject: "Asunto",
    contactFormMessage: "Mensaje",
    contactFormSend: "Enviar",
    contactFormSending: "Enviando...",
    contactFormSuccess: "Mensaje enviado. Te respondo en menos de 24h.",
    contactFormError: "Error al enviar. Inténtalo de nuevo.",
    footerSource: "Código fuente de este portfolio",
    diagramLabel: "Arquitectura",
    screenshotsLabel: "Capturas",
    sectionCertsEyebrow: "Credenciales",
    sectionCertsTitle: "Certificaciones",
    sectionCertsIntro:
      "Formación verificable en IA, prompting e infraestructura.",
    certVerify: "Verificar",
  },
  en: {
    navProjects: "Cases",
    navAi: "AI",
    navProcess: "How I work",
    navHiring: "Hiring",
    contactCta: "Contact",
    available: "Available · 15-day notice",
    locationPill: "Madrid · Full-time · Remote from Madrid",
    heroEyebrow: "AI Solutions Builder",
    showMoreCases: "Show more cases",
    showLessCases: "Show fewer cases",
    heroTitle: "I design, build, and maintain product in production — with AI in the loop.",
    heroIntro:
      "I build AI agents with tool-calling, real-time voice, and multichannel conversational automation, plus dashboards, billing, compliance, and infrastructure. End-to-end product under one roof when needed.",
    heroPrimary: "View cases",
    heroSecondary: "Let's talk",
    heroDownloadCv: "Download CV",
    heroBookCall: "Book 30 min",
    trustedByLabel: "Worked with",
    sectionCasesEyebrow: "Cases",
    sectionCasesTitle: "Selected work",
    sectionCasesIntro:
      "Each project includes real context, a concrete technical decision, and measurable results.",
    challenge: "Context",
    decision: "Decision",
    result: "Result",
    stackLabel: "Stack",
    viewLive: "Visit live",
    viewRepo: "Repository",
    ndaLabel:
      "Under NDA · architecture and decisions are shareable, sensitive data is not public.",
    sectionProcessEyebrow: "How I work",
    sectionProcessTitle: "Honest about my process",
    processItems: [
      {
        title: "Real speed, with data",
        body:
          "RiftPanel shipped to production in 2 weeks. Traditional team development estimate: 3-4 months. 8x faster without sacrificing architecture, billing, or infra.",
      },
      {
        title: "AI-Augmented workflow",
        body:
          "Every project starts with an initial prompt and a script that generates the architecture. Then I write the .md context files my agents need to understand the product. Constant iteration.",
      },
      {
        title: "End-to-end ownership",
        body:
          "I design, deploy, monitor, and maintain. I've managed 60+ servers, real Stripe/Paddle billing, and regulatory compliance (AES-256, AIPI, Spanish Law 2/2023).",
      },
      {
        title: "Languages and communication",
        body:
          "Native Spanish speaker. Certified C2 English comprehension (EF SET 74/100, Jul 2026): I read documentation, specs, and technical code with no friction, and follow English content and meetings. Functional written English; spoken still improving. Direct fit for Spanish teams and for environments working in English.",
      },
    ],
    sectionAiEyebrow: "AI agents",
    sectionAiTitle: "What I build with AI",
    sectionAiIntro:
      "I don't just use AI to code faster: I design and ship agents that run in production.",
    aiCapabilities: [
      {
        title: "Tool-calling agents",
        body:
          "LLM agents with real business access (catalog, orders, human handoff), guardrails, and a single 'brain' shared across channels.",
      },
      {
        title: "Real-time voice",
        body:
          "Telephony voice with Vapi + gpt-4o-mini (STT→LLM→TTS pipeline) that drives the flow, creates orders, and replies with low latency; also experienced with Gemini Live (speech-to-speech).",
      },
      {
        title: "Conversational automation",
        body:
          "Multichannel bots on WhatsApp, Messenger, and Telegram with a deterministic checkout FSM and automatic handoff to a human operator.",
      },
      {
        title: "RAG and structured context",
        body:
          "Context .md docs, structured prompts, and retrieval so the agent understands the product and answers with real data.",
      },
    ],
    sectionStackEyebrow: "Stack",
    sectionStackTitle: "Tech I use in production",
    sectionHiringEyebrow: "Hiring",
    sectionHiringTitle: "If your team needs to execute fast without losing quality",
    sectionHiringText:
      "Open to AI Solutions Builder, AI automation, solution implementation and integration, SaaS product architecture, or technical Customer Success roles, plus hybrid profiles across tech, product, and business. Madrid on-site, hybrid, or remote from Madrid. Full-time, 15-day notice.",
    sectionHiringPoints: [
      "AI Solutions Builder",
      "AI automation",
      "Solutions Architect",
      "Product Owner",
    ],
    contactFormTitle: "Let's talk",
    contactFormSubtitle: "Tell me what you're looking for. I reply within 24h.",
    contactFormName: "Name",
    contactFormEmail: "Email",
    contactFormSubject: "Subject",
    contactFormMessage: "Message",
    contactFormSend: "Send",
    contactFormSending: "Sending...",
    contactFormSuccess: "Message sent. I'll get back within 24h.",
    contactFormError: "Failed to send. Please try again.",
    footerSource: "Source code for this portfolio",
    diagramLabel: "Architecture",
    screenshotsLabel: "Screenshots",
    sectionCertsEyebrow: "Credentials",
    sectionCertsTitle: "Certifications",
    sectionCertsIntro:
      "Verifiable training in AI, prompting, and infrastructure.",
    certVerify: "Verify",
  },
} as const;

function App() {
  const [lang, setLang] = useState<Locale>("es");
  const t = copy[lang];
  const projects = projectsByLocale[lang];
  const projectStats = stats[lang];

  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );
  const [activeSection, setActiveSection] = useState<string>("");

  const [activeScreenshot, setActiveScreenshot] = useState<ScreenshotModal | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllCases, setShowAllCases] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = ["projects", "ai", "process", "hiring"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveScreenshot(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = activeScreenshot ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeScreenshot]);

  useEffect(() => {
    if (!showContactForm) {
      setTurnstileToken("");
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = undefined;
      }
      return;
    }

    const renderWidget = () => {
      if (!turnstileContainerRef.current || !window.turnstile) return false;
      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "auto",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
      });
      return true;
    };

    if (!renderWidget()) {
      const interval = setInterval(() => {
        if (renderWidget()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [showContactForm]);

  const handleContactSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!turnstileToken || contactStatus === "sending") return;

      setContactStatus("sending");

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contactForm, turnstileToken }),
        });

        if (res.ok) {
          setContactStatus("success");
          setContactForm({ name: "", email: "", subject: "", message: "" });
        } else {
          setContactStatus("error");
        }
      } catch {
        setContactStatus("error");
      }
    },
    [contactForm, turnstileToken, contactStatus],
  );

  const navItems = [
    { id: "projects", label: t.navProjects },
    { id: "ai", label: t.navAi },
    { id: "process", label: t.navProcess },
    { id: "hiring", label: t.navHiring },
  ];
  const visibleProjects = showAllCases ? projects : projects.slice(0, VISIBLE_CASES);

  const handleContactDialogChange = (open: boolean) => {
    setShowContactForm(open);
    if (!open) setContactStatus("idle");
  };

  return (
    <div className="min-h-screen animate-blur-in bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
          <a href="#home" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              LV
            </span>
            <span className="hidden sm:inline">Lucas Vicente</span>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  "transition hover:text-blue-600",
                  activeSection === item.id && "font-medium text-blue-600",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 rounded-md border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={cn(
                  "rounded px-2 py-1 font-medium transition",
                  lang === "es"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn(
                  "rounded px-2 py-1 font-medium transition",
                  lang === "en"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                EN
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <Button size="sm" onClick={() => setShowContactForm(true)}>
              {t.contactCta}
              <ArrowRight />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="border-t sm:hidden">
            <div className="mx-auto flex max-w-5xl flex-col px-5 py-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={"#" + item.id}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "py-2.5 text-sm transition hover:text-blue-600",
                    activeSection === item.id
                      ? "font-medium text-blue-600"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main id="home" className="mx-auto w-full max-w-5xl px-5">
        <section className="relative pt-16 pb-24 sm:pt-20 sm:pb-32">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-72 grid-pattern opacity-60" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-4">
              <img
                src="/foto.jpg"
                alt="Lucas Vicente"
                className="h-20 w-20 rounded-full border-2 border-background object-cover ring-2 ring-blue-200 dark:ring-blue-900 sm:h-24 sm:w-24"
              />
              <div className="flex flex-col gap-2">
                <Badge
                  variant="outline"
                  className="w-fit gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-950"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {t.available}
                </Badge>
                <p className="text-sm text-muted-foreground">{t.locationPill}</p>
              </div>
            </div>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              {t.heroEyebrow}
            </p>

            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
              {t.heroTitle}
            </h1>

            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">{t.heroIntro}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild>
                <a href={LINKS.calendly} target="_blank" rel="noreferrer">
                  <Calendar />
                  {t.heroBookCall}
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#projects">
                  {t.heroPrimary}
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/cv-lucas-vicente.pdf" target="_blank" rel="noreferrer">
                  <Download />
                  {t.heroDownloadCv}
                </a>
              </Button>
              <div className="ml-1 flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild aria-label="GitHub">
                  <a href={LINKS.githubProfile} target="_blank" rel="noreferrer">
                    <Github />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild aria-label="LinkedIn">
                  <a href={LINKS.linkedinProfile} target="_blank" rel="noreferrer">
                    <Linkedin />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-4">
              {projectStats.map((stat) => (
                <div key={stat.label} className="bg-card px-5 py-5">
                  <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t.trustedByLabel}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trustedBy.map((entry) => (
                  <div
                    key={entry.name}
                    className="border-l-2 border-blue-200 pl-3 dark:border-blue-900"
                  >
                    <p className="text-sm font-semibold text-foreground">{entry.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator />

        <section id="projects" className="py-20">
          <div className="mb-12 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.sectionCasesEyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.sectionCasesTitle}
            </h2>
            <p className="max-w-2xl text-muted-foreground">{t.sectionCasesIntro}</p>
          </div>

          <div className="space-y-6">
            {visibleProjects.map((p, index) => (
              <Card key={p.title} className="p-6 transition hover:border-foreground/20 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-medium text-blue-600">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{p.title}</h3>
                    <Badge
                      variant="secondary"
                      className={
                        p.tag.toLowerCase().includes("open")
                          ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-950"
                          : ""
                      }
                    >
                      {p.tag}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.live ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={p.live} target="_blank" rel="noreferrer">
                          {t.viewLive}
                          <ArrowUpRight />
                        </a>
                      </Button>
                    ) : null}
                    {p.repo ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={p.repo} target="_blank" rel="noreferrer">
                          <Github />
                          {t.viewRepo}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{p.type}</p>

                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.challenge}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">{p.context}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.decision}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">{p.decision}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.result}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">{p.result}</p>
                  </div>
                </div>

                {p.metrics?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.metrics.map((metric) => (
                      <Badge key={metric} variant="outline" className="gap-1.5 font-normal">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {metric}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <div className="mt-5 border-t pt-4">
                  <p className="text-xs">
                    <span className="font-medium uppercase tracking-wide text-muted-foreground">
                      {t.stackLabel}
                    </span>
                    <span className="ml-2 font-mono text-foreground/80">{p.stack}</span>
                  </p>
                </div>

                {p.nda ? (
                  <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                    {t.ndaLabel}
                  </p>
                ) : null}

                {p.diagram ? (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.diagramLabel}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveScreenshot({
                          src: p.diagram ?? "",
                          title: p.title,
                          index: 1,
                        })
                      }
                      className="group/diag block w-full overflow-hidden rounded-md border bg-muted transition hover:border-foreground/20"
                      aria-label={`${lang === "es" ? "Ampliar diagrama de arquitectura" : "Open architecture diagram"} ${p.title}`}
                    >
                      <img
                        src={p.diagram}
                        alt={`${p.title} architecture diagram`}
                        loading="lazy"
                        className="w-full object-contain transition duration-300 group-hover/diag:scale-[1.01]"
                      />
                    </button>
                  </div>
                ) : null}

                {p.screenshots?.length ? (
                  <div className="mt-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.screenshotsLabel}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {p.screenshots.map((src, shotIndex) => (
                        <button
                          type="button"
                          key={`${p.title}-${src}`}
                          onClick={() =>
                            setActiveScreenshot({
                              src,
                              title: p.title,
                              index: shotIndex + 1,
                            })
                          }
                          className="group/shot relative overflow-hidden rounded-md border bg-muted transition hover:border-foreground/20"
                          aria-label={`${lang === "es" ? "Abrir captura" : "Open screenshot"} ${shotIndex + 1} ${p.title}`}
                        >
                          <img
                            src={src}
                            alt={`${p.title} screenshot ${shotIndex + 1}`}
                            loading="lazy"
                            className="h-36 w-full object-cover transition duration-300 group-hover/shot:scale-[1.03]"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            ))}

            {projects.length > VISIBLE_CASES ? (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={() => setShowAllCases((prev) => !prev)}>
                  {showAllCases
                    ? t.showLessCases
                    : t.showMoreCases + " (" + (projects.length - VISIBLE_CASES) + ")"}
                  <ChevronDown className={cn("transition", showAllCases && "rotate-180")} />
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        <Separator />

        <section id="ai" className="py-20">
          <div className="mb-12 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.sectionAiEyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.sectionAiTitle}
            </h2>
            <p className="max-w-2xl text-muted-foreground">{t.sectionAiIntro}</p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
            {t.aiCapabilities.map((item) => (
              <div key={item.title} className="bg-card p-6 sm:p-7">
                <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        <section id="process" className="py-20">
          <div className="mb-12 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.sectionProcessEyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.sectionProcessTitle}
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2">
            {t.processItems.map((item) => (
              <div key={item.title} className="bg-card p-6 sm:p-7">
                <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        <section className="py-20">
          <div className="mb-10 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.sectionStackEyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.sectionStackTitle}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stackGroups.map((group) => (
              <Card key={group.label} className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                <p className="mt-2 font-mono text-sm">{group.items}</p>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section id="certs" className="py-20">
          <div className="mb-10 flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.sectionCertsEyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.sectionCertsTitle}
            </h2>
            <p className="max-w-2xl text-muted-foreground">{t.sectionCertsIntro}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <Card key={cert.name} className="flex flex-col justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-semibold leading-snug">{cert.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cert.issuer} · {cert.year}
                  </p>
                </div>
                {cert.verify ? (
                  <a
                    href={cert.verify}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    {t.certVerify}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </Card>
            ))}
          </div>
        </section>

        <section
          id="hiring"
          className="my-20 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-white dark:bg-neutral-900 sm:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t.sectionHiringEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.sectionHiringTitle}
              </h2>
              <p className="mt-4 max-w-2xl text-base text-neutral-300">{t.sectionHiringText}</p>
              <ul className="mt-6 flex flex-wrap gap-2 text-sm">
                {t.sectionHiringPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-neutral-200"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button
                variant="secondary"
                asChild
                className="bg-white text-neutral-900 hover:bg-neutral-200"
              >
                <a href={LINKS.calendly} target="_blank" rel="noreferrer">
                  <Calendar />
                  {t.heroBookCall}
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowContactForm(true)}
                className="border-neutral-700 bg-transparent text-white hover:bg-neutral-900 hover:text-white"
              >
                <Send />
                {t.contactCta}
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-neutral-700 bg-transparent text-white hover:bg-neutral-900 hover:text-white"
              >
                <a href={`mailto:${LINKS.email}`}>
                  <Mail />
                  {LINKS.email}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Lucas Vicente · Madrid, España</p>
            <div className="flex items-center gap-5">
              <a
                href={LINKS.githubPortfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-blue-600"
              >
                <Github className="h-4 w-4" />
                {t.footerSource}
              </a>
              <a
                href={LINKS.linkedinProfile}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-blue-600"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </main>

      <Dialog open={showContactForm} onOpenChange={handleContactDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.contactFormTitle}</DialogTitle>
            <DialogDescription>{t.contactFormSubtitle}</DialogDescription>
          </DialogHeader>

          {contactStatus === "success" ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-800 dark:text-emerald-300">{t.contactFormSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">{t.contactFormName}</Label>
                <Input
                  id="contact-name"
                  type="text"
                  required
                  maxLength={100}
                  value={contactForm.name}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">{t.contactFormEmail}</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">{t.contactFormSubject}</Label>
                <Input
                  id="contact-subject"
                  type="text"
                  required
                  maxLength={200}
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">{t.contactFormMessage}</Label>
                <Textarea
                  id="contact-message"
                  required
                  rows={4}
                  maxLength={5000}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                />
              </div>

              <div ref={turnstileContainerRef} />

              {contactStatus === "error" ? (
                <p className="text-xs text-destructive">{t.contactFormError}</p>
              ) : null}

              <Button
                type="submit"
                disabled={contactStatus === "sending" || !turnstileToken}
                className="w-full"
              >
                <Send />
                {contactStatus === "sending" ? t.contactFormSending : t.contactFormSend}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {activeScreenshot ? (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-neutral-900/80 p-4 backdrop-blur-sm"
          onClick={() => setActiveScreenshot(null)}
          role="presentation"
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeScreenshot.title} screenshot ${activeScreenshot.index}`}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveScreenshot(null)}
              className="absolute right-2 top-2 z-10 border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <X />
              {lang === "es" ? "Cerrar" : "Close"}
            </Button>
            <img
              src={activeScreenshot.src}
              alt={`${activeScreenshot.title} screenshot ${activeScreenshot.index}`}
              className="max-h-[88vh] w-full rounded-md object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
