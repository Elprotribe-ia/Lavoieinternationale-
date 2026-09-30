-- Migration initiale (déjà appliquée : ne jamais la modifier, ajouter une nouvelle migration à la place)
CREATE TABLE IF NOT EXISTS croyants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricule TEXT UNIQUE,
  nom TEXT NOT NULL,
  province TEXT,
  section TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dirigeants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  fonction TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  type TEXT,
  url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);