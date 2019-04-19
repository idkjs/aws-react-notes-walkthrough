# Part 3: Enabling GraphQL Backend

So far, your app is powered by Amazon Cognito User Pools, but we do not yet have any real yet as far as storing data. In this part, you will integrate your app with a GraphQL API (powered by AWS AppSync) that will store your notes in a NoSQL database (Amazon DynamoDB).

### What is GraphQL?

GraphQL is a modern way of building APIs for your apps and interacting with your backend. It has many benefits over REST – such as using a single endpoint, powerful query syntax, data aggregation from multiple sources and a type system to describe the data – but the overall goal is to make your front-end development experience easy and more productive.

The Amplify CLI will also help you when creating the GraphQL backend.

### Create a GraphQL API

In the root folder of your app project, run the following command:

```sh
amplify add api
```

Then, select GraphQL as the service type:

```sh
? Please select from one of the below mentioned services (Use arrow keys)
❯ GraphQL
  REST
```

> API category supports GraphQL and REST endpoints. In this tutorial, we will create our backend on GraphQL, which uses AWS AppSync.

When you select GraphQL as the service type, the CLI offers you options to create a schema. A schema defines the data model for your GraphQL backend.

Select Single object with fields when prompted What best describes your project?. This option will create a GraphQL backend data model which we can modify and use in our app:

```sh
? Provide API name: reactnotes
? Choose an authorization type for the API Amazon Cognito User Pool
Use a Cognito user pool configured as a part of this project
? Do you have an annotated GraphQL schema? No
? Do you want a guided schema creation? true
? What best describes your project:
? What best describes your project: Single object with fields (e.g., “Todo” with ID, name, description)
? Do you want to edit the schema now? Yes
```

This should open a GraphQL schema in your text editor (located at amplify/backend/api/reactnotes/schema.graphql).

Update the schema to the following & save the file:

```graphql
type Note @model {
  id: ID!
  name: String!
  description: String
  status: String!
}
```

Deploy your GraphQL backend:

```sh
$ amplify push
```

When prompted, choose code generation language target as JavaScript:

```sh
? Do you want to generate code for your newly created GraphQL API: Yes
? Choose the code generation language target: javascript
? Enter the file name pattern of graphql queries, mutations and subscriptions: src/graphql/**/*.js
? Do you want to generate/update all possible GraphQL operations - queries, mutations and subscriptions: Yes
```

### Using GraphQL Queries and Mutations

When working with a GraphQL API, you pass queries - or mutations - to the GraphQL endpoint. Queries are used for read operations, and mutations perform create, update & delete operations.

A query/mutation has a simple, JSON-like format, but you don’t need to write it manually. Instead, the Amplify CLI can auto-generate queries and mutations for you.

## Auto-Generating Queries/Mutations

When you updated your GraphQL schema, selecting Do you want to update code for your updated GraphQL API option generated queries and mutations that you need. The CLI also saved your generated queries and mutations under ‘src/graphql’ folder.

> You can auto-generate queries and mutations anytime by running the `$ amplify codegen` command.

When you check the `src/graphql` folder, you will see that the CLI has generated a list of queries, mutations, & subscriptions for common data operations. You will use them to perform CRUD (create-read-update-delete) operations on your data:

| TYPE          | OPERATIONS                       |
| ------------- | -------------                    |
| query         | getNote , listNotes              |
| mutation | createNote , updateNote , deleteNote  |

## Running Queries/Mutations

To run a query or mutation, you import it in your app, and use Amplify `API` category to perform the operation:

```js
import Amplify, { API, graphqlOperation } from "aws-amplify";
import { listNotes } from './graphql/queries';

const allNotes = await API.graphql(graphqlOperation(listNotes));
console.log(allNotes);
```

Let's take a look at how to do this in our app.

## Connecting to the GraphQL Backend & Updating Your App

Currently, your GraphQL API and related backend resources (an Amazon DynamoDB table that stores the data) have been deployed to the cloud. Now, we can update the functionality to our app by integrating the GraphQL backend.

To do so, we'll open __App.js__ & do the following:

1.  Import the components & queries we'll need to interact with the API:

```js
// import API & graphqlOperation helpers from AWS Amplify
import { API, graphqlOperation } from 'aws-amplify'

// import the mutations & queries we'll need to interact with the API
import { createNote, updateNote, deleteNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
```

2. Add a __ComponentDidMount__ lifecycle method to fetch the data from the AppSync API when the app loads & update the state:

```js
async componentDidMount() {
  try {
    const { data: { listNotes: { items }}} = await API.graphql(graphqlOperation(listNotes))
    this.setState({ notes: items })
  } catch (err) {
    console.log('error fetching notes...', err)
  }
}
```

Here, we call the API & fetch all of the notes. When the data is returned, we update the notes array to the data that was returned from the API.

3. Update the __createNote__ method to create the note in the AppSync API:

```js
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
```

This method calls the API & creates a new note. We still provide an optimistic response as to update the UI as soon as the user creates the note without waiting for the response from the API.

4. Update the __updateNote__ method to update the note in the AppSync API:

```js
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
```

This method updates the status of the note to be either completed or new. We also provide an optimistic response.

5. Update the __deleteNote__ method to delete the note in the AppSync API:

```js
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
```

This method deletes the note from the API. We also still provide an optimistic response.

### Testing it out

You have just implemented GraphQL queries and mutations in your CRUD functions. Now, you can test your app and verify that the app data is persisted using your GraphQL backend!

```sh
npm start
```

Inspecting a GraphQL Mutation

Let’s see what is happening under the hood. Run your app, and add a new item while you monitor the network traffic in your browser’s developer tools. Here is what you will see for a mutation HTTP request:

![](preview.png)

When you check the request header, you will notice that the Request Payload has the note item data in JSON format.

__Congratulations! You now have a cloud-powered React app!__

You’ve persisted your app’s data using AWS AppSync and Amazon DynamoDB.

### What’s next?

You have completed this tutorial. However, if you like to improve your app even further, here are some ideas you can consider.

#### Deploy your app using the Amplify Console

The AWS Amplify Console is a continuous deployment and hosting service for mobile web applications. The AWS Amplify Console makes it easy for you to rapidly release new features, helps you avoid downtime during application deployment, and handles the complexity of simultaneously updating the frontend and backend of your applications. To learn more about the Amplify console, check out [the documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html).

#### Work with User Data

You may have noticed that our Note GraphQL schema doesn’t have a user id field. It means that the notes list is not personalized for your app users. To fix that, you can retrieve the user id after login, and use it when you work with data. When a user is logged in, you may also like to use the user profile information in your app, like displaying the username or profile picture. Learn more about User Attributes here.

#### Use GraphQL Subscriptions

In addition to queries and mutations, you can use GraphQL subscriptions with AWS AppSync and enable real-time data in your app. Think of a user experience which you share your notes with your friends and all of you create and edit items at the same time. Learn more about subscriptions here.

#### Add Search

You can add search functionality to your app. This will be very easy by adding a @searchable directive in your GraphQL schema. Learn more about here.

#### Add Images

You can add an image attachment feature for notes. This can be simply done by enabling complex object types in your GraphQL schema. Learn more about here.
