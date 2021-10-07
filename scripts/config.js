const path = require("path");
const buble = require("rollup-plugin-buble");
const alias = require("rollup-plugin-alias");
const cjs = require("rollup-plugin-commonjs");
const image = require("rollup-plugin-img")
const css = require("rollup-plugin-css-only");
const CleanCSS = require("clean-css");
const babel = require("rollup-plugin-babel");
const replace = require("rollup-plugin-replace");
const node = require("rollup-plugin-node-resolve");
const flow = require("rollup-plugin-flow-no-whitespace");
const version = process.env.VERSION || require("../package.json").version;
const weexVersion = "1.0.0";
const featureFlags = require("./feature-flags");
const { writeFileSync } = require('fs')

const banner =
  "/*!\n" +
  ` * TMap.js v${version}\n` +
  ` * (c) 2020-${new Date().getFullYear()} Challenger\n` +
  " * Released under the MIT License.\n" +
  " */";

const weexFactoryPlugin = {
  intro() {
    return "module.exports = function weexFactory (exports, document) {";
  },
  outro() {
    return "}";
  },
};


const resolve = (p) => {
  return path.resolve(__dirname, "../", p);
};
const aliases = { "@":path.resolve(__dirname, "../src") };
const extensions = [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".tsx"];
const babelConfig = { extensions, exclude: "node_modules/**" };
const resolveConfig = { extensions };
const builds = {
  "web-full-prod": {
    entry: resolve("src/core/index.js"),
    dest: resolve("dist/index.js"),
    format: "umd",
    env: "production",
    plugins: [
      css({
        output(style) {
          // 压缩 css 写入 dist/base-ui.css
          writeFileSync(
            "dist/styles.css",
            new CleanCSS().minify(style).styles
          );
        },
      }),
      image(),
      node(resolveConfig),
      babel(babelConfig),
      cjs(),
    ],
    banner,
  },
  "web-runtime-cjs-prod": {
    entry: resolve("src/core/index.js"),
    dest: resolve("dist/index.common.js"),
    format: "cjs",
    env: "production",
    plugins: [
      css({
        output(style) {
          // 压缩 css 写入 dist/base-ui.css
          writeFileSync(
            "dist/styles.css",
            new CleanCSS().minify(style).styles
          );
        },
      }),
      image(),
      node(resolveConfig),
      babel(babelConfig),
      cjs(),
    ],
    banner,
  },
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      flow(),
      alias(Object.assign({}, { entries: aliases }, opts.alias)),
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || "TMap",
    },
    onwarn: (msg, warn) => {
      if (msg.code === "THIS_IS_UNDEFINED") {
        return;
      }
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    moduleContext: (id) => {
      // In order to match native module behaviour, Rollup sets `this`
      // as `undefined` at the top level of modules. Rollup also outputs
      // a warning if a module tries to access `this` at the top level.
      // The following modules use `this` at the top level and expect it
      // to be the global `window` object, so we tell Rollup to set
      // `this = window` for these modules.
      // if (id.indexOf("node_modules")>0){
      //   return 'window';
      // }
    },
  };

  // built-in vars
  const vars = {
    __WEEX__: !!opts.weex,
    __WEEX_VERSION__: weexVersion,
    __VERSION__: version,
  };
  // feature flags
  Object.keys(featureFlags).forEach((key) => {
    vars[`process.env.${key}`] = featureFlags[key];
  });
  // build-specific env
  if (opts.env) {
    vars["process.env.NODE_ENV"] = JSON.stringify(opts.env);
  }
  config.plugins.push(replace(vars));

  if (opts.transpile !== false) {
    config.plugins.push(buble());
  }

  Object.defineProperty(config, "_name", {
    enumerable: false,
    value: name,
  });

  return config;
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET);
} else {
  exports.getBuild = genConfig;
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
}