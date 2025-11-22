/**
 * Represents a notification entity in the maintenance tracking system.
 * @class
 */
export class Notification {
    /**
     * Creates an instance of Notification.
     * @param {Object} params - The parameters for the notification.
     * @param {string} [params.id_notification=''] - The unique identifier for the notification.
     * @param {string} [params.message=''] - The message content of the notification.
     * @param {boolean} [params.read=false] - The read status of the notification.
     * @param {string} [params.id_vehicle=''] - The identifier of the associated vehicle.
     * @param {string} [params.sent=''] - The timestamp when the notification was sent.
     */
    constructor({ id_notification = '', message = '', read = false, id_vehicle = '', sent = '' }) {
        this.id_notification = id_notification;
        this.message = message;
        this.read = read;
        this.id_vehicle = id_vehicle;
        this.sent = sent;
    }

    /* Getters and setters */
    get id() { return this.id_notification; }
    set id(value) { this.id_notification = value; }
}