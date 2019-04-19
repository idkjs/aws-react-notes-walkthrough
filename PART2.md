# Part 2: Adding Cloud Features

In this section, you will cloud enable your React app using the Amplify CLI.

### Install Amplify CLI

Amplify CLI is the command line tool that you will use to create and manage the backend for your React app. In the upcoming sections, you will use Amplify CLI to simplify various operations. The CLI enables you to create and configure your backend quickly, even without leaving the command line!

### Installing and Configuring the CLI

To use Amplify CLI with your project, you need to install it to your local development machine and configure it with your AWS credentials. Configuration is a one-time effort; once you configure the CLI, you can use it on multiple projects on your local machine. Because the CLI creates backend resources for you, it needs to utilize an AWS account with appropriate IAM permissions. During the configuration step, a new IAM role will be automatically created on your AWS account.

To install and configure the Amplify CLI, run the following commands:

```sh
$ npm install -g @aws-amplify/cli

$ npm amplify configure
```

> For a video walkthrough of how to configure the Amplify CLI, check out [this](https://www.youtube.com/watch?v=fWbM5DLh25U) video.

### Amplify CLI vs. AWS Console

The backend resources that are created by the CLI is available to you through the AWS Console, e.g., you can access your Amazon Cognito User Pool on the AWS Console after you enable auth with Amplify CLI.

> To learn about Amplify CLI, visit the CLI developer documentation.

### Initialize Your Backend

To initialize your backend, run the following command in your project’s root folder:

```sh
$ amplify init
```

The CLI guides you through the options for your project. Select `React` as your framework when prompted:

```sh
 Please tell us about your project
  ? What javascript framework are you using
  ❯ react
    react-native
    angular
    ionic
    vue
    none
```

When the CLI successfully configures your backend, the backend configuration files are saved to `/amplify` folder. You don’t need to manually edit the content of this folder as it is maintained by the CLI.

### Adding Analytics

Let’s add our first backend feature to our app, Analytics. Adding Analytics won’t change the user experience though, but it will provide valuable metrics that you can track in Amazon Pinpoint dashboard.

While enabling Analytics, you will also learn how to use Amplify CLI and configure your app to work with various backend services.

### How the Amplify CLI works?

When you deploy your backend with Amplify CLI, here is what happens under the hood:

1. The CLI creates and provisions related resources on your account
2. The CLI updates your ‘/amplify’ folder, which has all the relevant information about your backend on AWS
3. The CLI updates the configuration file aws-exports.js with the latest resource credentials

As a front-end developer, you need to import the auto generated aws-exports.js configuration file in your React app, and configure your app with Amplify.configure() method call.

So, to enable analytics to your application, run the following commands:

```sh
$ amplify add analytics
$ amplify push
```

After successfully executing the push command, the CLI updates your configuration file _aws-exports.js_ in your ‘/src’ folder with the references to the newly created resources.

## Working with The Configuration File

The next step is to import _aws-exports.js_ configuration file into your app.

To configure your app, open __src/App.js__ file and make the following changes in code:

```js
import Amplify, { Analytics } from 'aws-amplify';
import aws_exports from './aws-exports';

Amplify.configure(aws_exports);
```

### Monitoring App Analytics

Refresh your application a couple of times, and then you will automatically start receiving usage metrics in the Amazon Pinpoint console.

To view the Amazon Pinpoint console, visit [https://console.aws.amazon.com/pinpoint/home/](https://console.aws.amazon.com/pinpoint/home/) & select the region where you created the service.

Since your application doesn’t have much functionality at the moment, only ‘session start’ events are displayed in Pinpoint Console. As you add more cloud features to your app - like authentication - Amplify will automatically report related analytics events to Amazon Pinpoint. So, you will know how your users are interacting with your app.

### Adding Authentication

Now that you know how to utilize Amplify CLI to enable backend services, you can continue to add new features to your React app easily.

User authentication will be the next cloud feature you will enable.

If you have been following the tutorial from the start and enabled Analytics in the previous step, auth is already enabled for your app (analytics needs secure credentials for reporting metrics). **In this case, you just need to run update auth command to create a User Pool that will store your registered users**:

```sh
$ amplify update auth

> Do you want to use the default authentication and security configuration? Yes, use the default configuration.

$ amplify push
```

If you have not enabled Analytics earlier, you will be using auth features for the first time. Run the following command:

```sh
$ amplify add auth
$ amplify push
```

When prompted by the CLI, chose ‘default configuration’:

```sh
Do you want to use the default authentication and security configuration?
❯ Yes, use the default configuration.
```

> AWS Amplify’s Authentication category works with Amazon Cognito, a cloud-based authentication and federation service that enables you to manage user access to your applications.

## Enabling the UI Components for Auth

One of the most important benefits of Amplify Framework is that you don’t need to implement standard app features - like user authentication - from scratch. Amplify provides UI components that you can integrate into your app with just a few lines of code.

## Rendering the Auth UI

Now, let’s put the auth UI components in our home page. We'll be using the `withAuthenticator` higher order component from the _aws-amplify-react_ library.

The `withAuthenticator` component renders a pre-built sign-in and sign-up flow with full-fledged auth functionality like user registration, password reminders, and Multi-factor Authentication.

Open __src/App.js__. Import the `withAuthenticator` component & replace the default export for the component:

```js
import { withAuthenticator } from 'aws-amplify-react'

export default withAuthenticator(App, { includeGreetings: true })
```

### Test Your Auth Flow

Now, refresh your app. Once your application loads, you will see login/signup controls.

![](auth.jpg)

### Where is the user data stored?

When a new user registers through the `withAuthenticator` component, the user data is stored in your Cognito User Pool. A user pool is a user directory in Amazon Cognito. With a user pool, your users can sign in to your app through Amazon Cognito. You can visit [Amazon Cognito console](https://console.aws.amazon.com/cognito/home), and see the list of registered users by selecting the User Pool that is created for your app.
