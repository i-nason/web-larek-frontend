/**
 * 
 * @param price 
 * @returns 
 */
export function formatPrice(price: number | null | undefined): string {
    return (price === null || price === undefined) ? 'Бесценно' : `${price} синапсов`;
} 