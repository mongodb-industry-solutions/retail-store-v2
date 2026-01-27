# Complex event processing (CEP) for customer retention

## Table of Contents
<details>
  <ol>
    <li><a href="#prerequisites">Prerequisites</a></li>
    <li><a href="#initial-configuration">Initial Configuration</a></li>
    <li><a href="#demo-overview">Demo Overview</a></li>
    <li><a href="#authors-&-contributors">Authors & Contributors</a></li>
    </ol>
</details>

## Prerequisites

Make sure to have the following tools to follow along smoothly and run this demo on your own environment.
* MongoDB Atlas Account. Create an Atlas account at https://cloud.mongodb.com and provision a Cluster. You can follow the instructions from this article to set up your Cluster.
* Atlas Stream Processing (ASP) setup. Required to process real-time event streams and identify customer behavior patterns.
* Model Context Protocol (MCP) setup. For agent reasoning and decision-making capabilities.
* Install Node. This will be required to install the node modules which contain all the necessary packages to run our demo. 
* Install Git. This will be required to clone the demo repository.

## Initial Configuration

### Step 1. Clone the repository
Start by obtaining the demo code. Open your terminal, navigate to the directory where you want to store the code, and run the following command:

git clone https://github.com/mongodb-industry-solutions/retail-store-v2.git

### Step 2. Set up environment variables and install dependencies
Navigate to the project directory and create a file called .env.local at the root level. This file is essential for managing configuration settings, especially when it contains sensitive information such as private keys.

```bash
cd retail-store-v2
touch .env.local 
```

Note: For Window's users, replace touch .env.local with echo $null >> .env.local 

Open the .env.local file that you just created, and add the following environment variables.

```bash
MONGODB_URI=
DATABASE_NAME="leafy_popup_store"
COLLECTION_NAME="orders"
NODE_ENV="development"
```

Leave the MONGODB_URI blank for now, you will retrieve its value on Step 3. 

Install the node modules executing the following command:

```bash
npm install
```

This installation might take a few moments to complete, as all the required packages are being downloaded and installed into the project. Once the command finishes executing, a new folder named 'node_modules' will appear at the root level of the application code, containing the installed dependencies.

### Step 3. Retrieve your connection string
A MongoDB connection string is required to connect to the cluster you created in the 'Prerequisites' section. Follow the steps provided in [this article](https://www.mongodb.com/resources/products/fundamentals/mongodb-connection-string#:~:text=How%20to%20get%20your%20MongoDB,connection%20string%20for%20your%20cluster.) to retrieve your connection string. 

When choosing your connection method for MongoDB, select the option labeled 'Drivers', as illustrated in Figure 1.

![image](../omnichannel/media/connection.png)

Figure 1. Atlas screen to choose a connection method.

Once you select the 'Drivers' option copy the provided connection string. It should look something like this:

```bash
mongodb+srv...
```

Great job! Assign the connection string to the MONGODB_URI variable replacing <username> and <password> with your actual credentials and save the changes. Your .env.local file should now resemble the following:

```bash
MONGODB_URI=
DATABASE_NAME="leafy_popup_store"
COLLECTION_NAME="orders"
NODE_ENV="development"
```

###  Step 4. Populate your database
Next, populate your database with the required data and metadata required for the demo. In the application code locate the dump/leafy_popup_store directory. Inside it, there are several .gz files which contain the data and metadata of the collections: users, products, orders, locations and carts.

Use the [mongorestore](https://www.mongodb.com/docs/database-tools/mongorestore/) command to load the data from the database dump into a new database within your Cluster.

Let's go back to your terminal, navigate to the directory /retail-store-v2 (the root level of the application code), and run the following command:

```bash
mongorestore --gzip --dir=dump/leafy_popup_store --db=leafy_popup_store --uri "mongodb+srv:..."
```

This command will create the database and collections and log its progress. Upon completion, you should see a log like this:

```bash
92 document(s) restored successfully. 0 document(s) failed to restore.
```

Perfect! You now have your application code with environment variables, all the dependencies installed and the database created with the required data loaded.

###  Step 5. Setup the backend

To enable customer retention features and real-time event processing, backend microservices must be set up. This includes configuring two Atlas Stream Processing pipelines for customer behavior analysis and Next Best Action generation. Please refer to that [customer retention microservice backend README](TODO url) for detailed setup instructions.

###  Step 6. Run the demo
Now you are all set to run the demo. Go back to the terminal, at the root of the application code execute the following command:

```bash
npm run dev
```

Then, open your browser and navigate to http://localhost:8080/shop and you should see the customer retention demo interface.

Congratulations, you have successfully set up the demo in your own environment! Browse products and interact with the interface to see customer retention behaviors in action.

## Demo Overview

### Understanding the shopping page

In this page we are demonstrating how the Leafy PopUp ecommerce captures and analyses real-time customer behaviour while browsing through the catalog. And generate reactive measures in the form of Next Best Actions, to keep the customer engaged and retain them.

The system captures customer behavior events during an active user session to enable real-time processing and trigger Next Best Actions.

**Demo Controls Inside the navbar:**
- **Expand Icon** - Toggles a sidebar that showcases some of the behind the scenes collections and processes happening in the back.
- **Bell Icon** - Opens the notifications menu where we are displaying the 'Next Best Actions (NBA)' generated. NBA are all centralized on this notification menu, however some of them can be present in other places like the product details to show another example of what the NBA can trigger/do.

### 1. UX events streams
**Sending real-time heartbeats and action based events**

In retail and digital commerce systems, customer behavior is typically observed through:
- Action-based events (clicks, navigation, cart interactions)
- Lightweight engagement signals to indicate session presence and activity

Perform any of the actions mentioned in the table below and map them to the "UX events streams" section on the right side. Click on the CurlyBraces icon to see the full document.

| Event type | Perform the following to emit this event | What it represents |
|------------|-------------------------------------------|-------------------|
| **View product** | Click a product card to open its detailed view | Product-level interest and intent discovery. |
| **Add to cart** | Click the Add to Cart button found inside the details of the product. | Strong purchase intent signal. |
| **Exit intent** | Click on the LogOut icon at the rightmost side of the navbar, and hover your mouse over the "Log out" area. | Potential abandonment risk. |
| **Heartbeat** | No action needed, sent periodically (every ~10 seconds). | Continued session presence and activity. |

![Events Section](./media/events.png)

### 2. Customer behaviour signals
**Finding Complex Event Patterns (CEP) from the events to identify customer behaviour signals**

This section will start auto populating as you continue to interact on this page.

In this demo we have three possible signal types identified:

| Signal Type | What it represents | Why it matters |
|-------------|-------------------|----------------|
| **High Intent** | The customer is actively considering a specific purchase | Opportunity to remove doubt and accelerate conversion |
| **Search Friction** | The customer is trying to find something but isn't progressing | Best moment to help before frustration turns into abandonment |
| **Exit Risk** | The customer is likely to leave without converting | Last chance to retain (recover cart, save intent, assist immediately) |

It's important to note that signals are not calculated on linear rules but, based on a behavioral algorithm that looks at intensity and direction in user behavior.

You can see these signals listed inside the 'Customer behaviour signals' section, click on the curly bracket icon to see the full document.

![Customer Behaviour Signals](./media/customerBehaviours.png)

### 3. Agent reasoning

A lightweight agent takes the session signals and decides which is the best Next Best Action.

In this demo we have three possible Next Best Action types from which the agent can pick based on the signals that it reads.

### 4. Next Best Action decisions
**The Next Best actions generated by the agent**

This section will start auto populating as the agent creates Next Best Actions to send to the customer.

You will see the Next Best Actions listed inside this section.

![Next Best Actions](./media/nextBestAction.png)

**How will the customer look at these NBAs?**

NBAs are displayed inside the navbar as Notifications

![Notifications](./media/notifications.png)

Also for some NBA that are for a specific product, in addition to the notification you will be able to see it inside the product details as well as with a Fire icon on the product card.

![Embedded Notifications](./media/embedNotification.png)

### Demo Walkthrough

Below are three clear scenarios you can try to get Next Best Actions.

**Scenario 1 — High Intent**
- **Sequence:** search → view-product → add-to-cart (same category/topic)
- **Show:**
  - baseline high intent detection
  - Decision layer writes NBA: "Complete your purchase" or "Recommended matching item"

**Scenario 2 — Search Friction**
- **Sequence:** search → search → search without cart/progress
- **Show:**
  - baseline friction detection
  - Decision layer writes NBA: recommendations or top alternative items

**Scenario 3 — Exit Risk**
- **Sequence:** add-to-cart then exit-intent
- **Show:**
  - urgent signal
  - Decision layer writes NBA: "Don't forget your cart" or similar retention action

## Authors & Contributors

### Lead Authors   
[Rodrigo Leal](https://www.mongodb.com/blog/authors/rodrigo-leal) - Principal

[Genevieve Broadhead](https://www.mongodb.com/blog/authors/genevieve-broadhead) - Global lead, retail solutions

[Angie Guemes](https://www.mongodb.com/developer/author/angie-guemes-estrada/) – Developer & Maintainer 

[Florencia Arin](https://www.mongodb.com/blog/authors/florencia-arin) – Developer & Maintainer 
