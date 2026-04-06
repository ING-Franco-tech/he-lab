# HE-Lab

**Plataforma multiescala de fragilización por hidrógeno con IA**

Herramienta web interactiva para el análisis, simulación y predicción de fragilización por hidrógeno (HE) en aceros. Integra cálculos multiescala, análisis de micrografías con inteligencia artificial, modelos predictivos ML y evaluación normativa ASME B31.12.

## Módulos

| # | Módulo | Estado | Descripción |
|---|--------|--------|-------------|
| 01 | **Composición** | ✅ Funcional | Base de datos de >40 aceros, cálculo de Ceq, Pcm, PREN, susceptibilidad HE |
| 02 | **Microestructura IA** | 🔧 Requiere API | Análisis de micrografías con Claude Sonnet (visión) |
| 03 | **Simulación** | ✅ Funcional | Solver McNabb-Foster + FTCS para difusión de H con trampas + criterio HEDE |
| 04 | **ML Predictivo** | 📋 Planificado | Random Forest / XGBoost para predecir EI, K_IH, da/dN |
| 05 | **Normativa** | ✅ Funcional | Evaluador ASME B31.12 para servicio con H₂ |
| 06 | **Reporte** | 📋 Planificado | Generación automática de PDF con resultados |
| 07 | **RINCÓN IA** | 🔧 Requiere API | Chatbot especializado en fragilización por hidrógeno |

## Stack tecnológico

- **Frontend**: HTML/CSS/JS vanilla (sin frameworks)
- **Ecuaciones**: KaTeX
- **Gráficas**: Chart.js
- **IA**: Claude API (Sonnet 4.6 para visión, Haiku 4.5 para chatbot)
- **Proxy API**: Cloudflare Worker
- **Hosting**: Netlify
- **ML**: scikit-learn → ONNX → ONNX.js (inferencia en navegador)

## Desarrollo

```bash
git clone https://github.com/ING-Franco-tech/he-lab.git
cd he-lab
# Abrir index.html en el navegador — no requiere build
```

## Autor

**J. Gabriel Franco Correa**  
Ingeniería Metalúrgica — Universidad Industrial de Santander (UIS)  
Bucaramanga, Colombia — 2026

## Licencia

MIT
