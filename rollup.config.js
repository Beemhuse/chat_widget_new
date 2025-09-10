import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import terser  from "@rollup/plugin-terser";
import javascriptObfuscator from "rollup-plugin-javascript-obfuscator";

export default {
  input: "src/index.js",
  output: {
    file: "dist/chat-widget.js",
    format: "iife",
    name: "ChatWidgetBundle",
  },
  plugins: [
    resolve(),
    commonjs(),
    postcss({
      config: true,        
      extract: false,
      inject: false,
      minimize: true,
    }),
     terser(),
  javascriptObfuscator({
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    rotateStringArray: true,
  })
  ],
};
