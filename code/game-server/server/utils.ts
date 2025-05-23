// TODO move to general utils
export function log(val: any) {
  console.log(val);
}

export function log_warning(val: any) {
  console.log("\x1b[33m[Warning]\x1b[0m", val);
}
