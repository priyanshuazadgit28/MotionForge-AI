import { prisma } from './lib/prisma';
import fs from 'fs';

async function run() {
  const p = await prisma.project.findUnique({
    where: { id: "cmqkugw3s0002xm4h3yt5ewi7" }
  });
  if (p && p.remotionCode) {
    fs.writeFileSync('temp-code.tsx', p.remotionCode);
    console.log('Saved to temp-code.tsx');
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
