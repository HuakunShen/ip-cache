import { watch } from "fs";
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    dev: {
      type: "boolean",
    },
  },
  strict: true,
  allowPositionals: true,
});

async function build() {
  console.log("building...");
  try {
    await Bun.build({
      entrypoints: ["src/main.pb.ts", "src/lib.ts"],
      outdir: "pb_hooks",
      //   root: "./src",
      format: "cjs",
      target: "node",
      sourcemap: "inline",
      minify: false,
    });
  } catch (error) {
    console.error("Error building: ", error);
  }
}
if (values.dev) {
  build();
  watch("src", () => {
    console.log("src changed, rebuilding...");
    build();
  });
} else {
  build();
}
