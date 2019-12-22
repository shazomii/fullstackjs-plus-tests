export function setTimeout() {
    return global.setTimeout.apply(global, arguments);
}