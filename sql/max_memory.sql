-- Memória persistente do MAX Assistente
CREATE TABLE IF NOT EXISTS max_memory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS max_memory_key_idx ON max_memory (key);
