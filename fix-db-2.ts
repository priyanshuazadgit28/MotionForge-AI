import { prisma } from './lib/prisma';

async function run() {
  const projects = await prisma.project.findMany({
    where: {
      remotionCode: {
        contains: 'interpolate('
      }
    }
  });

  for (const project of projects) {
    if (!project.remotionCode) continue;
    console.log(`\n\nProject: ${project.id}`);
    console.log(project.remotionCode.split('\n').filter(line => line.includes('interpolate(')).join('\n'));
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
