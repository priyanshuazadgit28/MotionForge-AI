const { PrismaClient } = require('./lib/generated/prisma/client');
const prisma = new PrismaClient();

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
    
    // Check if it's interpolating colors
    if (project.remotionCode.includes('interpolate(') && project.remotionCode.match(/interpolate\([^,]+,\s*\[[^\]]+\],\s*\[[^\]]*#[0-9a-fA-F]+/)) {
      console.log(`Fixing project ${project.id}`);
      
      let newCode = project.remotionCode;
      
      // We need a smart replace for interpolate(..., [...], ["#color"...])
      // Actually, Remotion also has interpolateColors
      newCode = newCode.replace(/interpolate\(([^,]+),\s*(\[[^\]]+\]),\s*(\[[^\]]+\](?:,\s*\{[^}]+\})?)\)/g, (match, p1, p2, p3) => {
        if (p3.includes('#') || p3.includes('rgb') || p3.includes('hsl')) {
          // add interpolateColors import if not present
          if (!newCode.includes('interpolateColors')) {
             newCode = newCode.replace(/import\s+\{[^}]+\}\s+from\s+['"]remotion['"];?/, (m) => m.replace('{', '{ interpolateColors,'));
          }
          return `interpolateColors(${p1}, ${p2}, ${p3})`;
        }
        return match;
      });

      await prisma.project.update({
        where: { id: project.id },
        data: { remotionCode: newCode }
      });
      console.log('Fixed!');
    }
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
