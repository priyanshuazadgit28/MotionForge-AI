import { prisma } from './lib/prisma';
async function main() {
  await prisma.project.updateMany({
    data: { exportStatus: 'idle', exportProgress: 0, videoUrl: null }
  });
  console.log("All projects reset to idle!");
}
main();
