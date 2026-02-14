/**
 * Generic Observable Store
 * Provides reactive state management with subscriber pattern
 */

export type Subscriber<T> = (state: T) => void;
export type Selector<T, R> = (state: T) => R;

export class Store<T> {
  private state: T;
  private subscribers: Set<Subscriber<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  /**
   * Get current state (immutable)
   */
  getState(): Readonly<T> {
    return this.state;
  }

  /**
   * Update state and notify subscribers
   */
  setState(updater: Partial<T> | ((prevState: T) => Partial<T>)): void {
    const updates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...updates };
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    // Immediately call with current state
    subscriber(this.state);
    
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  /**
   * Select a slice of state and subscribe to changes
   */
  select<R>(selector: Selector<T, R>, callback: (selected: R) => void): () => void {
    let previousValue = selector(this.state);
    
    return this.subscribe((state) => {
      const currentValue = selector(state);
      if (currentValue !== previousValue) {
        previousValue = currentValue;
        callback(currentValue);
      }
    });
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => subscriber(this.state));
  }

  /**
   * Reset state to initial values
   */
  reset(newState: T): void {
    this.state = newState;
    this.notifySubscribers();
  }
}
