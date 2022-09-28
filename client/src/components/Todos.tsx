import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import SemanticDatepicker from 'react-semantic-ui-datepickers';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';


import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import { Todo } from '../types/Todo'
import { withAuthenticationRequired } from '@auth0/auth0-react'
import Callback from './Callback'

interface TodosProps {
  getToken: any
  history: History
}

interface TodosState {
  todos: Todo[]
  nextKey: string|null
  newTodoName: string
  newTodoDueDate: Date | null
  loadingTodos: boolean
  limit: number
}

class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    limit: 10,
    todos: [],
    nextKey: '',
    newTodoName: '',
    newTodoDueDate: new Date(),
    loadingTodos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  handleDueDateChange = (event: (React.SyntheticEvent<Element, Event> | undefined), data : any) => {
    this.setState({ newTodoDueDate: data.value })
  }


  handleNextKeyClick = async () => {
    try {
      this.setState({
        loadingTodos: true
      })
      const { todos, nextKey } = await getTodos(await this.props.getToken(),this.state.limit,this.state.nextKey)

      this.setState({
        todos,
        nextKey,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async () => {
    try {
      // @ts-ignore
      const dueDate = dateFormat(this.state.newTodoDueDate,'yyyy-mm-dd')
      const newTodo = await createTodo(await this.props.getToken(), {
        name: this.state.newTodoName,
        dueDate
      })

      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: '',
        newTodoDueDate: new Date()
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(await this.props.getToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(await this.props.getToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const { todos, nextKey } = await getTodos(await this.props.getToken(),this.state.limit,this.state.nextKey)
      this.setState({
        todos,
        nextKey,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}

        {this.renderNextPageButton()}
      </div>
    )
  }

  renderNextPageButton(): React.ReactNode {
    if (!this.state.loadingTodos) {
      return (
        <Grid centered>
          <Grid.Column textAlign={"center"}>
            <Button onClick={this.handleNextKeyClick} >
              Next page
            </Button>
          </Grid.Column>
        </Grid>
      )
    }
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Grid columns={2}>
            <Grid.Column width={12}>
              <Input
                action={{
                  color: 'teal',
                  labelPosition: 'left',
                  icon: 'add',
                  content: 'New task',
                  onClick: this.onTodoCreate
                }}
                fluid
                value={this.state.newTodoName}
                actionPosition="left"
                placeholder="To change the world..."
                onChange={this.handleNameChange}
              />
            </Grid.Column>
            <Grid.Column width={4}>
              <SemanticDatepicker
                locale="en-US"
                clearable
                value={this.state.newTodoDueDate}
                onChange={this.handleDueDateChange} />
            </Grid.Column>
          </Grid>
        </Grid.Column>

        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos?.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}

export default withAuthenticationRequired(Todos, {
  onRedirecting: () => <Callback />,
});
