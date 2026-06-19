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
    
    let newCode = project.remotionCode;
    let modified = false;

    // A very robust way: just replace `interpolate(` with `interpolateColors(`
    // if the third argument is an array containing a string that starts with '#' or 'rgb' or 'rgba'.
    
    const lines = newCode.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('interpolate(')) {
        // Simple heuristic: if the line contains a hex color or theme.colors and interpolate,
        // it might be doing it. Actually, wait. Let's just use regex for interpolate(..., ..., [theme.colors... or '#...'])
        // But the previous regex didn't match `const bgColor = interpolate(\n transitionProgress,`
      }
    }
    
    // We can do it by replacing all `interpolate` that has color arguments.
    // Since AST parsing is hard, let's just find the `bgColor` definition specifically
    // as it's the most common failure point from our AI prompt.
    
    // Replace: const bgColor = interpolate( => const bgColor = interpolateColors(
    if (newCode.includes('const bgColor = interpolate(')) {
       newCode = newCode.replace('const bgColor = interpolate(', 'const bgColor = interpolateColors(');
       modified = true;
    }
    if (newCode.includes('const borderColor = interpolate(')) {
       newCode = newCode.replace('const borderColor = interpolate(', 'const borderColor = interpolateColors(');
       modified = true;
    }

    if (modified) {
      if (!newCode.includes('interpolateColors')) {
        newCode = newCode.replace(/import\s+\{[^}]+\}\s+from\s+['"]remotion['"];?/, (m) => m.replace('{', '{ interpolateColors,'));
      }
      await prisma.project.update({
        where: { id: project.id },
        data: { remotionCode: newCode }
      });
      console.log(`Fixed colors in project ${project.id}`);
    }
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
