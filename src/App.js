import { css } from 'glamor';
import React, { Component } from 'react';
import Form from './components/Form';
import Notes from './components/Notes';
// import API & graphqlOperation helpers from AWS Amplify
import { API, graphqlOperation } from 'aws-amplify'

// import the mutations & queries we'll need to interact with the API
import { createNote, updateNote, deleteNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
import { withAuthenticator } from 'aws-amplify-react'

import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
class App extends Component {
  state = { notes: [], filter: 'none' }
  async componentDidMount() {
    try {
      const { data: { listNotes: { items }}} = await API.graphql(graphqlOperation(listNotes))
      this.setState({ notes: items })
    } catch (err) {
      console.log('error fetching notes...', err)
    }
  }
  createNote = async note => {
    const notes = [note, ...this.state.notes]
    const newNotes = this.state.notes
    this.setState({ notes })
    try {
      const data = await API.graphql(graphqlOperation(createNote, { input: note }))
      this.setState({ notes: [data.data.createNote, ...newNotes] })
    } catch (err) {
      console.log('error creating note..', err)
    }
  }
  // createNote = async note => {
  //   const notes = [note, ...this.state.notes]
  //   const newNotes = this.state.notes
  //   this.setState({ notes })
  // }

  updateNote = async note => {
    const updatedNote = {
      ...note,
      status: note.status === 'new' ? 'completed' : 'new'
    }
    const index = this.state.notes.findIndex(i => i.id === note.id)
    const notes = [...this.state.notes]
    notes[index] = updatedNote
    this.setState({ notes })

    try {
      await API.graphql(graphqlOperation(updateNote, { input: updatedNote }))
    } catch (err) {
      console.log('error updating note...', err)
    }
  }
  // updateNote = async note => {
  //   const updatedNote = {
  //     ...note,
  //     status: note.status === 'new' ? 'completed' : 'new'
  //   }
  //   const index = this.state.notes.findIndex(i => i.id === note.id)
  //   const notes = [...this.state.notes]
  //   notes[index] = updatedNote
  //   this.setState({ notes })
  // }
  deleteNote = async note => {
    const input = { id: note.id }
    const notes = this.state.notes.filter(n => n.id !== note.id)
    this.setState({ notes })
    try {
      await API.graphql(graphqlOperation(deleteNote, { input }))
    } catch (err) {
      console.log('error deleting note...', err)
    }
  }
  // deleteNote = async note => {
  //   const input = { id: note.id }
  //   const notes = this.state.notes.filter(n => n.id !== note.id)
  //   this.setState({ notes })
  // }

  updateFilter = filter => this.setState({ filter })
  render() {
    let { notes, filter } = this.state
    if (filter === 'completed') {
      notes = notes.filter(n => n.status === 'completed')
    }
    if (filter === 'new') {
      notes = notes.filter(n => n.status === 'new')
    }
    return (
      <div {...css(styles.container)}>
        <p {...css(styles.title)}>Notes</p>
        <Form
          createNote={this.createNote}
        />
        <Notes
          notes={notes}
          deleteNote={this.deleteNote}
          updateNote={this.updateNote}
        />
        <div {...css(styles.bottomMenu)}>
          <p
            onClick={() => this.updateFilter('none')}
            {...css([ styles.menuItem, getStyle('none', filter)])}
          >All</p>
          <p
            onClick={() => this.updateFilter('completed')}
            {...css([styles.menuItem, getStyle('completed', filter)])}
          >Completed</p>
          <p
            onClick={() => this.updateFilter('new')}
            {...css([styles.menuItem, getStyle('new', filter)])}
          >Pending</p>
        </div>
      </div>
    );
  }
}

function getStyle(type, filter) {
  if (type === filter) {
    return {
      fontWeight: 'bold'
    }
  }
}
const styles = {
  container: {
    width: 360,
    margin: '0 auto',
    borderBottom: '1px solid #ededed',
  },
  form: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 35,
    width: '360px',
    border: 'none',
    outline: 'none',
    marginLeft: 10,
    fontSize: 20,
    padding: 8,
  }
}
// export default App;
export default withAuthenticator(App, { includeGreetings: true })
