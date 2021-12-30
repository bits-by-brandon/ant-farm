export interface StateMachine {
  state: State;
  readonly states: { [key: string]: State };
}

export interface State {
  enter: () => void;
  exit: () => void;
  update: (step: number) => void;
}
