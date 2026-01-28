export function slugify(str: string): string {
    if (!str) return "";
    str = str.trim().toLowerCase();
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/[đĐ]/g, "d");
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/(\s+)/g, "-");
    str = str.replace(/-+/g, "-");
    str = str.replace(/^-+|-+$/g, "");
    return str;
}
