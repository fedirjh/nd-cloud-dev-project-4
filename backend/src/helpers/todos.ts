import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// import * as createError from 'http-errors'

import { TodoUpdate } from '../models/TodoUpdate'

// TODO: Implement businessLogic

const logger = createLogger('TodosBusinessLogic')

const todosAccess = new TodosAccess()

const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Getting all todos')
  return todosAccess.getTodosForUser(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('Creating a new todo')
  const todoId = uuid.v4()

  const newItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    ...createTodoRequest
  }

  return await todosAccess.createTodo(newItem)
}

export async function updateTodo(
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
  logger.info('Updating a todo')
  return await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  logger.info('Deleting a todo')
  return await todosAccess.deleteTodo(todoId, userId)
}


export async function generateUploadUrl(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info('Generating upload url')
  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  await todosAccess.updateTodoAttachmentUrl(todoId, userId, attachmentUrl)
  return attachmentUtils.getUploadUrl(todoId)
}

export async function deleteAttachment(
  todoId: string
): Promise<void> {
  logger.info('Deleting attachment from s3')
  return await attachmentUtils.deleteAttachment(todoId)
}
