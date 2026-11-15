# SIMTELE-RISK · Semana 1

Desafío integrador de **Métodos Numéricos** (UMSA, FCPN, La Paz). Plataforma web para estudiar cuatro casos de un sistema de transporte por cable, con tres escenarios cada uno. Proyecto académico con **datos sintéticos**, inspirado en Mi Teleférico de La Paz: no describe fallas verificadas ni se conecta con equipos reales.

Esta carpeta es la **entrega de la semana 1** (modelos, teoría de errores y sistemas lineales). El informe en PDF está en [`docs/informe_semana1.pdf`](docs/informe_semana1.pdf).

## Integrantes

| Nombre | CI | RU | Mención |
|---|---|---|---|
| Saúl Walter Callisaya Sumi | 15074779 | 1885982 | Ingeniería de Sistemas |
| Ignacio Josue Zarate Camargo | 12392989 | 1886051 | IA y Ciencia de Datos |
| Luis Alejandro Zeballos Quiroz | 12896709 | 1886052 | IA y Ciencia de Datos |
| Jhoel Percy González Herrera | 9990880 | 1886116 | Ingeniería de Sistemas |

## Casos de estudio

| Módulo | Pregunta | Modelo |
|---|---|---|
| M1 · Detención de emergencia | ¿Cuánto tarda y recorre la cabina hasta detenerse? | EDO de frenado con y sin resistencia |
| M2 · Deterioro y mantenimiento | ¿Cuándo el deterioro supera el umbral? | Indicador `D(t) = D₀ + αt + βt²` |
| M3 · Oscilaciones por viento | ¿Cómo oscila la cabina? | Oscilador amortiguado forzado |
| M4 · Reconstrucción de sensores | ¿Cómo reconstruir una señal con huecos? | Interpolación de Lagrange / splines |

Escenarios: **NORMAL**, **ESTRÉS** y **MAL CONDICIONADO**.

## Qué incluye la semana 1

- Planteamiento matemático de los 4 módulos y su matriz de escenarios.
- Teoría de errores transversal: error absoluto, relativo, residuo, sensibilidad, orden observado.
- Sistemas lineales SPD: **Jacobi, Gauss-Seidel, LU con pivoteo parcial y gradiente conjugado**, con matrices de referencia (tramos de cable y Hilbert).
- Ejemplo manual 4×4, tablas de error y análisis de convergencia.
- **DER inicial** y esquema SQL (`database/schema.sql`, 6 tablas).
- Prototipo web estático con los cuatro módulos visibles.

## Estructura

```
backend/
  simtele/
    modulos.py          # modelos y escenarios
    experimentos.py     # ejecuta los experimentos y genera el JSON
    numerico/
      errores.py        # métricas de error
      sistemas.py       # Jacobi, Gauss-Seidel, LU, CG
  tests/test_semana1.py
  requirements.txt
database/
  schema.sql            # esquema relacional
  tests/test_schema.py
frontend/
  index.html  css/  js/  datos/experimentos.json  vendor/chart.umd.js
docs/
  informe_semana1.pdf / .docx / .tex   # informe de avance
  fig/                                 # figuras del informe
estudiantes.json        # datos de los integrantes (se muestran en la web)
```

## Ejecución

Requiere Python 3.10 o superior.

```bash
pip install -r backend/requirements.txt
```

Generar los resultados de los experimentos:

```bash
python -m backend.simtele.experimentos
```

Levantar el prototipo y abrir <http://localhost:8000/frontend/>:

```bash
python -m http.server 8000
```

## Pruebas

```bash
python -m pytest
```

Verifican los métodos numéricos, las métricas de error y las restricciones del esquema SQL.

## Notas

- Los valores cercanos a la precisión de máquina (≈ 10⁻¹⁵) pueden variar levemente según el equipo y la librería de álgebra lineal.
- En las semanas 2 y 3 se agregan raíces, integración, EDO, interpolación, base de datos conectada, API y la aplicación completa.
