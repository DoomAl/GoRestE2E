export type Todo = {
    id: number;
    title: string;
    due_on: string;
    user_id: number;
    status: Status;
}
type Status = 'pending' | 'completed';

export type CreateTodoParams = Omit<Todo, 'id' | 'user_id' | 'due_on'>;