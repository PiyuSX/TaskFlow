export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  reminder?: Date;
  alarmSound?: string;
}

export interface AlarmSound {
  id: string;
  name: string;
  url: string;
}
