// Stub for postgres — prevents Node built-in imports in Storybook webpack
const noop = () => ({ rows: [], count: 0 });
const sql = Object.assign(noop, { unsafe: noop, begin: noop, end: noop });
export default () => sql;
