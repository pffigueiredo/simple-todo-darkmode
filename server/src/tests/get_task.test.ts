
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type GetTaskInput } from '../schema';
import { getTask } from '../handlers/get_task';

describe('getTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a task when it exists', async () => {
    // Create a test task
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        description: 'A test task',
        completed: false
      })
      .returning()
      .execute();

    const createdTask = insertResult[0];

    // Test input
    const input: GetTaskInput = { id: createdTask.id };

    // Execute handler
    const result = await getTask(input);

    // Verify result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTask.id);
    expect(result!.title).toEqual('Test Task');
    expect(result!.description).toEqual('A test task');
    expect(result!.completed).toBe(false);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when task does not exist', async () => {
    const input: GetTaskInput = { id: 999 };

    const result = await getTask(input);

    expect(result).toBeNull();
  });

  it('should handle task with null description', async () => {
    // Create a task with null description
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Task without description',
        description: null,
        completed: true
      })
      .returning()
      .execute();

    const createdTask = insertResult[0];

    // Test input
    const input: GetTaskInput = { id: createdTask.id };

    // Execute handler
    const result = await getTask(input);

    // Verify result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdTask.id);
    expect(result!.title).toEqual('Task without description');
    expect(result!.description).toBeNull();
    expect(result!.completed).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
