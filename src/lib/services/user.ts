import connectionPool from "@/lib/db";
import bcrypt from "bcrypt";
import {
  User,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
} from "@/lib/models/user";

export async function createUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const client = await connectionPool.connect();

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const result = await client.query<User>(
      `
      INSERT INTO users (username, password)
      VALUES ($1, $2)
      RETURNING id, username, created_at, updated_at
    `,
      [data.username, hashedPassword]
    );

    if (result.rows.length === 0) {
      throw new Error("Gagal membuat user");
    }

    const user = result.rows[0];

    return {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function isUsernameExists(username: string): Promise<boolean> {
  const client = await connectionPool.connect();

  try {
    const result = await client.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

export async function loginUser(
  data: LoginRequest
): Promise<{ id: string; username: string }> {
  const client = await connectionPool.connect();

  try {
    const result = await client.query<User>(
      `SELECT id, username, password FROM users WHERE username = $1`,
      [data.username]
    );

    if (result.rows.length === 0) {
      throw new Error("Username atau password salah");
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Username atau password salah");
    }

    return {
      id: user.id,
      username: user.username,
    };
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
