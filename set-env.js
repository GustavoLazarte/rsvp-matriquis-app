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

function writeEnvironmentFile(fileName, production) {
  const content = `export const environment = {
  production: ${production},
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_ANON_KEY}',
};
`;

  fs.writeFileSync(path.join(__dirname, 'src', 'environments', fileName), content, 'utf8');
  console.log(`✅ ${fileName} generado con las variables de entorno (${production ? 'prod' : 'dev'})`);
}

const mode = process.argv[2] === 'prod' || process.argv[2] === 'production' ? 'prod' : 'dev';
writeEnvironmentFile('environment.ts', false);
if (mode === 'prod') {
  writeEnvironmentFile('environment.prod.ts', true);
}
console.log(`🔧 modo de generación: ${mode}`);
