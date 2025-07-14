
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetTaskInput, type Task } from '../schema';

export const getTask = async (input: GetTaskInput): Promise<Task | null> => {
  try {
    const result = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Task retrieval failed:', error);
    throw error;
  }
};
