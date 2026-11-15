-- SIMTELE-RISK: DER inicial de 6 entidades (SQLite 3).
-- Avance de semana 1: fija entidades y relaciones; la persistencia se conecta en la semana 2.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS caso_estudio (
    id             INTEGER PRIMARY KEY,
    nombre         TEXT NOT NULL UNIQUE,
    modelo_version TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS escenario (
    id              INTEGER PRIMARY KEY,
    caso_id         INTEGER NOT NULL REFERENCES caso_estudio(id) ON DELETE RESTRICT,
    tipo            TEXT NOT NULL CHECK (tipo IN ('NORMAL', 'ESTRES', 'MAL_CONDICIONADO')),
    parametros_json TEXT NOT NULL CHECK (json_valid(parametros_json)),
    fuente_datos    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS simulacion (
    id             INTEGER PRIMARY KEY,
    escenario_id   INTEGER NOT NULL REFERENCES escenario(id) ON DELETE RESTRICT,
    fecha          TEXT NOT NULL,
    usuario_equipo TEXT,
    estado         TEXT NOT NULL CHECK (estado IN ('COMPLETADA', 'FALLIDA'))
);

CREATE TABLE IF NOT EXISTS ejecucion_metodo (
    id            INTEGER PRIMARY KEY,
    simulacion_id INTEGER NOT NULL REFERENCES simulacion(id) ON DELETE CASCADE,
    metodo        TEXT NOT NULL,
    tolerancia    REAL,
    paso          REAL,
    max_iter      INTEGER,
    convergio     INTEGER NOT NULL CHECK (convergio IN (0, 1)),
    tiempo_ms     REAL NOT NULL CHECK (tiempo_ms >= 0)
);

CREATE TABLE IF NOT EXISTS iteracion_resultado (
    id                INTEGER PRIMARY KEY,
    ejecucion_id      INTEGER NOT NULL REFERENCES ejecucion_metodo(id) ON DELETE CASCADE,
    numero            INTEGER NOT NULL,
    aproximacion_json TEXT NOT NULL CHECK (json_valid(aproximacion_json)),
    residual          REAL,
    error_abs         REAL,
    error_rel         REAL
);

CREATE TABLE IF NOT EXISTS resultado_resumen (
    id                 INTEGER PRIMARY KEY,
    ejecucion_id       INTEGER NOT NULL UNIQUE REFERENCES ejecucion_metodo(id) ON DELETE CASCADE,
    referencia         TEXT NOT NULL,
    valor_json         TEXT NOT NULL CHECK (json_valid(valor_json)),
    metrica_error_json TEXT NOT NULL CHECK (json_valid(metrica_error_json)),
    interpretacion     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_escenario_caso ON escenario(caso_id, tipo);
CREATE INDEX IF NOT EXISTS ix_simulacion_escenario ON simulacion(escenario_id);
CREATE INDEX IF NOT EXISTS ix_ejecucion_simulacion ON ejecucion_metodo(simulacion_id);
CREATE INDEX IF NOT EXISTS ix_iteracion_ejecucion ON iteracion_resultado(ejecucion_id);
