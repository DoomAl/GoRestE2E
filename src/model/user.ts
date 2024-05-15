export type User = {
    id?: number;
    name: string;
    email: string;
    gender: Gender;
    status: Status;
}
type Gender = 'male' | 'female';
type Status = 'active' | 'inactive';

export type CreateUserParams = Omit<User, 'id'>;