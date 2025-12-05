/**
 * Represents a notification entity in the maintenance tracking system.
 * @class
 */
export class Notification {
    /**
     * Creates an instance of Notification.
     * @param {Object} params - The parameters for the notification.
     * @param {?number} [params.id=null] - The unique identifier for the notification.
     * @param {string} [params.message=''] - The message content of the notification.
     * @param {boolean} [params.read=false] - The read status of the notification.
     * @param {?number} [params.vehicle_id=null] - The identifier of the associated vehicle.
     * @param {string} [params.sent=''] - The timestamp when the notification was sent.
     */
    constructor({ id = null, message = '', read = false, vehicle_id = null, sent = '' }) {
        this.id = id;
        this.message = message;
        this.read = read;
        this.vehicle_id = vehicle_id;
        this.sent = sent;
    }
}