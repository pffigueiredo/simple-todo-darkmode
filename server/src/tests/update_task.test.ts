
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskInput } from '../schema';
import { updateTask } from '../handlers/update_task';
import { eq } from 'drizzle-orm';

describe('updateTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task title', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Original Title',
        description: 'Original description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;

    const updateInput: UpdateTaskInput = {
      id: taskId,
      title: 'Updated Title'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(taskId);
    expect(result?.title).toEqual('Updated Title');
    expect(result?.description).toEqual('Original description'); // Should remain unchanged
    expect(result?.completed).toEqual(false); // Should remain unchanged
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should update task description', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        description: 'Original description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;

    const updateInput: UpdateTaskInput = {
      id: taskId,
      description: 'Updated description'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(taskId);
    expect(result?.title).toEqual('Test Task'); // Should remain unchanged
    expect(result?.description).toEqual('Updated description');
    expect(result?.completed).toEqual(false); // Should remain unchanged
  });

  it('should update task completion status', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        description: 'Test description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;

    const updateInput: UpdateTaskInput = {
      id: taskId,
      completed: true
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(taskId);
    expect(result?.title).toEqual('Test Task'); // Should remain unchanged
    expect(result?.description).toEqual('Test description'); // Should remain unchanged
    expect(result?.completed).toEqual(true);
  });

  it('should update multiple fields at once', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Original Title',
        description: 'Original description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;

    const updateInput: UpdateTaskInput = {
      id: taskId,
      title: 'Updated Title',
      description: 'Updated description',
      completed: true
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(taskId);
    expect(result?.title).toEqual('Updated Title');
    expect(result?.description).toEqual('Updated description');
    expect(result?.completed).toEqual(true);
  });

  it('should update description to null', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        description: 'Original description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;

    const updateInput: UpdateTaskInput = {
      id: taskId,
      description: null
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result?.id).toEqual(taskId);
    expect(result?.title).toEqual('Test Task'); // Should remain unchanged
    expect(result?.description).toBeNull();
    expect(result?.completed).toEqual(false); // Should remain unchanged
  });

  it('should return null for non-existent task', async () => {
    const updateInput: UpdateTaskInput = {
      id: 999999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeNull();
  });

  it('should update the updated_at timestamp', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        description: 'Test description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;
    const originalUpdatedAt = initialTask[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateTaskInput = {
      id: taskId,
      title: 'Updated Title'
    };

    const result = await updateTask(updateInput);

    expect(result).toBeDefined();
    expect(result?.updated_at).toBeInstanceOf(Date);
    expect(result?.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save changes to database', async () => {
    // Create a test task first
    const initialTask = await db.insert(tasksTable)
      .values({
        title: 'Original Title',
        description: 'Original description',
        completed: false
      })
      .returning()
      .execute();

    const taskId = initialTask[0].id;

    const updateInput: UpdateTaskInput = {
      id: taskId,
      title: 'Updated Title',
      completed: true
    };

    await updateTask(updateInput);

    // Query the database to verify changes were saved
    const savedTask = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(savedTask).toHaveLength(1);
    expect(savedTask[0].title).toEqual('Updated Title');
    expect(savedTask[0].description).toEqual('Original description'); // Should remain unchanged
    expect(savedTask[0].completed).toEqual(true);
  });
});
