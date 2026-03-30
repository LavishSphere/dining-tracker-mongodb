# dining-tracker-mongodb
## MongoDB document database project for the dining tracker assignment

### By: Ashsmith Khayrul

## Overview
This repository contains the deliverables for the MongoDB version of the dining tracker project. It includes the assignment write-up, UML and ERD diagrams, document model definitions, sample data, and MongoDB query examples.

## Deliverables
- [app.js](app.js): basic Node + Express CRUD application for MongoDB.
- [package.json](package.json): project metadata and runtime dependencies.
- [requirements.pdf](requirements.pdf): written requirements document for the project submission.
- [uml.png](uml.png): UML class diagram image required by the assignment.
- [erd.png](erd.png): ERD image for the logical/document model.
- [definition_documents_collections.md](definition_documents_collections.md): document and collection definitions with sample JSON objects.
- [users.json](users.json): separate import file for the users collection.
- [menu_items.json](menu_items.json): separate import file for the menu_items collection.
- [dining_locations.json](dining_locations.json): separate import file for the dining_locations collection.
- [menu_snapshots.json](menu_snapshots.json): separate import file for the menu_snapshots collection.
- [schema.json](schema.json): sample extended JSON data for the MongoDB collections.
- [data.json](data.json): original bundled JSON data file included in the workspace.
- [queries.js](queries.js): MongoDB query examples used to demonstrate the database.
- [LICENSE](LICENSE): project license.

## Data Model Summary
The main root collections are users, menu_items, dining_locations, and menu_snapshots. Related data is embedded where it makes sense for MongoDB, such as dietary goals under users, meal periods under dining locations, and offerings under menu snapshots.

## How to Use the Files
1. Review the diagrams in [uml.png](uml.png) and [erd.png](erd.png).
2. Read the document design in [definition_documents_collections.md](definition_documents_collections.md).
3. Load the sample data from the collection files (`users.json`, `menu_items.json`, `dining_locations.json`, `menu_snapshots.json`) into MongoDB.
4. Run the examples in [queries.js](queries.js) after connecting it to your local MongoDB instance.

### Import Example
```bash
mongoimport --db nutrition_tracker_db --collection users --file users.json --jsonArray
mongoimport --db nutrition_tracker_db --collection menu_items --file menu_items.json --jsonArray
mongoimport --db nutrition_tracker_db --collection dining_locations --file dining_locations.json --jsonArray
mongoimport --db nutrition_tracker_db --collection menu_snapshots --file menu_snapshots.json --jsonArray
```

## Node + Express App
The basic app lives in [app.js](app.js) and uses dependencies declared in [package.json](package.json). It supports create, display, edit, and delete operations for two collections: users and menu_items.

### Run It
1. Install dependencies with npm install.
2. Make sure MongoDB is running locally.
3. Start the app with npm start.
4. Open http://localhost:3000 in your browser.

The app uses the local database name nutrition_tracker_db by default. You can override the connection with MONGO_URL and MONGO_DB environment variables if needed.

## Notes
- The repository is organized to match the assignment requirements directly.
- If your instructor expects the diagrams to appear inside the PDF submission, you can reference [uml.png](uml.png) and [erd.png](erd.png) there as embedded images.

## Assignment Checklist
1. Problem requirements and conceptual model in UML
   - Covered by [requirements.pdf](requirements.pdf) and [uml.png](uml.png).

2. Logical data model adapted for MongoDB
   - Reflected in [erd.png](erd.png) and the hierarchical collection design documented in [definition_documents_collections.md](definition_documents_collections.md).

3. Main collections with example JSON objects
   - Documented in [definition_documents_collections.md](definition_documents_collections.md).

4. Test data and database initialization files
   - Provided in [schema.json](schema.json) and [data.json](data.json).

5. Five MongoDB queries
   - Implemented in [queries.js](queries.js).

6. Optional Node + Express application
   - Implemented in [app.js](app.js) and configured by [package.json](package.json).