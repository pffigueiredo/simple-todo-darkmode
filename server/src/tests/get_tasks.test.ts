
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();
    expect(result).toEqual([]);
  });

  it('should return all tasks', async () => {
    // Create test tasks
    await db.insert(tasksTable)
      .values([
        {
          title: 'Task 1',
          description: 'First task',
          completed: false
        },
        {
          title: 'Task 2',
          description: null,
          completed: true
        }
      ])
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(typeof result[0].completed).toBe('boolean');
  });

  it('should return tasks ordered by created_at descending', async () => {
    // Create tasks with slight delay to ensure different timestamps
    await db.insert(tasksTable)
      .values({
        title: 'First Task',
        description: 'Created first',
        completed: false
      })
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(tasksTable)
      .values({
        title: 'Second Task',
        description: 'Created second',
        completed: false
      })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Second Task');
    expect(result[1].title).toEqual('First Task');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle tasks with null descriptions', async () => {
    await db.insert(tasksTable)
      .values({
        title: 'Task with null description',
        description: null,
        completed: false
      })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
    expect(result[0].title).toEqual('Task with null description');
  });
});
