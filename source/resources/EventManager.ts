import { Callback } from '../types/standard-types';
import { Final } from '../decorators/keywords/Final';
import { MultiMap } from '../structures/MultiMap';

/**
 * @internal
 */
export type EventHandler = Callback<any>;

/**
 * A custom event handler container and dispatcher.
 */
@Final export default class EventManager {
  private _events: MultiMap<string, EventHandler> = new MultiMap();

  public off (event?: string, callback?: EventHandler): void {
    if (!event) {
      this._events.clear();
    } else {
      this._events.remove(event, callback);
    }
  }

  public on (event: string, callback: EventHandler): void {
    this._events.put(event, callback);
  }

  public trigger (event: string, ...args: any[]): void {
    const callbacks: EventHandler[] = this._events.get(event);

    if (!callbacks) {
      return;
    }

    for (const callback of callbacks) {
      callback.apply(null, args);
    }
  }
}
