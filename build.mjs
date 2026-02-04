import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const configs = [
  {
    entryPoints: ["play/ui.ts"],
    outfile: "play/bundle.js",
    bundle: true,
    sourcemap: true,
  },
  {
    entryPoints: ["controller/webRTCSender.ts"],
    outfile: "controller/webRTCSender.js",
    bundle: true,
    sourcemap: true,
  },
];

if (watch) {
  const contexts = await Promise.all(configs.map((c) => esbuild.context(c)));
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  console.log("Watching for changes...");
} else {
  await Promise.all(configs.map((c) => esbuild.build(c)));
  configs.forEach((c) => console.log(`Built ${c.outfile}`));
}
