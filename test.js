const nextVitals = require("eslint-config-next/core-web-vitals");
const plugin = nextVitals.find(c => c.plugins && c.plugins["react-hooks"]).plugins["react-hooks"];
console.log(Object.keys(plugin.rules));
