export interface ObserverEvent {
  type: string;
  details?: any;
}

export type Subscribers = Set<(details: any) => void>;

export default class Observable {
  private events: Map<string, Subscribers>;

  constructor() {
    this.events = new Map();
  }

  getAndCreateEvent(event: string) {
    let subscribers = this.events.get(event);
    if (subscribers) return subscribers;
    subscribers = new Set() as Subscribers;
    this.events.set(event, new Set());
    return subscribers;
  }

  subscribe(event: string, callback: (details: any) => void) {
    const subscribers = this.getAndCreateEvent(event);
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  protected emit<T>(event: string, details: T) {
    let subscribers = this.events.get(event);
    if (!subscribers) return;
    subscribers.forEach((callback) => callback(details));
  }
}
