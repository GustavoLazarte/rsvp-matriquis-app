const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch {
  // dotenv no instalado, usar process.env directamente
}

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Faltan variables de entorno:', missing.join(', '));
  console.error('   Creá un archivo .env basado en .env.example');
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_ANON_KEY}',
};
`;

fs.writeFileSync(path.join(__dirname, 'src', 'environments', 'environment.ts'), content);
console.log('✅ environment.prod.ts generado con las variables de entorno');
