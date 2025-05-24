// TODO move to general utils

/// See: https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
export function log_notice(val: any) {
  console.log("\x1b[38;5;0m[Notice]\x1b[0m", val);
}

export function log_warning(val: any) {
  console.log("\x1b[38;5;3m[Warning]\x1b[0m", val);
}

export function log_attention(val: any) {
  console.log("\x1b[4;38;5;9m[Attention]\x1b[0m", val);
}
