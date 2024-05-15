export type Post = {
    id: number;
    title: string;
    body: string;
    user_id: number;
}

export type CreatePostParams = Omit<Post, 'id' | 'user_id'>;