export function getInitials(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
        return firstName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
}

// Get display name
export function getDisplayName(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName || lastName) {
        return `${firstName || ""} ${lastName || ""}`.trim();
    }
    return email.split("@")[0];
}

