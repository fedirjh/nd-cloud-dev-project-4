import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import { deleteAttachment } from '../../helpers/todos'


export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    if (record.eventName === 'REMOVE') {
      continue
    }

    const todoId = record.dynamodb.Keys.todoId.S

    console.log('Deleting record', todoId)
    await deleteAttachment(todoId)

  }
}
