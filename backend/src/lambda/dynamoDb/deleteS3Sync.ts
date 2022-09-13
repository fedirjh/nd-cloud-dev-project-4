import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import { deleteAttachment } from '../../helpers/todos'


export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    if (record.eventName !== 'REMOVE') {
      continue
    }

    const newItem = record.dynamodb.OldImage

    const todoId = newItem.todoId.S

    await deleteAttachment(todoId)

  }
}
