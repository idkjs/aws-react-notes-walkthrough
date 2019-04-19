## Content
Here is the sequence of the tutorial:

[Part 1: Creating the React App](https://github.com/dabit3/react-notes#part-1-create-a-react-app)

[Part 2: Adding Cloud Features](./PART2.md)

[Part 3: Enabling GraphQL Backend](./Part3.md)

# Part 1: Create a React App

This section introduces React basics. You will learn how to bootstrap a new React app with the Create React App CLI. In subsequent parts of the tutorial, you will gradually add new cloud functionality to your application.

> If you want to integrate Amplify Framework into an existing React application, you can skip Part 1 and start directly to Part 2.

### Install the Create React App CLI and Create a New Project
The easiest way to create an React application is with the Create React App Command Line Interface (CLI). To install the CLI, run the following command in your terminal:

```sh
$ npm install -g create-react-app
```

After the installation, go to a location where you wish to start your new application project and execute the following command to create a new React app:

```sh
$ create-react-app amplify-notes
```

#### Testing your React App

You can test your React app anytime in a browser by running:

```sh
$ npm start
```

## Creating Components

In this section, we'll create the components that we will use in our React app. These components will at first use local state to manage data. Later on, we'll update our application to work with data from the cloud by adding an AppSync GraphQL API.

![](notesapp.jpg)

The next thing we'll need to do is install a couple of additional dependencies (Glamor for styling & React Icons for Icons):

```sh
npm install react-icons glamor
```

Next, we'll need to create a few new files to hold our components.

In the `src` directory, create a `components` directory with three new components: __Form.js__, __Note.js__, & __Notes.js__:

```sh
mkdir components
touch components/Form.js components/Note.js components/Notes.js
```

Next, we'll update App.js. App.js will hold most of the logic for creating, updating & deleting items in our app.

First, let's import everything we'll need for the component:

```js
// src/App.js

import { css } from 'glamor'

import Form from './components/Form'
import Notes from './components/Notes'
```

Next, in our class, we'll define the initial state:

```js
state = { notes: [], filter: 'none' }
```

- The `notes` array will hold the notes we will be rendering in our app.
- The `filter` value will hold the current filter for the type notes that we are viewing (all notes, completed notes, or pending notes).

Next, we'll define the methods we'll be needing:

```js
createNote = async note => {
  const notes = [note, ...this.state.notes]
  const newNotes = this.state.notes
  this.setState({ notes })
}

updateNote = async note => {
  const updatedNote = {
    ...note,
    status: note.status === 'new' ? 'completed' : 'new'
  }
  const index = this.state.notes.findIndex(i => i.id === note.id)
  const notes = [...this.state.notes]
  notes[index] = updatedNote
  this.setState({ notes })
}

deleteNote = async note => {
  const input = { id: note.id }
  const notes = this.state.notes.filter(n => n.id !== note.id)
  this.setState({ notes })
}

updateFilter = filter => this.setState({ filter })
```

- `createNote` - This method creates a new note in the state.

- `updateNote` - This method updates the `status` of the note to be either __completed__ or __new__.

- `deleteNote` - This method deletes the note from the state.

- `updateFilter` - This method changes the filter type that we are currently viewing.

Next, we'll update the render method to the following:

```js
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
```

- We first destructure the `notes` array & the `filter` value from the state.
- Next, we apply the filter on the notes array if there is a filter that matches either `completed` or `new`.
- We return the __Form__ & __Notes__ components as well as some UI to apply the filter.

Finally, we have a few styles that we create to style our UI:

```js
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
```

Now, let's take a look at the __Note__ component (components/Note.js):

```js
// src/components/Note.js

import React from 'react'
import { css } from 'glamor'
import { FaTimes, FaCircle } from 'react-icons/fa'
import { MdCheckCircle } from 'react-icons/md';

class Note extends React.Component {
  render() {
    const { name, status } = this.props.note
    return (
      <div {...css(styles.container)}>
        {
          status === 'new' && (
            <FaCircle
              color='#FF9900'
              {...css(styles.new)}
              size={22}
              onClick={() => this.props.updateNote(this.props.note)}
            />
          )
        }
        {
          status === 'completed' && (
            <MdCheckCircle
              {...css(styles.completed)}
              size={22}
              color='#FF9900'
              onClick={() => this.props.updateNote(this.props.note)}
            />
          )
        }
        <p {...css(styles.name)}>{name}</p>
        <div {...css(styles.iconContainer)}>
          <FaTimes
            onClick={() => this.props.deleteNote(this.props.note)}
            color='red'
            size={22}
            {...css(styles.times)}
          />
        </div>
      </div>
    )
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
    borderBottom: '1px solid rgba(0, 0, 0, .15)',
    display: 'flex',
    alignItems: 'center'
  },
  name: {
    textAlign: 'left',
    fontSize: 18
  },
  iconContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  new: {
    marginRight: 10,
    cursor: 'pointer',
    opacity: .3
  },
  completed: {
    marginRight: 10,
    cursor: 'pointer'
  },
  times: {
    cursor: 'pointer',
    opacity: 0.7
  }
}

export default Note
```

This component is pretty basic: we return the note `name` as well as some UI for updating & deleting the note.

If the note is `new`, we show an empty circle next to the note.

If the note is `completed`, we show a circle with a checkmark next to it. If the circle is clicked, we call the `updateNote` method passed down as props & toggle the `completed` state..

We also have a red __x__ that deletes the note when clicked by calling the `deleteNote` method passed down as props.

Next, let's take a look at __Notes__ component (Notes.js):

```js
// src/components/Notes.js

import React from 'react'
import { css } from 'glamor'

import Note from './Note'

class Notes extends React.Component {
  render() {
    return (
      <div {...css(styles.container)}>
        {
          this.props.notes.map((t, i) => (
          <Note
            key={i}
            note={t}
            deleteNote={this.props.deleteNote}
            updateNote={this.props.updateNote}
          />
          ))
        }
      </div>
    )
  }
}

const styles = {
  container: {
    width: '360px',
    margin: '0 auto',
    '@media(max-width: 360px)': {
      width: 'calc(100% - 40px)'
    }
  }
}

export default Notes
```

In this component, we map over all of the notes (passed in as `this.props.notes`), & render a __Note__ component for each item in the array.

We pass in the `deleteNote` & `updateNote` methods as props to each __Note__ component along with the note.

Finally, let's take a look at the __Form__ component (components/Form.js):

```js
// src/components/Form.js

import React from 'react'
import { css } from 'glamor'
import { MdAdd } from 'react-icons/md'

class Form extends React.Component {
  state = { name: '' }
  onChange = e => {
    this.setState({ name: e.target.value })
  }
  handleKeyPress = (e) => {
    if (e.key === 'Enter' && this.state.name !== '') {
      const note = {
        ...this.state, status: 'new'
      }
      this.props.createNote(note)
      this.setState({ name: '' })
    }
  }
  render() {
    return (
      <div {...css(styles.container)}>
        <div {...css(styles.form)}>
          <MdAdd size={28} />
          <input
            placeholder='Note Name'
            {...css(styles.input)}
            onKeyPress={this.handleKeyPress}
            onChange={e => this.onChange(e)}
            value={this.state.name}
          />
        </div>
      </div>
    )
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

export default Form
```

This component renders a basic form. In the component we listen for an __enter__ `keyPress` event. If the key is the __Enter__ key, we call `this.props.createNote`, passing in the value in the text input.

## Testing Your Components

Now, a working shell for our application if completed & should work with local state. Let's test it out:

```sh
npm start
```

You should be able to create, update & delete todos in your app. You'll notice that when you refresh, the data goes away. We'll fix this in a later step by storing our data in an AppSync API & fetching it when the app loads.

# [Part 2: Adding Cloud Features](./PART2.md)

# [Part 3: Enabling GraphQL Backend](./Part3.md)
