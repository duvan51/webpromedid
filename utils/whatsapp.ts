
/**
 * Generates a WhatsApp URL with a pre-filled message for lead generation.
 * Format: Quiero agendar cita -- [Location] -- [Service Title] -- [Current Date]
 */
export const getWhatsAppLeadUrl = (options: {
    serviceTitle?: string,
    location?: string,
    customMessage?: string,
    phoneNumber?: string
}): string => {
    const defaultPhoneNumber = "573000000000"; // Reemplazar con el número real por defecto
    const targetPhone = (options.phoneNumber || defaultPhoneNumber).replace(/\D/g, '');
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let message = options.customMessage || 'Quiero agendar cita';

    const parts = [];
    if (options.location) parts.push(options.location);
    if (options.serviceTitle) parts.push(options.serviceTitle);
    parts.push(dateStr);

    const finalMessage = `${message} -- ${parts.join(' -- ')}`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(finalMessage)}`;
};

export const LOCATIONS = ['Bogotá', 'Villavicencio', 'Pereira'] as const;
export type Location = typeof LOCATIONS[number];
