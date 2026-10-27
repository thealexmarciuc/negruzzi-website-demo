// Any setup scripts you might need go here

// Load env files (vercel env pull writes .env.local)
import { config } from 'dotenv'

config({ path: ['.env.local', '.env'], quiet: true })
