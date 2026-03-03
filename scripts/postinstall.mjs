import { execSync } from 'child_process';
try {
  execSync('prisma generate', { stdio: 'inherit', cwd: process.cwd() });
} catch (e) {
  console.warn('\npostinstall: prisma generate failed (often EPERM on Windows).');
  console.warn('Run "npx prisma generate" manually after closing dev server / other locks.\n');
  process.exit(0);
}
