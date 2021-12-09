export interface StateMachine {
  state: State;
  states: { [key: string]: State };
  setState: (state: State) => void;
}

export interface State {
  enter: () => void;
  exit: () => void;
  update: (delta: number, step: number) => void;
}
