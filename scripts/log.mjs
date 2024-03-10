import { chalk } from 'zx';

// Define colors for different types and base text
const numberFn = chalk.yellow;
const stringFn = chalk.green; // Good visibility on both light and dark backgrounds
const dateFn = chalk.cyan;
const baseFn = chalk.white; // Default base color, good for both backgrounds

// Icons for success and failure
const successIcon = chalk.green('✓');
const errorIcon = chalk.red('✗');
const infoIcon = chalk.blue('ℹ');

// Function to color variables by type
const colorizeVariables = (vars) => vars.map(v => {
  if (typeof v === 'string') return stringFn(v);
  if (typeof v === 'number') return numberFn(v);
  if (v instanceof Date) return dateFn(v.toISOString());
  return v; // Default, no color
});

// Print function with template parsing and variable coloring
export const print = (messageTemplate, vars = [], baseColourFn = baseFn) => {
  const coloredVars = colorizeVariables(vars);
  let msgWithVars = messageTemplate;

  // Replace placeholders with colorized variables
  coloredVars.forEach((coloredVar, index) => {
    msgWithVars = msgWithVars.replace(new RegExp(`\\{${index}\\}`, 'g'), coloredVar);
  });

  console.log(baseColourFn(msgWithVars));
};

// Pre-configured print functions for different log levels
export const ok = (msg, vars = []) => print(`${successIcon} ${msg}`, vars, chalk.green);
export const err = (msg, vars = []) => print(`${errorIcon} ${msg}`, vars, chalk.red);
export const info = (msg, vars = []) => print(`${infoIcon} ${msg}`, vars, chalk.blue);