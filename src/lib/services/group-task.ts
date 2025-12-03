import connectionPool from "../db";
import { GroupTask, GroupTaskResponse } from "../models/group-task";
import { Task } from "../models/task";
import {
  CreateUpdateGroupTaskInput,
  UpdateGroupTaskInput,
} from "../validations/group-task";

export async function getGroupTasks(
  userId: string
): Promise<GroupTaskResponse[]> {
  const client = await connectionPool.connect();

  try {
    const { rows: groupTasks } = await client.query<GroupTask>(
      `
            SELECT * FROM group_tasks WHERE user_id = $1 ORDER BY created_at DESC;
            `,
      [userId]
    );

    if (groupTasks.length === 0) {
      return [];
    }

    const groupTaskResponses: GroupTaskResponse[] = await Promise.all(
      groupTasks.map(async (groupTask) => {
        const { rows: tasks } = await client.query<Task>(
          `
            SELECT * FROM tasks WHERE group_task_id = $1 ORDER BY created_at DESC;
            `,
          [groupTask.id]
        );

        return {
          id: groupTask.id,
          title: groupTask.title,
          type: groupTask.type,
          startDate: groupTask.start_date,
          endDate: groupTask.end_date,
          tasks: tasks.length > 0 ? tasks : [],
        };
      })
    );

    return groupTaskResponses;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function createGroupTask(
  userId: string,
  data: CreateUpdateGroupTaskInput
): Promise<boolean> {
  const client = await connectionPool.connect();

  try {
    const result = await client.query<GroupTask>(
      `
      INSERT INTO group_tasks (user_id, title, type, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [userId, data.title, data.type, data.start_date, data.end_date]
    );

    if (result.rowCount === 0) {
      throw new Error("Gagal membuat group task");
    }

    return true;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function getGroupTaskById(
  groupTaskId: string,
  userId: string
): Promise<GroupTask | null> {
  const client = await connectionPool.connect();

  try {
    const { rows } = await client.query<GroupTask>(
      `
      SELECT * FROM group_tasks WHERE id = $1 AND user_id = $2;
    `,
      [groupTaskId, userId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function updateGroupTask(
  groupTaskId: string,
  userId: string,
  data: Partial<UpdateGroupTaskInput>
): Promise<boolean> {
  const client = await connectionPool.connect();

  try {
    // Build dynamic UPDATE query berdasarkan field yang dikirim
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(data.title);
      paramIndex++;
    }

    if (data.type !== undefined) {
      updateFields.push(`type = $${paramIndex}`);
      values.push(data.type);
      paramIndex++;
    }

    if (data.start_date !== undefined) {
      updateFields.push(`start_date = $${paramIndex}`);
      values.push(data.start_date);
      paramIndex++;
    }

    if (data.end_date !== undefined) {
      updateFields.push(`end_date = $${paramIndex}`);
      values.push(data.end_date);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      // Tidak ada field yang diupdate
      return true;
    }

    // Tambahkan user_id dan groupTaskId ke values
    values.push(userId, groupTaskId);

    const query = `
      UPDATE group_tasks 
      SET ${updateFields.join(", ")}
      WHERE user_id = $${paramIndex} AND id = $${paramIndex + 1}
    `;

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("Group task tidak ditemukan atau tidak memiliki akses");
    }

    return true;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteGroupTask(
  groupTaskId: string,
  userId: string
): Promise<boolean> {
  const client = await connectionPool.connect();

  try {
    const result = await client.query(
      `
            DELETE FROM group_tasks
            WHERE id = $1 AND user_id = $2
            `,
      [groupTaskId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error("Tidak ditemukan group task");
    }

    return true;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
