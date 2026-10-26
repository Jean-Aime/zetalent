BEGIN;

ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS private_token text;

ALTER TABLE news_articles
  DROP CONSTRAINT IF EXISTS news_articles_status_check;

ALTER TABLE news_articles
  ADD CONSTRAINT news_articles_status_check
  CHECK (status IN ('draft', 'scheduled', 'published', 'private'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_news_articles_private_token
  ON news_articles (private_token)
  WHERE private_token IS NOT NULL;

COMMIT;
