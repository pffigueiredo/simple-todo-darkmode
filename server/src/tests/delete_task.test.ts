
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

// Test input for deleting a task
const testDeleteInput: DeleteTaskInput = {
  id: 1
};

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a task first
    await db.insert(tasksTable)
      .values({
        title: 'Task to Delete',
        description: 'This task will be deleted',
        completed: false
      })
      .execute();

    const result = await deleteTask(testDeleteInput);

    // Should return success
    expect(result.success).toBe(true);

    // Verify task was deleted from database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, testDeleteInput.id))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should return false when task does not exist', async () => {
    const result = await deleteTask({ id: 999 });

    // Should return false for non-existent task
    expect(result.success).toBe(false);
  });

  it('should not affect other tasks when deleting one', async () => {
    // Create multiple tasks
    await db.insert(tasksTable)
      .values([
        { title: 'Task 1', description: 'First task', completed: false },
        { title: 'Task 2', description: 'Second task', completed: true },
        { title: 'Task 3', description: 'Third task', completed: false }
      ])
      .execute();

    // Delete task with ID 2
    const result = await deleteTask({ id: 2 });

    expect(result.success).toBe(true);

    // Verify only the specified task was deleted
    const remainingTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(remainingTasks).toHaveLength(2);
    expect(remainingTasks.find(task => task.id === 2)).toBeUndefined();
    expect(remainingTasks.find(task => task.id === 1)).toBeDefined();
    expect(remainingTasks.find(task => task.id === 3)).toBeDefined();
  });
});
