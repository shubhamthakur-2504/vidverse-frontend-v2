type Login = {
    email: string;
    password: string;
}
type RegisterForm = {
    email: string;
    password: string;
    username: string;
    fullName: string;
    avatar: File;
    cover: File;
}

type ChangePassword = {
    currentPassword: string;
    newPassword: string;
}

type ChangeFiles =
    | { avatar: File; cover?: never }
    | { cover: File; avatar?: never };

type ChangeUserInfo =
    | { userName: string; fullName?: string }
    | { fullName: string; userName?: never };


export type { Login, RegisterForm, ChangePassword, ChangeFiles, ChangeUserInfo };