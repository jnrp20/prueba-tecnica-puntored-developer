import { Login } from './login';

export abstract class LoginRepository {
  abstract findByUsername(username: string): Promise<Login | null>;
}
