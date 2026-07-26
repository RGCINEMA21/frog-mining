/**
 * Server Configuration — Environment variables.
 * Placeholder — to be implemented in Phase 4+.
 */
export const config = {
  port: process.env.PORT || 3001,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
};
